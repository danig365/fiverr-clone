# backend/reviews/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count, Q

from .models import Review
from .serializers import (
    ReviewSerializer, 
    ReviewDisplaySerializer, 
    CompletedOrderForReviewSerializer
)
from orders.models import Order
from gigs.models import Gig


class CreateReviewView(generics.CreateAPIView):
    """Create a new review for a completed order"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(reviewer=self.request.user)


class GigReviewsListView(generics.ListAPIView):
    """List all reviews for a specific gig"""
    serializer_class = ReviewDisplaySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        gig_slug = self.kwargs['gig_slug']
        gig = get_object_or_404(Gig, slug=gig_slug)
        return Review.objects.filter(gig=gig).select_related('reviewer')


class UserCompletedOrdersForReviewView(generics.ListAPIView):
    """List user's completed orders that can be reviewed"""
    serializer_class = CompletedOrderForReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            buyer=self.request.user,
            status=Order.STATUS_COMPLETED
        ).select_related('gig').prefetch_related('review')


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def gig_review_stats(request, gig_slug):
    """Get review statistics for a gig"""
    gig = get_object_or_404(Gig, slug=gig_slug)
    
    stats = Review.objects.filter(gig=gig).aggregate(
        average_rating=Avg('rating'),
        total_reviews=Count('id'),
        five_star=Count('id', filter=Q(rating=5)),
        four_star=Count('id', filter=Q(rating=4)),
        three_star=Count('id', filter=Q(rating=3)),
        two_star=Count('id', filter=Q(rating=2)),
        one_star=Count('id', filter=Q(rating=1)),
    )
    
    # Round average rating to 1 decimal place
    if stats['average_rating']:
        stats['average_rating'] = round(stats['average_rating'], 1)
    else:
        stats['average_rating'] = 0
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def can_review_gig(request, gig_slug):
    """Check if current user can review this gig and return available orders"""
    gig = get_object_or_404(Gig, slug=gig_slug)
    
    # Get user's completed orders for this gig that don't have reviews yet
    reviewable_orders = Order.objects.filter(
        buyer=request.user,
        gig=gig,
        status=Order.STATUS_COMPLETED
    ).exclude(
        id__in=Review.objects.filter(gig=gig, reviewer=request.user).values_list('order_id', flat=True)
    )
    
    return Response({
        'can_review': reviewable_orders.exists(),
        'reviewable_orders': [
            {
                'id': order.id,
                'price': order.price,
                'created_at': order.created_at,
            }
            for order in reviewable_orders
        ]
    })


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_review(request, review_id):
    """Delete a review (only by the reviewer)"""
    review = get_object_or_404(Review, id=review_id, reviewer=request.user)
    review.delete()
    return Response({'message': 'Review deleted successfully'}, status=status.HTTP_204_NO_CONTENT)