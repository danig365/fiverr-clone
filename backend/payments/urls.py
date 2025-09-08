from django.urls import path
from .views import CreateCheckoutSessionView, StripeWebhookView, payment_success, payment_cancel,PaymentVerifyView


urlpatterns = [
    path("create-checkout-session/", CreateCheckoutSessionView.as_view(), name="create-checkout-session"),
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
     path("success/", payment_success, name="payment-success"),
    path("cancel/", payment_cancel, name="payment-cancel"),
    path("verify/", PaymentVerifyView.as_view(), name="payment-verify"),
]
