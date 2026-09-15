import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const authApi = {
  async login(username = "alex.patient", password = "patient123", role = "patient") {
    const data = await apiClient.post(ENDPOINTS.AUTH_LOGIN, { username, password, role });
    if (data.access_token) {
      localStorage.setItem("qmed_token", data.access_token);
      localStorage.setItem("qmed_user", JSON.stringify(data.user));
    }
    return data;
  },

  async register(registrationData) {
    const data = await apiClient.post(ENDPOINTS.AUTH_REGISTER, registrationData);
    if (data.access_token) {
      localStorage.setItem("qmed_token", data.access_token);
      localStorage.setItem("qmed_user", JSON.stringify(data.user));
    }
    return data;
  },

  async getCurrentUser() {
    return apiClient.get(ENDPOINTS.AUTH_ME);
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
