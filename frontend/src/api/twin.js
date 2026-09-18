import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const twinApi = {
  async getTwinState(patientId = "USR-5EF52B", visitIndex = -1, view = "all") {
    return apiClient.get(ENDPOINTS.TWIN_STATE(patientId, visitIndex, view));
  },
};
