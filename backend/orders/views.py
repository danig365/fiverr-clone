from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderCreateSerializer, OrderListSerializer
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from .serializers import OrderCreateSerializer

class OrderViewSet(viewsets.GenericViewSet):
    """
    create: buyer places an order (status -> pending)
    list: buyers see their orders; sellers see orders received
    retrieve: get one order (buyer or seller)
    partial_update: allow status updates with permission checks
    """

    queryset = Order.objects.all()
    permission_classes = [IsAuthenticated]
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def deliver(self, request, pk=None):
        order = self.get_object()

        # Only seller can deliver
        if order.seller != request.user:
            return Response({"detail": "Only the seller can deliver this order."}, status=403)

        if order.status != Order.STATUS_PENDING:
            return Response({"detail": "Order must be pending to be delivered."}, status=400)

        order.status = Order.STATUS_DELIVERED
        order.save(update_fields=["status", "updated_at"])

        return Response(OrderCreateSerializer(order).data)


    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        order = self.get_object()
        if request.user != order.buyer:
            return Response({"detail": "Only buyer can reject"}, status=status.HTTP_403_FORBIDDEN)
        order.status = Order.STATUS_PENDING
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderListSerializer(order, context={"request": request}).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        order = self.get_object()
        if request.user != order.buyer:
            return Response({"detail": "Only buyer can accept"}, status=status.HTTP_403_FORBIDDEN)
        if order.status != Order.STATUS_DELIVERED:
            return Response({"detail": "Order must be delivered first"}, status=status.HTTP_400_BAD_REQUEST)
        order.status = Order.STATUS_ACCEPTED
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderListSerializer(order, context={"request": request}).data)

    
    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderListSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "is_seller", False) and user.role == "seller":
            # seller sees orders received
            return Order.objects.filter(seller=user)
        # buyers see their own orders
        return Order.objects.filter(buyer=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        out_serializer = OrderListSerializer(order, context={"request": request})
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset().select_related("gig", "buyer", "seller")
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = OrderListSerializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)
        serializer = OrderListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        # ensure buyer or seller only can view
        if request.user != obj.buyer and request.user != obj.seller:
            return Response(
                {"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN
            )
        serializer = OrderListSerializer(obj, context={"request": request})
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        """
        Allow limited status changes:
        - seller: paid -> in_progress -> delivered
        - buyer: pending -> cancelled, delivered -> completed
        """
        obj = get_object_or_404(Order, pk=pk)
        user = request.user
        new_status = request.data.get("status")
        allowed = False

        if user == obj.seller:
            if (
                obj.status == Order.STATUS_PAID
                and new_status == Order.STATUS_IN_PROGRESS
            ):
                allowed = True
            elif (
                obj.status == Order.STATUS_IN_PROGRESS
                and new_status == Order.STATUS_DELIVERED
            ):
                allowed = True

        elif user == obj.buyer:
            if (
                obj.status == Order.STATUS_PENDING
                and new_status == Order.STATUS_CANCELLED
            ):
                allowed = True
            elif (
                obj.status == Order.STATUS_DELIVERED
                and new_status == Order.STATUS_COMPLETED
            ):
                allowed = True

        if not allowed:
            return Response(
                {"detail": "Not allowed to set this status."},
                status=status.HTTP_403_FORBIDDEN,
            )

        obj.status = new_status
        obj.save(update_fields=["status", "updated_at"])
        serializer = OrderListSerializer(obj, context={"request": request})
        return Response(serializer.data)
