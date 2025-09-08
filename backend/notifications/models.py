from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = [
        ("order_placed", "Order Placed"),
        ("order_delivered", "Order Delivered"),
        ("order_rejected", "Order Rejected"),
        ("order_accepted", "Order Accepted"),
        ("order_paid", "Order Paid"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.type}"
