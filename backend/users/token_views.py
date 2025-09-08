# backend/users/token_views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from .token_serializers import VerifiedTokenObtainPairSerializer

class VerifiedTokenObtainPairView(TokenObtainPairView):
    serializer_class = VerifiedTokenObtainPairSerializer
