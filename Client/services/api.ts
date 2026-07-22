import { config } from '../constants/config';

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export function setAuthTokens(access: string | null, refresh: string | null) {
  _accessToken = access;
  _refreshToken = refresh;
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

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

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
    throw new ApiError(extractErrorMessage(data), response.status, data);
  }

  return data as T;
}
