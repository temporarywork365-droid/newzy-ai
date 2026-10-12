import { APP_CONFIG } from '@/constants/config';
import { ApiError } from './errors';
import type { QueryParams, RequestOptions } from './types';
import { mockRequest } from './mock/mockApi';

/**
 * Session token injection. The app stores ONLY the user's session token
 * (SecureStore) — never API keys, DB credentials or admin secrets.
 * The provider is registered by the auth store at boot.
 */
let authTokenProvider: (() => string | null) | null = null;

export function setAuthTokenProvider(provider: () => string | null): void {
  authTokenProvider = provider;
}

function buildUrl(path: string, params?: QueryParams): string {
  const base = APP_CONFIG.apiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/${APP_CONFIG.apiVersion}${path.startsWith('/') ? path : `/${path}`}`;
  if (!params) return url;
  const search = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && `${value}`.length > 0)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return search.length > 0 ? `${url}?${search}` : url;
}

async function request<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  // No backend configured yet → serve the mock API (identical response shapes).
  if (!APP_CONFIG.apiBaseUrl) {
    return mockRequest<T>(method, path, body, options.params ?? {});
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? APP_CONFIG.requestTimeoutMs);

  try {
    const token = authTokenProvider?.() ?? null;
    const response = await fetch(buildUrl(path, options.params), {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options.signal ?? controller.signal,
    });

    if (response.status === 401) {
      throw new ApiError(401, 'Your session has expired. Please sign in again.', 'UNAUTHORIZED');
    }
    if (!response.ok) {
      throw new ApiError(response.status, `Request failed with status ${response.status}`, `HTTP_${response.status}`);
    }
    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, 'Network error. Check your connection and try again.', 'NETWORK');
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>('GET', path, undefined, options);
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('POST', path, body, options);
  },
};
