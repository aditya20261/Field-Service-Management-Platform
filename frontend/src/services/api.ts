const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("keystone_token");

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const error = await response.json();

      if (error.message) {
        message = error.message;
      }
    } catch {
      // Response was not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function setToken(token: string) {
  localStorage.setItem("keystone_token", token);
}

export function clearToken() {
  localStorage.removeItem("keystone_token");
}

export function getToken() {
  return localStorage.getItem("keystone_token");
}