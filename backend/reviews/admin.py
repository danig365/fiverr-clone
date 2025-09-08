# backend/reviews/admin.py
from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'gig', 'reviewer', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['gig__title', 'reviewer__username', 'reviewer__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('reviewer', 'gig', 'order', 'rating', 'comment')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )