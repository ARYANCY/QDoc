import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const profileApi = {
  async getProfile(userId = "PT-ALEX") {
    return apiClient.get(ENDPOINTS.PROFILE(userId));
  },

  async updateProfile(userId = "PT-ALEX", profileData = {}) {
    return apiClient.put(ENDPOINTS.PROFILE(userId), profileData);
  },

  async deleteProfile(userId = "PT-ALEX") {
    return apiClient.delete(ENDPOINTS.PROFILE(userId));
  },
};
