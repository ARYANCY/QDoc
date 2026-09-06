import apiClient from "./client";

export const complianceApi = {
  async getAuditLogs() {
    return apiClient.get("/api/v1/compliance/audit-logs");
  },

  async getModelRegistry() {
    return apiClient.get("/api/v1/compliance/model-registry");
  },

  async updateConsent(patientId, consentData) {
    return apiClient.post("/api/v1/compliance/consent", {
      patient_id: patientId,
      ...consentData,
    });
  },
};
