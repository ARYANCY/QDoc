import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const twinApi = {
  async getTwinState(patientId = "PT-89421", visitIndex = -1, view = "all") {
    return apiClient.get(ENDPOINTS.TWIN_STATE(patientId, visitIndex, view));
  },
};
