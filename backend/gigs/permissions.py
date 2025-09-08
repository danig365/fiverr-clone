from rest_framework import permissions


class IsSeller(permissions.BasePermission):
    """
    Allows access only to users flagged as sellers.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_seller)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission: only owner (seller) can update or delete.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user
