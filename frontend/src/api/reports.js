import apiClient from "./client";

export const reportsApi = {
  async generateReport(reportData) {
    return apiClient.post("/api/v1/reports/generate", reportData);
  },
};
