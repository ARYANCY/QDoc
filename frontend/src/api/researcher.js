import apiClient from "./client";

export const researcherApi = {
  async triggerRetraining(jobParams = {}) {
    return apiClient.post("/api/v1/researcher/train", jobParams);
  },
};
