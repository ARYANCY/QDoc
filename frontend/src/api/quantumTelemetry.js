import apiClient from "./client";

export const quantumTelemetryApi = {
  async getCircuit(modelName = "VQC-8Q") {
    return apiClient.get(`/api/v1/quantum-telemetry/circuit/${modelName}`);
  },
};
