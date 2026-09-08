const API_KEY = "qmed-master-api-key-2026";

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("qmed_token");
  const timeoutMs = options.timeout || 12000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    Accept: "application/json",
    "X-API-Key": localStorage.getItem("qmed_api_key") || API_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(endpoint, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.status === 401) {
      localStorage.removeItem("qmed_token");
      window.dispatchEvent(new CustomEvent("qmed:auth_expired"));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `API Error (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`API request timed out: ${endpoint}`);
    }
    throw error;
  }
}

export const apiClient = {
  get: (endpoint, headers, options = {}) => request(endpoint, { method: "GET", headers, ...options }),
  post: (endpoint, body, headers, options = {}) => request(endpoint, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body), headers, ...options }),
  put: (endpoint, body, headers, options = {}) => request(endpoint, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body), headers, ...options }),
  delete: (endpoint, headers, options = {}) => request(endpoint, { method: "DELETE", headers, ...options }),
};

export default apiClient;
