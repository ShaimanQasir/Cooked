from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_otp_email(email, otp, context="verification"):
    """
    Sends an OTP email to the user.
    context: "verification" for signup/resend, "password_reset" for forgot password.
    """
    subject = ""
    message = ""
    
    if context == "verification":
        subject = "Your Verification Code - Cooked"
        message = f"Welcome to Cooked! Your verification code is: {otp}\n\nThis code will expire in 10 minutes."
    elif context == "password_reset":
        subject = "Password Reset Request - Cooked"
        message = f"You requested a password reset. Your verification code is: {otp}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email."
    else:
        subject = "Your One-Time Password - Cooked"
        message = f"Your one-time password is: {otp}"

    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    try:
        send_mail(subject, message, email_from, recipient_list, fail_silently=False)
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        # In development, we might want to still see it in console if email backend fails
        if settings.DEBUG:
            print(f"DEBUG: Failed to send email to {email}. OTP: {otp}")
        return False
