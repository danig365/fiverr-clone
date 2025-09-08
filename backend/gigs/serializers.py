from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Gig, Tag, Category, GigImage

User = get_user_model()


class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "is_seller")


class GigImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = GigImage
        fields = ("id", "image", "image_url", "alt_text")
        extra_kwargs = {"image": {"write_only": True}}

    def get_image_url(self, obj):
        request = self.context.get("request", None)
        if obj.image and hasattr(obj.image, "url"):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class GigListSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    thumbnail_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Gig
        fields = (
            "id",
            "title",
            "slug",
            "price",
            "delivery_time",
            "revisions",
            "thumbnail_url",
            "seller",
            "created_at",
            "is_active",
        )

    def get_thumbnail_url(self, obj):
        request = self.context.get("request", None)
        if obj.thumbnail and hasattr(obj.thumbnail, "url"):
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None


class GigDetailSerializer(GigListSerializer):
    description = serializers.CharField(read_only=True)
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")
    images = GigImageSerializer(many=True, read_only=True)
    category = serializers.SerializerMethodField(read_only=True)

    class Meta(GigListSerializer.Meta):
        model = Gig
        fields = GigListSerializer.Meta.fields + ("description", "tags", "images", "category")

    def get_category(self, obj):
        return obj.category.name if obj.category else None


class GigCreateSerializer(serializers.ModelSerializer):
    # Accept tags as a list of strings (names)
    tags = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    # Accept thumbnail as multipart file
    thumbnail = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Gig
        # ✅ include id & slug so frontend can use them
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "price",
            "delivery_time",
            "revisions",
            "category",
            "tags",
            "thumbnail",
        )
        read_only_fields = ("id", "slug")

    def validate_price(self, value):
        if value < Decimal("5.00"):
            raise serializers.ValidationError("Minimum price is 5.00")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            raise serializers.ValidationError("Authentication required to create a gig.")
        if not getattr(request.user, "is_seller", False):
            raise serializers.ValidationError("Only users with seller role can create gigs.")
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        tags = validated_data.pop("tags", [])
        gig = Gig.objects.create(**validated_data)  # ❌ removed seller=request.user
        for t in tags:
            if not t:
                continue
            name = str(t).strip()
            tag_obj, _ = Tag.objects.get_or_create(name=name)
            gig.tags.add(tag_obj)
        return gig
