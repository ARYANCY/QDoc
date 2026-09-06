import apiClient from "./client";

export const authApi = {
  async login(username = "alex.patient", password = "patient123", role = "patient") {
    const data = await apiClient.post("/api/v1/auth/login", { username, password, role });
    if (data.access_token) {
      localStorage.setItem("qmed_token", data.access_token);
      localStorage.setItem("qmed_user", JSON.stringify(data.user));
    }
    return data;
  },

  async register(registrationData) {
    const data = await apiClient.post("/api/v1/auth/register", registrationData);
    if (data.access_token) {
      localStorage.setItem("qmed_token", data.access_token);
      localStorage.setItem("qmed_user", JSON.stringify(data.user));
    }
    return data;
  },

  async getCurrentUser() {
    return apiClient.get("/api/v1/auth/me");
  },

  logout() {
    localStorage.removeItem("qmed_token");
    localStorage.removeItem("qmed_user");
  },

  getStoredUser() {
    try {
      const u = localStorage.getItem("qmed_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
};
