import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const profileApi = {
  async getProfile(userId = "USR-5EF52B") {
    return apiClient.get(ENDPOINTS.PROFILE(userId));
  },

  async updateProfile(userId = "USR-5EF52B", profileData = {}) {
    return apiClient.put(ENDPOINTS.PROFILE(userId), profileData);
  },

  async deleteProfile(userId = "USR-5EF52B") {
    return apiClient.delete(ENDPOINTS.PROFILE(userId));
  },
};
