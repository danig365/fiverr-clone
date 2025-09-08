import json
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from orders.models import Order
from .models import Payment
import stripe
from django.views.decorators.csrf import csrf_exempt

from rest_framework.response import Response

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return JsonResponse({"detail": "order_id required"}, status=400)
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return JsonResponse({"detail": "Order not found"}, status=404)

        # Only the buyer who created the order can create a checkout session
        if order.buyer != request.user:
            return JsonResponse({"detail": "Not authorized"}, status=403)

        # if order.status != Order.STATUS_PENDING:
        #     return JsonResponse({"detail": "Order not in pending state"}, status=400)
        if order.status != Order.STATUS_ACCEPTED:
            return JsonResponse(
                {"detail": "Order must be accepted by buyer before payment"}, status=400
            )


        # Create or update local Payment record
        payment, _ = Payment.objects.get_or_create(order=order)
        try:
            # Create a Checkout Session
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="payment",
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {
                                "name": f"{order.gig.title} - Order #{order.id}",
                                "description": order.gig.description[:200],
                            },
                            "unit_amount": int(order.price * 100),  # cents
                        },
                        "quantity": 1,
                    }
                ],
                success_url="http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
                cancel_url="http://localhost:5173/payment-cancel",
                metadata={"order_id": str(order.id)},
            )

        except stripe.error.StripeError as e:
            return JsonResponse({"detail": str(e)}, status=400)

        # Save session id
        payment.stripe_session_id = checkout_session.id
        payment.amount = order.price
        payment.currency = "usd"
        payment.status = "created"
        payment.save(
            update_fields=["stripe_session_id", "amount", "currency", "status"]
        )

        # Return session id for frontend to redirect
        return JsonResponse({"sessionId": checkout_session.id})


class StripeWebhookView(APIView):
    # Stripe webhooks are unauthenticated, so allow any but we verify signature
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        endpoint_secret = settings.STRIPE_ENDPOINT_SECRET

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError as e:
            # Invalid payload
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return HttpResponse(status=400)

        # Handle the checkout.session.completed event (payment successful)
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]

            # Fulfill the purchase: find order_id in metadata
            order_id = session.get("metadata", {}).get("order_id")
            if not order_id:
                # Nothing to do
                return HttpResponse(status=200)

            try:
                order = Order.objects.get(pk=order_id)
            except Order.DoesNotExist:
                return HttpResponse(status=200)

            # Update payment record
            payment, _ = Payment.objects.get_or_create(order=order)
            payment.stripe_session_id = session.get("id")
            payment.stripe_payment_intent = session.get("payment_intent")
            payment.status = "succeeded"
            payment.save(
                update_fields=["stripe_session_id", "stripe_payment_intent", "status"]
            )

            # payments/views.py → StripeWebhookView
            order.status = Order.STATUS_COMPLETED
            order.save(update_fields=["status", "updated_at"])

            # You may also notify seller via email / create activity logs here

        # Optionally handle other events: payment_intent.payment_failed, payment_intent.succeeded etc.

        return HttpResponse(status=200)


from django.shortcuts import render


def payment_success(request):
    session_id = request.GET.get("session_id")
    return HttpResponse(f"Payment successful! Session ID: {session_id}")


def payment_cancel(request):
    return HttpResponse("Payment was cancelled.")


# class PaymentVerifyView(APIView):
#     permission_classes = [AllowAny]  # can relax if you want only logged-in users

#     def get(self, request):
#         session_id = request.query_params.get("session_id")
#         if not session_id:
#             return Response({"error": "Missing session_id"}, status=400)


#         try:
#             session = stripe.checkout.Session.retrieve(session_id)
#             return Response({
#                 "id": session.id,
#                 "payment_status": session.payment_status,
#                 "amount_total": session.amount_total,
#                 "currency": session.currency,
#                 "order_id": session.metadata.get("order_id"),
#             })
#         except Exception as e:
#             return Response({"error": str(e)}, status=400)
class PaymentVerifyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        session_id = request.query_params.get("session_id")
        if not session_id:
            return Response({"error": "Missing session_id"}, status=400)

        try:
            session = stripe.checkout.Session.retrieve(session_id)
            order_id = session.metadata.get("order_id")

            if order_id:
                order = Order.objects.get(pk=order_id)
                payment, _ = Payment.objects.get_or_create(order=order)

                if session.payment_status in ["paid", "succeeded"]:
                    payment.status = "succeeded"
                    payment.stripe_session_id = session.id
                    payment.stripe_payment_intent = session.payment_intent
                    payment.save(
                        update_fields=[
                            "status",
                            "stripe_session_id",
                            "stripe_payment_intent",
                        ]
                    )

                    if order.status == Order.STATUS_ACCEPTED and session.payment_status in ["paid", "succeeded"]:
                        order.status = Order.STATUS_COMPLETED
                        order.save(update_fields=["status", "updated_at"])


            return Response(
                {
                    "id": session.id,
                    "payment_status": session.payment_status,
                    "amount_total": session.amount_total,
                    "currency": session.currency,
                    "order_id": order_id,
                }
            )

        except Exception as e:
            return Response({"error": str(e)}, status=400)
