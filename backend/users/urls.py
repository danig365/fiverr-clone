# backend/users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .token_views import VerifiedTokenObtainPairView

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("verify-email/", views.VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verify/", views.ResendVerifyView.as_view(), name="resend-verify"),
    path("login/", VerifiedTokenObtainPairView.as_view(), name="token_obtain_pair"),  # ✅ use custom
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", views.MeView.as_view(), name="me"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("password-reset/request/", views.PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password-reset/confirm/", views.PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    # New endpoints:
    path("become-seller/", views.BecomeSellerView.as_view(), name="become-seller"),
    path("switch-role/", views.SwitchRoleView.as_view(), name="switch-role"),
]