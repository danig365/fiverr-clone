from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Gig, GigImage
from .serializers import (
    GigListSerializer,
    GigDetailSerializer,
    GigCreateSerializer,
    GigImageSerializer,
)
from .permissions import IsSeller, IsOwnerOrReadOnly


class GigViewSet(viewsets.ModelViewSet):
    # Updated queryset to include reviews prefetch
    queryset = Gig.objects.filter(is_active=True).select_related("seller", "category").prefetch_related(
        "tags", 
        "images", 
        "reviews__reviewer"  # This prefetches reviews with their reviewers
    )
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "tags__name", "category__name"]
    ordering_fields = ["price", "created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return GigListSerializer
        if self.action == "retrieve":
            return GigDetailSerializer
        if self.action in ["create", "update", "partial_update"]:
            return GigCreateSerializer
        return GigListSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [IsSeller()]
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsOwnerOrReadOnly()]
        return []

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def get_queryset(self):
        """Override get_queryset to ensure reviews are always prefetched"""
        queryset = super().get_queryset()
        
        # For retrieve action (gig detail), make sure reviews are prefetched
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related('reviews__reviewer')
            
        return queryset

    @action(detail=True, methods=["post"], permission_classes=[IsOwnerOrReadOnly])
    def upload_image(self, request, slug=None):
        gig = self.get_object()
        serializer = GigImageSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(gig=gig)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="by-seller/(?P<seller_id>[^/.]+)")
    def by_seller(self, request, seller_id=None):
        gigs = Gig.objects.filter(
            seller_id=seller_id, 
            is_active=True
        ).select_related("seller", "category").prefetch_related("tags", "images", "reviews__reviewer")
        
        page = self.paginate_queryset(gigs)
        if page is not None:
            serializer = GigListSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = GigListSerializer(gigs, many=True, context={"request": request})
        return Response(serializer.data)