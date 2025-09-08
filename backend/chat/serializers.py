from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message

User = get_user_model()


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")


class MessageSerializer(serializers.ModelSerializer):
    sender = UserBriefSerializer(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Message
        fields = ("id", "conversation", "sender", "content", "is_read", "created_at")
        read_only_fields = ("id", "sender", "created_at")

    def validate_content(self, value):
        # Basic production-minded guard: limit message length
        max_len = 2000
        if value is None:
            raise serializers.ValidationError("Message content cannot be empty.")
        if len(value) > max_len:
            raise serializers.ValidationError(f"Message content too long (max {max_len} characters).")
        return value

    def create(self, validated_data):
        """
        Assign sender from request.user server-side. conversation must exist and
        the sender must be a participant (permission layer also enforces this).
        """
        request = self.context.get("request")
        if request is None or request.user.is_anonymous:
            raise serializers.ValidationError("Authentication required to send messages.")
        validated_data["sender"] = request.user
        return super().create(validated_data)


class ConversationListSerializer(serializers.ModelSerializer):
    participants = UserBriefSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ("id", "subject", "participants", "last_message", "updated_at", "created_at")

    def get_last_message(self, obj):
        last = obj.messages.order_by("-created_at").first()
        if not last:
            return None
        return {
            "id": last.id,
            "content": last.content,
            "sender": {"id": last.sender.id, "username": last.sender.username},
            "created_at": last.created_at,
            "is_read": last.is_read,
        }


class ConversationDetailSerializer(serializers.ModelSerializer):
    participants = UserBriefSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ("id", "subject", "participants", "messages", "created_at", "updated_at")
