from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q

from .models import Conversation, Message
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    MessageSerializer,
)
from .permissions import IsParticipant


class MessageThrottle(UserRateThrottle):
    scope = "messages"


class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all().prefetch_related("participants", "messages")
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["updated_at", "created_at"]

    def get_permissions(self):
        if self.action in ["list", "create"]:
            return [IsAuthenticated()]
        # object-level actions require participant
        return [IsAuthenticated(), IsParticipant()]

    def get_serializer_class(self):
        if self.action in ["list"]:
            return ConversationListSerializer
        if self.action in ["retrieve"]:
            return ConversationDetailSerializer
        return ConversationListSerializer

    def get_queryset(self):
        # limit to conversations where user is a participant
        user = self.request.user
        if user.is_anonymous:
            return Conversation.objects.none()
        return Conversation.objects.filter(participants=user, is_active=True)

    def perform_create(self, serializer):
        request = self.request
        participants = request.data.get("participants", [])
        if isinstance(participants, str):
            participants = [int(x.strip()) for x in participants.split(",") if x.strip()]
        if not isinstance(participants, (list, tuple)):
            participants = []

        # Always include request.user
        all_ids = set(participants + [request.user.id])

        # Check if conversation already exists with same participants
        existing = (
            Conversation.objects.filter(participants__in=all_ids, is_active=True)
            .annotate(count=Count("participants"))
            .filter(count=len(all_ids))
            .distinct()
        )
        for conv in existing:
            ids = set(conv.participants.values_list("id", flat=True))
            if ids == all_ids:
                return conv  # return existing conversation

        # Otherwise create new
        conv = Conversation.objects.create(subject=request.data.get("subject"))
        for uid in all_ids:
            conv.participants.add(uid)
        conv.save()
        return conv


    def create(self, request, *args, **kwargs):
        conv = self.perform_create(None)
        serializer = ConversationDetailSerializer(conv, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], throttle_classes=[MessageThrottle])
    def send_message(self, request, pk=None):
        conv = self.get_object()
        # permission check (IsParticipant) already applied by get_permissions
        data = request.data.copy()
        data["conversation"] = conv.id
        serializer = MessageSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        msg = serializer.save()
        # update conversation timestamp
        conv.save()
        return Response(MessageSerializer(msg, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        """
        Mark all messages in this conversation as read for the requesting user
        (only marks messages not sent by the request.user).
        """
        conv = self.get_object()
        # ensure participant
        self.check_object_permissions(request, conv)
        msgs = conv.messages.filter(is_read=False).exclude(sender=request.user)
        updated = msgs.update(is_read=True)
        return Response({"marked": updated}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """
        Returns total unread messages for the current user (not counting messages they sent)
        and per-conversation unread counts.
        """
        user = request.user
        if user.is_anonymous:
            return Response({"total_unread": 0, "conversations": []})
        # total unread across conversations where user is participant and sender != user
        total_unread = Message.objects.filter(conversation__participants=user, is_read=False).exclude(sender=user).count()
        # per-conversation counts
        conv_counts = (
            Conversation.objects.filter(participants=user)
            .annotate(unread=Count("messages", filter=Q(messages__is_read=False) & ~Q(messages__sender=user)))
            .values("id", "subject", "unread", "updated_at")
            .order_by("-updated_at")
        )
        return Response({"total_unread": total_unread, "conversations": list(conv_counts)}, status=status.HTTP_200_OK)


class MessageViewSet(viewsets.GenericViewSet):
    """
    Minimal viewset to list messages in a conversation or create messages (alternate path).
    For most uses, use ConversationViewSet.send_message.
    """
    queryset = Message.objects.all().select_related("sender", "conversation")
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsParticipant]

    def list(self, request, *args, **kwargs):
        conv_id = request.query_params.get("conversation")
        if not conv_id:
            return Response({"detail": "conversation query param required"}, status=status.HTTP_400_BAD_REQUEST)
        conv = get_object_or_404(Conversation, pk=conv_id)
        # object permission
        self.check_object_permissions(request, conv)
        qs = conv.messages.all().select_related("sender")
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = MessageSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = MessageSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)
