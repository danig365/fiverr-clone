from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "amount", "status", "created_at")
    search_fields = ("order__id", "stripe_session_id", "stripe_payment_intent")
