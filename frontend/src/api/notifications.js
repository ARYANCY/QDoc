import apiClient from "./client";

export const notificationsApi = {
  async getNotifications(limit = 20) {
    return apiClient.get(`/api/v1/notifications?limit=${limit}`);
  },

  async markRead(notificationId) {
    return apiClient.post(`/api/v1/notifications/${notificationId}/read`, {});
  },

  async sendAlert(userId, title, message, refCode = "", category = "general") {
    return apiClient.post("/api/v1/notifications/send-alert", {
      user_id: userId,
      title,
      message,
      reference_code: refCode,
      category,
    });
  },
};
