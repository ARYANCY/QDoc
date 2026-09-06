import apiClient from "./client";

export const twinApi = {
  async getTwinState(patientId = "PT-89421", visitIndex = -1, view = "all") {
    return apiClient.get(`/api/v1/digital-twin/state/${patientId}?visit_index=${visitIndex}&view=${view}`);
  },
};
