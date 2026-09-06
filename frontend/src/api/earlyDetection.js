import apiClient from "./client";

export const earlyDetectionApi = {
  async getPathway(diseaseKey = "breast_cancer") {
    return apiClient.get(`/api/v1/early-detection/pathway/${diseaseKey}`);
  },

  async ingestFhir(fhirBundle) {
    return apiClient.post("/api/v1/early-detection/ingest-fhir", fhirBundle);
  },

  async ingestVcf(vcfFile) {
    const body = new FormData();
    body.append("file", vcfFile);
    return apiClient.post("/api/v1/early-detection/ingest-vcf", body);
  },
};
