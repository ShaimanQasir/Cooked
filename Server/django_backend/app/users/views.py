from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    ResendOTPSerializer,
    OTPVerifySerializer,
    LoginSerializer,
    OTPGenerateSerializer,
    UserSerializer,
    PasswordResetRequestSerializer,
    PasswordResetOTPVerifySerializer,
    PasswordResetConfirmSerializer,
)
from .permissions import IsVerified
from .utils import send_otp_email


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        generated_otp = serializer.context.get("generated_otp")
        if generated_otp:
            send_otp_email(user.email, generated_otp, context="verification")

        return Response({"detail": "OTP sent to your email."}, status=status.HTTP_201_CREATED)


class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.context.get("user")

        try:
            otp = user.generate_otp()
            send_otp_email(user.email, otp, context="verification")
            return Response({"detail": "OTP resent to your email."}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_429_TOO_MANY_REQUESTS)


class OTPVerifyView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"detail": "Email verified successfully."}, status=status.HTTP_200_OK)


class OTPGenerateView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = OTPGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.context.get("user")
        try:
            otp = user.generate_otp()
            send_otp_email(user.email, otp, context="verification")
            return Response({"detail": "OTP generated and sent to your email."}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_429_TOO_MANY_REQUESTS)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.context.get("user")

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        access["user_id"] = user.id
        access["email"] = user.email
        access["username"] = user.username
        access["is_verified"] = user.is_verified

        access_token = str(access)
        refresh_token = str(refresh)

        resp = Response({"detail": "Login successful."}, status=status.HTTP_200_OK)

        access_lifetime = settings.SIMPLE_JWT.get("ACCESS_TOKEN_LIFETIME")
        refresh_lifetime = settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME")

        access_max_age = int(access_lifetime.total_seconds()) if access_lifetime else None
        refresh_max_age = int(refresh_lifetime.total_seconds()) if refresh_lifetime else None

        secure_flag = not settings.DEBUG

        resp.set_cookie(
            key="access",
            value=access_token,
            httponly=True,
            secure=secure_flag,
            samesite="Lax",
            max_age=access_max_age,
        )
        resp.set_cookie(
            key="refresh",
            value=refresh_token,
            httponly=True,
            secure=secure_flag,
            samesite="Lax",
            max_age=refresh_max_age,
        )

        return resp


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        resp = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
        resp.delete_cookie("access")
        resp.delete_cookie("refresh")
        return resp


class GetUserView(APIView):
    permission_classes = [IsAuthenticated, IsVerified]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated, IsVerified]

    def delete(self, request):
        user = request.user
        user.delete()
        resp = Response({"detail": "User deleted."}, status=status.HTTP_200_OK)
        resp.delete_cookie("access")
        resp.delete_cookie("refresh")
        return resp


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.context.get("user")

        try:
            otp = user.generate_otp()
            send_otp_email(user.email, otp, context="password_reset")
            return Response({"detail": "Password reset OTP sent to your email."}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_429_TOO_MANY_REQUESTS)


class PasswordResetOTPVerifyView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = PasswordResetOTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.context.get("password_reset_token")
        return Response({"password_reset_token": token}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.context.get("user")
        new_password = serializer.validated_data.get("new_password")

        user.set_password(new_password)
        user.clear_password_reset_token()
        user.save()

        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)
