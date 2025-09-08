from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """
    A conversation between two or more users.
    For typical buyer-seller DM use, conversations will have 2 participants.
    """
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="conversations",
    )
    subject = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("-updated_at",)

    def __str__(self):
        pks = ",".join(str(p.pk) for p in self.participants.all()[:4])
        return f"Conversation({self.pk})[{pks}]"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages"
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self):
        return f"Message {self.pk} in conv {self.conversation_id} by {self.sender_id}"
