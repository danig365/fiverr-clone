from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from notifications.models import Notification
from django.core.mail import send_mail
from django.conf import settings


def send_notification_email(user, subject, message):
    """Helper function to safely send emails if user has email."""
    if not user.email:
        return
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


@receiver(post_save, sender=Order)
def order_status_notifications(sender, instance, created, **kwargs):
    if created:
        # New order placed → notify seller
        Notification.objects.create(
            user=instance.seller,
            type="order_placed",
            message=f"You have a new order from {instance.buyer.username} for {instance.gig.title}."
        )
        send_notification_email(
            instance.seller,
            "New Order Received",
            f"Hello {instance.seller.username}, you received a new order from {instance.buyer.username} "
            f"for {instance.gig.title}."
        )

    else:
        # Delivered
        if instance.status == Order.STATUS_DELIVERED:
            Notification.objects.create(
                user=instance.buyer,
                type="order_delivered",
                message=f"Your order {instance.id} has been delivered by {instance.seller.username}."
            )
            send_notification_email(
                instance.buyer,
                "Order Delivered",
                f"Hello {instance.buyer.username}, your order {instance.id} has been delivered."
            )

        # Accepted
        elif instance.status == Order.STATUS_ACCEPTED:
            Notification.objects.create(
                user=instance.seller,
                type="order_accepted",
                message=f"{instance.buyer.username} has accepted your delivery for order {instance.id}."
            )
            send_notification_email(
                instance.seller,
                "Delivery Accepted",
                f"Hello {instance.seller.username}, your delivery for order {instance.id} was accepted by "
                f"{instance.buyer.username}."
            )

        # Rejected → goes back to pending
        elif instance.status == Order.STATUS_PENDING:
            Notification.objects.create(
                user=instance.seller,
                type="order_rejected",
                message=f"{instance.buyer.username} rejected the delivery for order {instance.id}."
            )
            send_notification_email(
                instance.seller,
                "Delivery Rejected",
                f"Hello {instance.seller.username}, {instance.buyer.username} rejected your delivery "
                f"for order {instance.id}. Please deliver again."
            )

        # Completed (payment done)
        elif instance.status == Order.STATUS_COMPLETED:
            Notification.objects.create(
                user=instance.buyer,
                type="order_paid",
                message=f"Payment completed for order {instance.id}. Thank you!"
            )
            Notification.objects.create(
                user=instance.seller,
                type="order_paid",
                message=f"Payment received for order {instance.id} from {instance.buyer.username}."
            )

            # Emails for both buyer & seller
            send_notification_email(
                instance.buyer,
                "Order Completed",
                f"Hello {instance.buyer.username}, your payment for order {instance.id} has been processed successfully."
            )
            send_notification_email(
                instance.seller,
                "Order Paid",
                f"Hello {instance.seller.username}, you have received payment for order {instance.id} "
                f"from {instance.buyer.username}."
            )
