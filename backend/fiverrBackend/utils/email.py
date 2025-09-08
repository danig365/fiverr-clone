from django.core.mail import send_mail, BadHeaderError
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_simple_email(subject, message, recipient):
    try:
        logger.debug("Preparing to send email...")
        logger.debug(f"Subject: {subject}")
        logger.debug(f"Message: {message}")
        logger.debug(f"Recipient: {recipient}")
        logger.debug(f"From: {settings.DEFAULT_FROM_EMAIL}")
        logger.debug(f"SMTP Host: {settings.EMAIL_HOST}")
        logger.debug(f"SMTP User: {settings.EMAIL_HOST_USER}")

        sent_count = send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )

        if sent_count == 0:
            logger.error("Email not sent! send_mail returned 0.")
        else:
            logger.info(f"Email successfully sent to {recipient}")

    except BadHeaderError:
        logger.error("Invalid header found while sending email.")
    except Exception as e:
        logger.exception(f"Error while sending email: {str(e)}")
