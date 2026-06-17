from rest_framework import serializers
from .models import User
from datetime import timedelta
import re


class UserSerializer(serializers.ModelSerializer):
    """FOR DISPLAYING USER DATA (READ-ONLY)"""

    class Meta:
        model = User
        fields = ["id", "email", "username", "is_verified", "created_at", "updated_at", "profile_picture"]
        read_only_fields = ["id", "is_verified", "created_at", "updated_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )
    email = serializers.EmailField(required=True)

    """Will check the validation of email, password, username, and also match password and confirm password in frontend"""

    class Meta:
        model = User
        fields = ["email", "username", "password"]

    def validate(self, data):
        email = data.get("email")
        username = data.get("username")

        # Check if user already exists
        try:
            existing_user = User.objects.get(email=email)

            # Scenario 2: User exists AND is verified
            if existing_user.is_verified:
                raise serializers.ValidationError(
                    {
                        "email": "This email is already registered and verified. Please login instead."
                    }
                )

            # Scenario 3: User exists BUT is NOT verified
            # We'll update the existing user instead of creating new
            # Store the existing user in context for use in create()
            self.context["existing_user"] = existing_user

            # Check if username is different and available
            if existing_user.username != username:
                # Check if new username is taken by another user
                if (
                    User.objects.filter(username=username)
                    .exclude(id=existing_user.id)
                    .exists()
                ):
                    raise serializers.ValidationError(
                        {"username": "This username is already taken by another user."}
                    )

        except User.DoesNotExist:
            # Scenario 1: New user - check if username is available
            if User.objects.filter(username=username).exists():
                raise serializers.ValidationError(
                    {
                        "username": "This username is already taken. Please choose another."
                    }
                )
            # No existing user
            self.context["existing_user"] = None

        return data

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.get("email")
        username = validated_data.get("username")

        # Check if we have an existing unverified user
        existing_user = self.context.get("existing_user")

        if existing_user:
            # Scenario 3: Update existing unverified user
            print(f"Updating existing unverified user: {email}")

            # Update username if changed
            if existing_user.username != username:
                existing_user.username = username

            # Update password (will be hashed by set_password)
            existing_user.set_password(password)

            # Reset OTP-related fields
            existing_user.is_verified = False
            existing_user.otp = None
            existing_user.otp_created_at = None
            existing_user.otp_expires_at = None
            existing_user.otp_generation_count = 0
            existing_user.otp_verification_attempts = 0
            existing_user.otp_blocked_until = None
            existing_user.otp_generation_first_at = None

            existing_user.save()

            # Generate new OTP for this user
            existing_user.save()

            # Generate new OTP for this user (uses model logic and rate limits)
            try:
                otp_code = existing_user.generate_otp()
            except ValueError as e:
                raise serializers.ValidationError({"detail": str(e)})

            # Store OTP in context for view to send
            self.context["generated_otp"] = otp_code

            return existing_user
        else:
            # Scenario 1: Create new user
            print(f"Creating new user: {email}")

            user = User.objects.create_user(
                password=password, email=email, username=username
            )

            # Generate OTP for new user using model helper
            try:
                otp_code = user.generate_otp()
            except ValueError as e:
                raise serializers.ValidationError({"detail": str(e)})
            
            self.context["generated_otp"] = otp_code

            return user


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """Check if user exists and is not verified"""
        try:
            user = User.objects.get(email=value)

            # If user is already verified, don't resend OTP
            if user.is_verified:
                raise serializers.ValidationError(
                    "This email is already verified. Please login."
                )

            # Store user for use in view
            self.context["user"] = user

        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No account found with this email address. Please register first."
            )

        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        try:
            user = User.objects.get(email=email)

            # Check if user is verified
            if not user.is_verified:
                raise serializers.ValidationError(
                    {
                        "email": "Please verify your email first. OTP has been sent to your email."
                    }
                )

            # Check password
            if not user.check_password(password):
                raise serializers.ValidationError({"password": "Invalid password."})

            # Store user in context
            self.context["user"] = user

        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"email": "No account found with this email address."}
            )

        return data


class OTPGenerateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            self.context["user"] = user
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No account found with this email address."
            )

        return value


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(min_length=6, max_length=6, required=True)

    def validate(self, data):
        email = data.get("email")
        otp = data.get("otp")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"email": "No account found with this email address."}
            )

        is_valid, message = user.verify_otp(otp)

        if not is_valid:
            raise serializers.ValidationError({"otp": message})

        self.context["user"] = user

        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            # Only allow requests for verified accounts
            if not user.is_verified:
                raise serializers.ValidationError(
                    "This account is not verified. Cannot request password reset."
                )
            self.context["user"] = user
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No account found with this email address."
            )
        return value


class PasswordResetOTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(min_length=6, max_length=6, required=True)

    def validate(self, data):
        email = data.get("email")
        otp = data.get("otp")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "No account found with this email address."})

        # Verify OTP using existing method
        is_valid, message = user.verify_otp(otp)
        if not is_valid:
            raise serializers.ValidationError({"otp": message})

        # Generate a short-lived password reset token and return it in context
        token = user.generate_password_reset_token(minutes=15)
        self.context["user"] = user
        self.context["password_reset_token"] = token
        return data


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        email = data.get("email")
        token = data.get("token")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if new_password != confirm_password:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "No account found with this email address."})

        valid, message = user.verify_password_reset_token(token)
        if not valid:
            raise serializers.ValidationError({"token": message})

        self.context["user"] = user
        return data
