const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vibecut_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponseError = async (res: Response, path: string, method: string): Promise<never> => {
  let errorMsg = `API ${method} request failed on path ${path}: ${res.statusText}`;
  try {
    const text = await res.text();
    try {
      const errorData = JSON.parse(text);
      if (errorData && (errorData.error || errorData.message)) {
        errorMsg = errorData.error || errorData.message;
      }
    } catch {
      // If parsing fails, use the raw text if it is short and clean
      if (text && text.trim().length > 0 && text.length < 150) {
        errorMsg = text.trim();
      }
    }
  } catch (_) {
    // Fallback if reading text fails
  }
  throw new Error(errorMsg);
};

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      await handleResponseError(res, path, 'GET');
    }
    return res.json();
  },

  async post<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    if (!res.ok) {
      await handleResponseError(res, path, 'POST');
    }
    return res.json();
  },

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      await handleResponseError(res, path, 'DELETE');
    }
    return res.json();
  },

  async put<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    if (!res.ok) {
      await handleResponseError(res, path, 'PUT');
    }
    return res.json();
  },
};
