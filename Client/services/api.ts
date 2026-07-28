import { config } from '../constants/config';
import {
  getAccessToken as getSecureAccess,
  getRefreshToken as getSecureRefresh,
  setAccessToken as setSecureAccess,
  setRefreshToken as setSecureRefresh,
  clearTokens
} from './secureStore';

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _isRefreshing = false;
let _refreshSubscribers: ((token: string) => void)[] = [];

export function setAuthTokens(access: string | null, refresh: string | null) {
  _accessToken = access;
  _refreshToken = refresh;
  if (access) setSecureAccess(access);
  if (refresh) setSecureRefresh(refresh);
}

export async function initAuthTokens() {
  _accessToken = await getSecureAccess();
  _refreshToken = await getSecureRefresh();
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function getRefreshToken(): string | null {
  return _refreshToken;
}

export function clearAuthTokens() {
  _accessToken = null;
  _refreshToken = null;
  clearTokens();
}

function onRefreshed(token: string) {
  _refreshSubscribers.map((callback) => callback(token));
  _refreshSubscribers = [];
}

function extractErrorMessage(data: any): string {
  if (typeof data === 'string') return data;
  if (data?.detail) return String(data.detail);
  for (const val of Object.values(data)) {
    if (Array.isArray(val) && val.length > 0) return String(val[0]);
    if (typeof val === 'string') return val;
  }
  return 'An unexpected error occurred';
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function attemptTokenRefresh(): Promise<string | null> {
  const refresh = _refreshToken || (await getSecureRefresh());
  if (!refresh) return null;

  try {
    const response = await fetch(`${config.API_BASE_URL}/api/users/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      clearAuthTokens();
      return null;
    }

    const data = await response.json();
    if (data.access) {
      const newAccess = data.access;
      const newRefresh = data.refresh || refresh;
      setAuthTokens(newAccess, newRefresh);
      return newAccess;
    }
  } catch (error) {
    clearAuthTokens();
  }
  return null;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  skipAuth = false,
  isRetry = false
): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!_accessToken) {
    _accessToken = await getSecureAccess();
  }

  if (!skipAuth && _accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) return {} as T;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Handle Automatic 401 Unauthorized Token Refresh & Request Retry
    if (response.status === 401 && !skipAuth && !isRetry) {
      if (!_isRefreshing) {
        _isRefreshing = true;
        const newAccess = await attemptTokenRefresh();
        _isRefreshing = false;

        if (newAccess) {
          onRefreshed(newAccess);
          return apiFetch<T>(endpoint, options, skipAuth, true);
        }
      } else {
        // Queue request while token refresh is in progress
        return new Promise<T>((resolve) => {
          _refreshSubscribers.push((newToken: string) => {
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            };
            resolve(apiFetch<T>(endpoint, options, skipAuth, true));
          });
        });
      }
    }

    throw new ApiError(extractErrorMessage(data), response.status, data);
  }

  return data as T;
}
