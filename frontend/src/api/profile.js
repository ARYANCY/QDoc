import apiClient from "./client";

export const profileApi = {
  async getProfile(userId = "PT-ALEX") {
    return apiClient.get(`/api/v1/profile/${userId}`);
  },

  async updateProfile(userId = "PT-ALEX", profileData = {}) {
    return apiClient.put(`/api/v1/profile/${userId}`, profileData);
  },

  async deleteProfile(userId = "PT-ALEX") {
    return apiClient.delete(`/api/v1/profile/${userId}`);
  },
};
