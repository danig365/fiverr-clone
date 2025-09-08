from django.db import models
from django.conf import settings
from decimal import Decimal
from django.core.validators import MinValueValidator
from gigs.models import Gig

User = settings.AUTH_USER_MODEL

class Order(models.Model):
    STATUS_PENDING = "pending"
    STATUS_DELIVERED = "delivered"
    STATUS_ACCEPTED = "accepted"
    STATUS_COMPLETED = "completed"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_DELIVERED, "Delivered"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_COMPLETED, "Completed"),
    ]

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders_made"
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders_received"
    )
    gig = models.ForeignKey(Gig, on_delete=models.SET_NULL, null=True, related_name="orders")
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=STATUS_PENDING)
    instructions = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["buyer", "seller", "status"])]

    def __str__(self):
        return f"Order #{self.pk} - {self.gig} - {self.buyer} -> {self.seller}"
