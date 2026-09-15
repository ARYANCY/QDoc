import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const notificationsApi = {
  async listNotifications(limit = 20) {
    return apiClient.get(ENDPOINTS.NOTIFICATIONS(limit));
  },

  async getNotifications(limit = 20) {
    return apiClient.get(ENDPOINTS.NOTIFICATIONS(limit));
  },

  async markAsRead(notificationId) {
    return apiClient.post(ENDPOINTS.NOTIFICATIONS_READ(notificationId), {});
  },

  async markRead(notificationId) {
    return apiClient.post(ENDPOINTS.NOTIFICATIONS_READ(notificationId), {});
  },

  async sendAlert(alertData) {
    return apiClient.post(ENDPOINTS.NOTIFICATIONS_SEND_ALERT, {
      patient_id: alertData.patientId || alertData.patient_id,
      alert_type: alertData.alertType || alertData.alert_type || "critical",
      message: alertData.message,
      disease: alertData.disease,
      quantum_confidence: alertData.quantumConfidence || alertData.quantum_confidence || 0.95,
      recipient_role: alertData.recipientRole || alertData.recipient_role || "clinician",
    });
  },
};
