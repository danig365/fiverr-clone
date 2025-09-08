import os
from django.conf import settings
from django.core.signing import dumps, loads, BadSignature, SignatureExpired
from django.urls import reverse
from rest_framework.views import APIView
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from fiverrBackend.utils.email import send_simple_email
from rest_framework import serializers

User = get_user_model()

SIGN_SALT_EMAIL = "email-vering-salt"
SIGN_SALT_PWD = "password-reset-salt"
FRONTEND_HOST = os.environ.get("FRONTEND_HOST", "http://localhost:5173")
EMAIL_TOKEN_MAX_AGE = int(os.environ.get("EMAIL_TOKEN_MAX_AGE", 3600))
PASSWORD_RESET_TOKEN_MAX_AGE = int(os.environ.get("PASSWORD_RESET_TOKEN_MAX_AGE", 3600))

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    def perform_create(self, serializer):
        user = serializer.save()
        token = dumps({"user_id": user.id}, salt=SIGN_SALT_EMAIL)
        link = f"{FRONTEND_HOST}/verify-email?token={token}"
        send_simple_email("Verify your email", f"Click to verify: {link}", user.email)

class VerifyEmailView(APIView):
    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"detail":"token required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            data = loads(token, salt=SIGN_SALT_EMAIL, max_age=EMAIL_TOKEN_MAX_AGE)
            uid = data.get("user_id")
            user = User.objects.filter(id=uid).first()
            if not user:
                return Response({"detail":"invalid token"}, status=status.HTTP_400_BAD_REQUEST)
            if user.is_verified:
                return Response({"detail":"already verified"}, status=status.HTTP_200_OK)
            user.is_verified = True
            user.save()
            return Response({"detail":"verified"})
        except SignatureExpired:
            return Response({"detail":"token expired"}, status=status.HTTP_400_BAD_REQUEST)
        except BadSignature:
            return Response({"detail":"invalid token"}, status=status.HTTP_400_BAD_REQUEST)

class ResendVerifyView(APIView):
    def post(self, request):
        email = request.data.get("email")
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail":"no user"}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_verified:
            return Response({"detail":"already verified"}, status=status.HTTP_200_OK)
        token = dumps({"user_id": user.id}, salt=SIGN_SALT_EMAIL)
        link = f"{FRONTEND_HOST}/verify-email?token={token}"
        send_simple_email("Verify your email", f"Click to verify: {link}", user.email)
        return Response({"detail":"sent"})

from rest_framework_simplejwt.tokens import RefreshToken

class LogoutView(APIView):
    def post(self, request):
        # Optional: front-end can simply drop tokens.
        # If you want to blacklist refresh tokens: accept refresh and blacklist
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        return Response(status=status.HTTP_204_NO_CONTENT)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

class PasswordResetRequestView(APIView):
    def post(self, request):
        s = PasswordResetRequestSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        email = s.validated_data["email"]
        user = User.objects.filter(email=email).first()
        if user:
            token = dumps({"user_id": user.id}, salt=SIGN_SALT_PWD)
            link = f"{FRONTEND_HOST}/reset-password?token={token}"
            send_simple_email("Password reset", f"Reset link: {link}", user.email)
        return Response({"detail":"If that email exists, a reset link was sent."})

class PasswordResetConfirmView(APIView):
    def post(self, request):
        s = PasswordResetConfirmSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        token = s.validated_data["token"]
        new_password = s.validated_data["new_password"]
        try:
            data = loads(token, salt=SIGN_SALT_PWD, max_age=PASSWORD_RESET_TOKEN_MAX_AGE)
            uid = data.get("user_id")
            user = User.objects.filter(id=uid).first()
            if not user:
                return Response({"detail":"invalid token"}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)
            user.save()
            return Response({"detail":"password set"})
        except SignatureExpired:
            return Response({"detail":"token expired"}, status=status.HTTP_400_BAD_REQUEST)
        except BadSignature:
            return Response({"detail":"invalid token"}, status=status.HTTP_400_BAD_REQUEST)
class SwitchRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=[("buyer","Buyer"), ("seller","Seller")])

class BecomeSellerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_seller:
            return Response({"detail":"already a seller", "is_seller": True}, status=status.HTTP_200_OK)
        # Optionally: require extra checks / profile data before enabling seller; for now enable directly
        user.is_seller = True
        user.save(update_fields=["is_seller"])
        return Response({"detail":"seller_enabled", "is_seller": True}, status=status.HTTP_200_OK)

class SwitchRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        s = SwitchRoleSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        new_role = s.validated_data["role"]
        user = request.user
        if new_role == "seller" and not user.is_seller:
            return Response({"detail":"user is not a seller"}, status=status.HTTP_403_FORBIDDEN)
        user.role = new_role
        user.save(update_fields=["role"])
        return Response({"role": new_role})