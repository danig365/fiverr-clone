# backend/reviews/urls.py
from django.urls import path
from .views import (
    CreateReviewView,
    GigReviewsListView,
    UserCompletedOrdersForReviewView,
    gig_review_stats,
    can_review_gig,
    delete_review
)

urlpatterns = [
    # Create a review
    path('reviews/', CreateReviewView.as_view(), name='create-review'),
    
    # Get all reviews for a gig
    path('gigs/<slug:gig_slug>/reviews/', GigReviewsListView.as_view(), name='gig-reviews'),
    
    # Get review statistics for a gig
    path('gigs/<slug:gig_slug>/reviews/stats/', gig_review_stats, name='gig-review-stats'),
    
    # Check if user can review a gig
    path('gigs/<slug:gig_slug>/can-review/', can_review_gig, name='can-review-gig'),
    
    # Get user's completed orders that can be reviewed
    path('my-orders/reviewable/', UserCompletedOrdersForReviewView.as_view(), name='reviewable-orders'),
    
    # Delete a review
    path('reviews/<int:review_id>/', delete_review, name='delete-review'),
]