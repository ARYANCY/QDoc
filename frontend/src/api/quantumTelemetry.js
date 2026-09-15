import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const quantumTelemetryApi = {
  async getCircuit(modelName = "cardiovascular") {
    return apiClient.get(ENDPOINTS.QUANTUM_CIRCUIT(modelName));
  },
};
