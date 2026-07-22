import { apiFetch } from './api';

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetVerifyPayload {
  email: string;
  otp: string;
}

export interface PasswordResetConfirmPayload {
  email: string;
  token: string;
  new_password: string;
  confirm_password: string;
}

export const authService = {
  register: (data: RegisterPayload) =>
    apiFetch('/users/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  login: (data: LoginPayload) =>
    apiFetch('/users/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  logout: () =>
    apiFetch('/users/auth/logout/', { method: 'POST' }),

  verifyOtp: (data: VerifyOtpPayload) =>
    apiFetch('/users/verify-otp/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  resendOtp: (email: string) =>
    apiFetch('/users/resend-otp/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, true),

  getCurrentUser: () =>
    apiFetch('/users/get-user/'),

  requestPasswordReset: (email: string) =>
    apiFetch('/users/password-reset/request/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, true),

  verifyPasswordResetOtp: (data: PasswordResetVerifyPayload) =>
    apiFetch<{ password_reset_token: string }>('/users/password-reset/verify-otp/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  confirmPasswordReset: (data: PasswordResetConfirmPayload) =>
    apiFetch('/users/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
};
