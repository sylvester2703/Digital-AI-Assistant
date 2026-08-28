function getBaseUrl(): string {
  let envUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
  
  // If only a hostname is passed (e.g., from Render service host)
  if (envUrl && !envUrl.startsWith("http://") && !envUrl.startsWith("https://")) {
    envUrl = `https://${envUrl}`;
  }
  
  // Ensure the /api/v1 prefix exists
  if (envUrl && !envUrl.endsWith("/api/v1") && !envUrl.endsWith("/api/v1/")) {
    envUrl = `${envUrl.replace(/\/+$/, "")}/api/v1`;
  }
  
  return envUrl;
}

const BASE_URL = getBaseUrl();

export class ApiError extends Error {
  code: string;
  details: any;
  status: number;

  constructor(message: string, code = "API_ERROR", status = 500, details = null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const err = data.error || { message: "Request failed", code: "UNKNOWN_ERROR" };
      throw new ApiError(err.message || data.detail || "Server error", err.code, response.status, err.details);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || "Network connection failed", "NETWORK_ERROR", 0);
  }
}
