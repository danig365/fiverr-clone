from django.contrib import admin
from .models import Order

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "gig", "buyer", "seller", "price", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("buyer__email", "seller__email", "gig__title")
