import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const reportsApi = {
  async generateReport(reportData) {
    return apiClient.post(ENDPOINTS.REPORTS_GENERATE, reportData);
  },

  async listReports(patientId = null) {
    return apiClient.get(ENDPOINTS.REPORTS_LIST(patientId));
  },
};
