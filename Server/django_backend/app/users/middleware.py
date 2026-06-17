from django.conf import settings

class JWTAuthCookieMiddleware:
    """If an `access` cookie exists, set the Authorization header so
    DRF's JWTAuthentication can pick it up from headers.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access = request.COOKIES.get("access")
        if access and not request.META.get("HTTP_AUTHORIZATION"):
            request.META["HTTP_AUTHORIZATION"] = f"Bearer {access}"
        return self.get_response(request)
