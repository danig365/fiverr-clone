from django.db import models
from django.conf import settings
from orders.models import Order

class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_payment_intent = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    currency = models.CharField(max_length=10, default="usd")
    status = models.CharField(max_length=50, default="created")  # created, succeeded, failed
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for order {self.order_id} - {self.status}"
