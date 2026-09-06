/**
 * Q-MedSense Centralized API Client
 * Handles base URL routing, automatic JWT token attachment, timeout, and structured error reporting.
 */

const API_BASE_URL = ""; // Relative for Vite proxy support

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("qmed_token");
  const timeoutMs = options.timeout || 15000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Do not set Content-Type if sending FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers,
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (response.status === 401) {
      localStorage.removeItem("qmed_token");
      window.dispatchEvent(new CustomEvent("qmed:auth_expired"));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || errorData.message || `API Error (${response.status}): ${response.statusText}`;
      throw new Error(message);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s. Please check backend service connectivity.`);
    }
    console.error(`[API ERROR] ${options.method || "GET"} ${url}:`, err);
    throw err;
  }
}

export const apiClient = {
  get: (endpoint, headers, options = {}) => request(endpoint, { method: "GET", headers, ...options }),
  post: (endpoint, body, headers, options = {}) => request(endpoint, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body), headers, ...options }),
  put: (endpoint, body, headers, options = {}) => request(endpoint, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body), headers, ...options }),
  delete: (endpoint, headers, options = {}) => request(endpoint, { method: "DELETE", headers, ...options }),
};

export default apiClient;
