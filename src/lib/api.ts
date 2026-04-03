export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const CSRF_STORAGE_KEY = "medserve-csrf-token";

function readCsrfToken(): string | null {
  try {
    return window.sessionStorage.getItem(CSRF_STORAGE_KEY);
  } catch {
    return null;
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  rawBody?: BodyInit | null;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: Record<string, unknown> = {};

  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      if (!response.ok) {
        throw new Error("The application could not reach the pharmacy service. Make sure the backend server is running and try again.");
      }
      throw new Error("The server returned an unexpected response. Please try again.");
    }
  }

  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Unable to complete that action right now. Please try again.");
  }

  return data as T;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const init: RequestInit = {
    ...options,
    credentials: "include",
    headers,
  };

  const csrfToken = readCsrfToken();
  if (csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes((options.method || "GET").toUpperCase())) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  if (options.rawBody !== undefined) {
    init.body = options.rawBody;
  } else if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    init.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, init);
    return parseResponse<T>(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("The application could not reach the pharmacy service. Make sure the backend server is running and try again.");
    }
    throw error;
  }
}

export function setCsrfToken(token?: string | null) {
  try {
    if (!token) {
      window.sessionStorage.removeItem(CSRF_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(CSRF_STORAGE_KEY, token);
  } catch {
    // Ignore storage failures so auth state can still function in memory.
  }
}
