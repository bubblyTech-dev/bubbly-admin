import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorInfo, AuthPayload } from 'types/auth';

export const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

// The access token lives only in memory (never localStorage). The refresh token is an httpOnly cookie
// that the browser sends by itself, so a reload quietly gets a new access token from /refresh.
let accessToken: string | null = null;
let onSessionLost: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// the AuthProvider registers what should happen when the session can no longer be renewed
export const setSessionLostHandler = (handler: (() => void) | null) => {
  onSessionLost = handler;
};

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`);
  return config;
});

// One refresh at a time: React StrictMode and parallel 401s share the same call, because the
// refresh token is rotated and a second call with the old cookie would look like token reuse.
let refreshing: Promise<AuthPayload> | null = null;

export const refreshSession = (): Promise<AuthPayload> => {
  if (!refreshing) {
    // plain axios on purpose: this call must not go through the interceptors below
    refreshing = axios
      .post(`${API_BASE}/admin/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        const payload = res.data.data as AuthPayload;
        accessToken = payload.accessToken;
        return payload;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    // an expired access token: renew once and repeat the request
    if (error.response?.status === 401 && config && !config._retried && accessToken) {
      config._retried = true;
      try {
        await refreshSession();
        return api(config);
      } catch {
        accessToken = null;
        onSessionLost?.();
      }
    }
    return Promise.reject(error);
  },
);

// Turns any thrown error into a message the UI can show, plus per-field messages for a 422.
export const parseApiError = (error: unknown): ApiErrorInfo => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        message: 'Cannot reach the server. Please check your connection and try again.',
        fields: {},
      };
    }
    const body = error.response.data as
      | { message?: string; code?: string; errors?: Record<string, string[]> }
      | undefined;
    const fields: Record<string, string> = {};
    Object.entries(body?.errors ?? {}).forEach(([field, messages]) => {
      if (messages?.[0]) fields[field] = messages[0];
    });
    return {
      message: body?.message || 'Something went wrong. Please try again.',
      code: body?.code,
      status: error.response.status,
      fields,
    };
  }
  return { message: 'Something went wrong. Please try again.', fields: {} };
};

export default api;
