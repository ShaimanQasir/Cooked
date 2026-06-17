from django.urls import path
from .views import (
    RegisterView,
    ResendOTPView,
    OTPVerifyView,
    OTPGenerateView,
    LoginView,
    LogoutView,
    GetUserView,
    DeleteUserView,
    PasswordResetRequestView,
    PasswordResetOTPVerifyView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("resend-otp/", ResendOTPView.as_view(), name="resend_otp"),
    path("verify-otp/", OTPVerifyView.as_view(), name="verify_otp"),
    path("generate-otp/", OTPGenerateView.as_view(), name="generate_otp"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("get-user/", GetUserView.as_view(), name="me"),
    path("delete-user/", DeleteUserView.as_view(), name="delete_user"),
    path("password-reset/request/", PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("password-reset/verify-otp/", PasswordResetOTPVerifyView.as_view(), name="password_reset_verify_otp"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
]
