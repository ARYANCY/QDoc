import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const earlyDetectionApi = {
  async getPathway(diseaseKey = "breast_cancer") {
    return apiClient.get(ENDPOINTS.EARLY_DETECTION_PATHWAY(diseaseKey));
  },

  async ingestFhir(fhirBundle) {
    return apiClient.post(ENDPOINTS.EARLY_DETECTION_INGEST_FHIR, fhirBundle);
  },

  async ingestVcf(vcfFile) {
    const body = new FormData();
    body.append("file", vcfFile);
    return apiClient.post(ENDPOINTS.EARLY_DETECTION_INGEST_VCF, body);
  },
};
