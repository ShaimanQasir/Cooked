from rest_framework import permissions


class IsVerified(permissions.BasePermission):
    """Allow access only to users that are authenticated and verified.

    This permission checks the User model's `is_verified` attribute. It also
    allows using the token payload if needed (request.auth) but prefers
    the `request.user` object which is set by JWTAuthentication.
    """

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            return getattr(user, "is_verified", False)
        return False
