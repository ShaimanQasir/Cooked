from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_otp_email(email: str, otp: str, context: str = "verification") -> bool:
    """
    Sends a beautifully styled HTML OTP email to the user with fallback text.
    context: "verification" for signup/resend, "password_reset" for forgot password.
    """
    if context == "verification":
        subject = "🍳 Your Verification Code - Cooked"
        title = "Welcome to Cooked!"
        subtitle = "Please enter the code below to verify your email address and activate your account."
    elif context == "password_reset":
        subject = "🔒 Password Reset Request - Cooked"
        title = "Password Reset Verification"
        subtitle = "You requested to reset your password. Use the 6-digit code below to set a new password."
    else:
        subject = "🔑 Your One-Time Password - Cooked"
        title = "One-Time Security Code"
        subtitle = "Your single-use verification code is provided below."

    # Plain Text Fallback Message
    plain_message = f"{title}\n\n{subtitle}\n\nYour Verification Code: {otp}\n\nThis code will expire in 10 minutes. If you did not request this code, please ignore this email."

    # Production HTML Email Template
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{subject}</title>
      <style>
        body {{
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #F8FAF9;
          margin: 0;
          padding: 0;
          color: #1F2937;
        }}
        .email-container {{
          max-width: 560px;
          margin: 30px auto;
          background-color: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #E5E7EB;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }}
        .header {{
          background-color: #2B8255;
          padding: 28px 24px;
          text-align: center;
        }}
        .header h1 {{
          color: #FFFFFF;
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }}
        .content {{
          padding: 32px 28px;
          text-align: center;
        }}
        .title {{
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-top: 0;
          margin-bottom: 10px;
        }}
        .subtitle {{
          font-size: 15px;
          color: #6B7280;
          margin-bottom: 28px;
          line-height: 1.5;
        }}
        .otp-badge {{
          display: inline-block;
          background-color: #FAF3E0;
          border: 2px dashed #B27A1C;
          border-radius: 16px;
          padding: 16px 36px;
          margin-bottom: 28px;
        }}
        .otp-code {{
          font-family: 'Courier New', Courier, monospace;
          font-size: 34px;
          font-weight: 800;
          color: #2B8255;
          letter-spacing: 8px;
        }}
        .expiry-notice {{
          font-size: 13px;
          color: #9CA3AF;
          margin-bottom: 0;
        }}
        .footer {{
          background-color: #F9FAFB;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #F3F4F6;
          font-size: 12px;
          color: #9CA3AF;
        }}
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🍳 Cooked</h1>
        </div>
        <div class="content">
          <div class="title">{title}</div>
          <div class="subtitle">{subtitle}</div>
          
          <div class="otp-badge">
            <span class="otp-code">{otp}</span>
          </div>

          <p class="expiry-notice">⏱️ This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>
        <div class="footer">
          &copy; 2026 Cooked. All rights reserved. If you didn't request this email, please ignore it safely.
        </div>
      </div>
    </body>
    </html>
    """

    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=email_from,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False
        )
        logger.info(f"Successfully dispatched OTP email to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        if settings.DEBUG:
            print(f"DEBUG: Failed to send email to {email}. OTP: {otp}. Error: {str(e)}")
        return False
