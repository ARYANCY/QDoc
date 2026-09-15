import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const researcherApi = {
  async triggerRetraining(jobParams = {}) {
    return apiClient.post(ENDPOINTS.RESEARCHER_TRAIN, jobParams);
  },
};
