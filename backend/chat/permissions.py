from rest_framework import permissions


class IsParticipant(permissions.BasePermission):
    """
    Allows access only to participants of the conversation.
    For object-level checks (Conversation or Message via related conversation).
    """

    def has_object_permission(self, request, view, obj):
        # obj can be Conversation or Message
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if hasattr(obj, "participants"):
            return obj.participants.filter(pk=user.pk).exists()
        # Message -> check its conversation
        if hasattr(obj, "conversation"):
            return obj.conversation.participants.filter(pk=user.pk).exists()
        return False
