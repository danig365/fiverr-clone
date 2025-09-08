from rest_framework import serializers
from .models import Order
from gigs.serializers import GigListSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class OrderCreateSerializer(serializers.ModelSerializer):
    gig_id = serializers.IntegerField(write_only=True, required=True)
    instructions = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )

    class Meta:
        model = Order
        fields = ("id", "gig_id", "instructions")

    def validate_gig_id(self, value):
        from gigs.models import Gig

        try:
            Gig.objects.get(pk=value)
        except Gig.DoesNotExist:
            raise serializers.ValidationError("Gig does not exist.")
        return value

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user
        from gigs.models import Gig

        gig = Gig.objects.get(pk=validated_data["gig_id"])
        if not getattr(user, "is_authenticated", False):
            raise serializers.ValidationError("Authentication required.")
        if user.id == gig.seller_id:
            raise serializers.ValidationError("Cannot order your own gig.")
        # create order using gig price snapshot
        order = Order.objects.create(
            buyer=user,
            seller=gig.seller,
            gig=gig,
            price=gig.price,
            instructions=validated_data.get("instructions", ""),
            status=Order.STATUS_PENDING,
        )
        return order


class OrderListSerializer(serializers.ModelSerializer):
    gig = GigListSerializer(read_only=True)
    buyer = serializers.SerializerMethodField()
    seller = serializers.SerializerMethodField()
    is_buyer = serializers.SerializerMethodField()
    is_seller = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "gig",
            "price",
            "status",
            "instructions",
            "created_at",
            "buyer",
            "seller",
            "is_buyer",
            "is_seller",
        )

    def get_buyer(self, obj):
        return {"id": obj.buyer.id, "username": obj.buyer.username, "email": obj.buyer.email}

    def get_seller(self, obj):
        return {"id": obj.seller.id, "username": obj.seller.username, "email": obj.seller.email}

    def get_is_buyer(self, obj):
        request = self.context.get("request")
        return request.user == obj.buyer

    def get_is_seller(self, obj):
        request = self.context.get("request")
        return request.user == obj.seller
