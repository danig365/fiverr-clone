# notifications/utils.py
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification

def notify(user, type, message, send_email=True):
    """
    Create in-app notification + send email.
    """
    # In-app
    Notification.objects.create(
        user=user,
        type=type,
        message=message
    )

    # Email
    if send_email and user.email:
        subject = f"[FreelanceHub] {dict(Notification.TYPE_CHOICES).get(type, 'Notification')}"
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True,
        )
