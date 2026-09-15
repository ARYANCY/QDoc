import { API_KEY, API_TIMEOUT_MS } from "./config";

async function executeFetchWithRetry(endpoint, fetchOptions, timeoutId, maxRetries = 2) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const response = await fetch(endpoint, fetchOptions);
      clearTimeout(timeoutId);

      if (response.status === 401) {
        localStorage.removeItem("qmed_token");
        window.dispatchEvent(new CustomEvent("qmed:auth_expired"));
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `API Error (${response.status})`;
        const err = new Error(errorMessage);
        err.status = response.status;
        err.data = errorData;
        throw err;
      }

      return await response.json();
    } catch (error) {
      attempt++;
      // Only retry idempotent GET requests on network failures
      const isGet = !fetchOptions.method || fetchOptions.method === "GET";
      const isNetworkError = error.message === "Failed to fetch" || error.name === "TypeError";
      if (attempt <= maxRetries && isGet && isNetworkError) {
        const delayMs = Math.pow(2, attempt) * 250; // 500ms, 1000ms
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error(`API request timed out: ${endpoint}`);
      }
      if (isNetworkError) {
        console.warn(`[Network/CORS Notice] Failed to connect to ${endpoint}. Verify server status and CORS origin.`);
      }
      throw error;
    }
  }
}

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("qmed_token");
  const storedApiKey = localStorage.getItem("qmed_api_key");
  const effectiveApiKey = storedApiKey || API_KEY;

  const timeoutMs = options.timeout || API_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    Accept: "application/json",
    ...(effectiveApiKey ? { "X-API-Key": effectiveApiKey } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const fetchOptions = {
    ...options,
    headers,
    signal: controller.signal,
    mode: "cors",
  };

  return executeFetchWithRetry(endpoint, fetchOptions, timeoutId);
}

export const apiClient = {
  get: (endpoint, headers, options = {}) => request(endpoint, { method: "GET", headers, ...options }),
  post: (endpoint, body, headers, options = {}) =>
    request(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
      ...options,
    }),
  put: (endpoint, body, headers, options = {}) =>
    request(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
      ...options,
    }),
  delete: (endpoint, headers, options = {}) => request(endpoint, { method: "DELETE", headers, ...options }),
};

export default apiClient;
