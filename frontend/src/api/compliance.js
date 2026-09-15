import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const complianceApi = {
  async getAuditLogs() {
    return apiClient.get(ENDPOINTS.COMPLIANCE_AUDIT);
  },

  async getModelRegistry() {
    return apiClient.get(ENDPOINTS.COMPLIANCE_REGISTRY);
  },

  async updateConsent(patientId, consentData) {
    return apiClient.post(ENDPOINTS.COMPLIANCE_CONSENT, {
      patient_id: patientId,
      ...consentData,
    });
  },
};
