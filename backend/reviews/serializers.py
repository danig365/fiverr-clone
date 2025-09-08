# backend/reviews/serializers.py
from rest_framework import serializers
from .models import Review
from orders.models import Order
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'reviewer', 'reviewer_username', 'gig', 'order', 
            'rating', 'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reviewer', 'created_at', 'updated_at']

    def validate(self, data):
        request = self.context['request']
        user = request.user
        order = data['order']
        gig = data['gig']

        # Check if order is completed
        if order.status != Order.STATUS_COMPLETED:
            raise serializers.ValidationError("Can only review completed orders")

        # Check if user is the buyer of the order
        if order.buyer != user:
            raise serializers.ValidationError("Only the buyer can review this order")

        # Check if order is for the gig being reviewed
        if order.gig != gig:
            raise serializers.ValidationError("Order must be for the gig being reviewed")

        # Check if review already exists for this order
        if Review.objects.filter(order=order).exists():
            raise serializers.ValidationError("Review already exists for this order")

        return data

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


class ReviewDisplaySerializer(serializers.ModelSerializer):
    """Serializer for displaying reviews (read-only)"""
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)
    reviewer_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'reviewer_username', 'reviewer_avatar', 'rating', 
            'comment', 'created_at'
        ]

    def get_reviewer_avatar(self, obj):
        # Return first letter of username for avatar
        return obj.reviewer.username[0].upper() if obj.reviewer.username else 'U'


class CompletedOrderForReviewSerializer(serializers.ModelSerializer):
    """Serializer to show completed orders that can be reviewed"""
    gig_title = serializers.CharField(source='gig.title', read_only=True)
    gig_slug = serializers.CharField(source='gig.slug', read_only=True)
    has_review = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'gig', 'gig_title', 'gig_slug', 'price', 
            'created_at', 'has_review'
        ]

    def get_has_review(self, obj):
        return hasattr(obj, 'review')