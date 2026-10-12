/**
 * Runtime configuration.
 * Only a PUBLIC base URL may live in the client. Secrets never ship with the app —
 * the backend owns all upstream keys. When apiBaseUrl is empty, the app uses the
 * built-in mock transport, which implements the exact production response shapes.
 */
export const APP_CONFIG = {
  apiBaseUrl: (process.env.EXPO_PUBLIC_API_URL ?? '').trim(),
  apiVersion: 'v1',
  requestTimeoutMs: 12_000,
} as const;
