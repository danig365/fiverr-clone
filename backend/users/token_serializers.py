# backend/users/token_serializers.py  (replace content)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class VerifiedTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["is_seller"] = user.is_seller
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if not user.is_verified:
            raise serializers.ValidationError({"detail":"email not verified"})
        # add role and capability to response payload
        data["role"] = user.role
        data["is_seller"] = user.is_seller
        return data
