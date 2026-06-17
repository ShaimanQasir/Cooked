from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')

        # Do not enforce password strength/length here - handled by frontend
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            # If no password provided, mark unusable (frontend may set later)
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)
    

class User(AbstractUser):
    # Don't add password field - AbstractUser already has it!
    
    username = models.CharField(max_length=150, unique=True, null=False, blank=False)
    email = models.EmailField(unique=True, null=False, blank=False)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    # OTP Fields
    otp = models.CharField(max_length=6, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    otp_expires_at = models.DateTimeField(blank=True, null=True)
    
    # OTP Generation tracking (max 3 per hour)
    otp_generation_count = models.IntegerField(default=0)  # How many OTPs generated
    otp_generation_first_at = models.DateTimeField(blank=True, null=True)  # First generation time
    otp_blocked_until = models.DateTimeField(blank=True, null=True)  # Blocked until when
    
    # OTP Verification tracking (max 3 attempts per OTP)
    otp_verification_attempts = models.IntegerField(default=0)  # Failed attempts to verify
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Password reset token (for reset via OTP -> token -> confirm)
    password_reset_token = models.CharField(max_length=128, blank=True, null=True)
    password_reset_expires_at = models.DateTimeField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    objects = UserManager()
    
    def __str__(self):
        return self.email
    
    def can_request_otp(self):
        """Check if user can request a new OTP (max 3 requests per hour)"""
        now = timezone.now()
        
        # Check if currently blocked
        if self.otp_blocked_until and self.otp_blocked_until > now:
            return False, f"Blocked until {self.otp_blocked_until}"
        
        # Reset counter if an hour has passed since first request
        if self.otp_generation_first_at:
            time_since_first = now - self.otp_generation_first_at
            if time_since_first > timedelta(hours=1):
                # Reset all counters
                self.otp_generation_count = 0
                self.otp_generation_first_at = None
                self.otp_blocked_until = None
                self.save()
        
        # Check if user has exceeded 3 requests
        if self.otp_generation_count >= 3:
            # Block user for 1 hour
            self.otp_blocked_until = now + timedelta(hours=1)
            self.save()
            return False, "Too many OTP requests. Try again after 1 hour"
        
        return True, "Can request OTP"
    
    def generate_otp(self):
        """Generate a 6-digit OTP with rate limiting"""
        
        # Check rate limit - FIXED: Don't pass self
        can_request, message = self.can_request_otp()
        if not can_request:
            raise ValueError(message)
        
        # Set first request time if this is the first
        if self.otp_generation_count == 0:
            self.otp_generation_first_at = timezone.now()
        
        # Generate random 6-digit OTP
        import random
        otp_code = str(random.randint(100000, 999999))
        
        # Save OTP details
        self.otp = otp_code
        self.otp_created_at = timezone.now()
        self.otp_expires_at = timezone.now() + timedelta(minutes=10)
        self.otp_generation_count += 1
        self.otp_verification_attempts = 0  # Reset verification attempts for new OTP
        
        self.save()
        
        return otp_code  # FIXED: Return the OTP
    
    def verify_otp(self, entered_otp):
        """Verify OTP with attempt limiting (max 3 failed attempts per OTP)"""
        now = timezone.now()
        
        # Check if OTP exists
        if not self.otp or not self.otp_expires_at:
            return False, "No OTP found. Please request a new one"
        
        # Check if OTP is expired
        if self.otp_expires_at < now:
            return False, "OTP has expired. Please request a new one"
        
        # Check verification attempts (3 attempts per OTP)
        if self.otp_verification_attempts >= 3:
            # Clear OTP after too many failed attempts
            self.otp = None
            self.otp_expires_at = None
            self.otp_created_at = None
            self.save()
            return False, "Too many failed attempts. Please request a new OTP"
        
        # Verify OTP
        if self.otp != entered_otp:
            self.otp_verification_attempts += 1
            self.save()
            remaining_attempts = 3 - self.otp_verification_attempts
            return False, f"Invalid OTP. {remaining_attempts} attempt(s) remaining"
        
        # OTP is valid - verify the user
        self.is_verified = True
        self.otp = None
        self.otp_created_at = None
        self.otp_expires_at = None
        self.otp_generation_count = 0
        self.otp_generation_first_at = None
        self.otp_verification_attempts = 0
        self.otp_blocked_until = None
        self.save()
        
        return True, "Email verified successfully"
    
    def get_otp_status(self):
        """Get current OTP status for debugging"""
        now = timezone.now()
        
        status = {
            'is_verified': self.is_verified,
            'has_active_otp': bool(self.otp and self.otp_expires_at and now < self.otp_expires_at),
            'generations_used': self.otp_generation_count,
            'generations_remaining': max(0, 3 - self.otp_generation_count),
            'is_blocked': bool(self.otp_blocked_until and now < self.otp_blocked_until),
            'verification_attempts_used': self.otp_verification_attempts,
            'verification_attempts_remaining': max(0, 3 - self.otp_verification_attempts),
        }
        
        if self.otp_expires_at and now < self.otp_expires_at:
            seconds_left = (self.otp_expires_at - now).seconds
            status['otp_expires_in'] = f"{seconds_left // 60} minutes {seconds_left % 60} seconds"
        
        if self.otp_blocked_until and now < self.otp_blocked_until:
            minutes_left = (self.otp_blocked_until - now).seconds // 60
            status['blocked_for_minutes'] = minutes_left
        
        return status

    def generate_password_reset_token(self, minutes=15):
        """Generate a one-time token for password reset and store expiry."""
        import secrets

        token = secrets.token_urlsafe(32)
        self.password_reset_token = token
        self.password_reset_expires_at = timezone.now() + timedelta(minutes=minutes)
        self.save()
        return token

    def verify_password_reset_token(self, token):
        """Return (True, message) if token valid, else (False, message)."""
        now = timezone.now()
        if not self.password_reset_token or not self.password_reset_expires_at:
            return False, "No password reset token found"
        if self.password_reset_token != token:
            return False, "Invalid password reset token"
        if self.password_reset_expires_at < now:
            return False, "Password reset token has expired"
        return True, "Valid token"

    def clear_password_reset_token(self):
        self.password_reset_token = None
        self.password_reset_expires_at = None
        self.save()