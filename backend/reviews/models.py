# backend/reviews/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from gigs.models import Gig
from orders.models import Order


class Review(models.Model):
    # Who wrote the review
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_given"
    )
    
    # What gig is being reviewed
    gig = models.ForeignKey(
        Gig,
        on_delete=models.CASCADE,
        related_name="reviews"
    )
    
    # Which completed order this review is for (ensures one review per order)
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="review",
        unique=True
    )
    
    # Review content
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["gig", "-created_at"]),
            models.Index(fields=["reviewer"]),
        ]
        # Ensure one review per order
        constraints = [
            models.UniqueConstraint(
                fields=['reviewer', 'order'],
                name='unique_review_per_order'
            )
        ]

    def __str__(self):
        return f"{self.rating}★ review by {self.reviewer.username} for {self.gig.title}"

    def save(self, *args, **kwargs):
        # Ensure the order is completed and belongs to the reviewer
        if self.order.status != Order.STATUS_COMPLETED:
            raise ValueError("Can only review completed orders")
        
        if self.order.buyer != self.reviewer:
            raise ValueError("Only the buyer of the order can review")
            
        if self.order.gig != self.gig:
            raise ValueError("Order must be for the gig being reviewed")
            
        super().save(*args, **kwargs)