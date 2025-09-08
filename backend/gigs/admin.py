from django.contrib import admin
from .models import Gig, Tag, Category, GigImage


@admin.register(Gig)
class GigAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "seller", "price", "delivery_time", "is_active", "created_at")
    search_fields = ("title", "seller__email", "seller__username")
    list_filter = ("is_active", "category")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug")
    search_fields = ("name",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug")
    search_fields = ("name",)


@admin.register(GigImage)
class GigImageAdmin(admin.ModelAdmin):
    list_display = ("id", "gig", "uploaded_at")
    readonly_fields = ("uploaded_at",)
