import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const clinicalApi = {
  async runDiagnosis(disease = "breast_cancer", patientId = "PT-89421", features = null) {
    return apiClient.post(ENDPOINTS.CLINICAL_DIAGNOSE, { disease, patient_id: patientId, features });
  },

  async getPatientRecord(patientId = "PT-89421") {
    return apiClient.get(ENDPOINTS.CLINICAL_PATIENT(patientId));
  },

  async updatePatientRecord(patientId = "PT-89421", patientData = {}) {
    return apiClient.put(ENDPOINTS.CLINICAL_PATIENT(patientId), patientData);
  },

  async getDiseaseFeatures(disease = "breast_cancer", patientId = "PT-89421") {
    return apiClient.get(ENDPOINTS.CLINICAL_FEATURES(patientId, disease));
  },

  async getPatientTimeline(patientId = "PT-89421") {
    return apiClient.get(ENDPOINTS.CLINICAL_TIMELINE(patientId));
  },

  async saveDiagnosticRecord(record) {
    return apiClient.post(ENDPOINTS.CLINICAL_RECORD, record);
  },

  async predictPneumonia(file, patientId = "PT-89421") {
    const body = new FormData();
    body.append("image", file);
    body.append("patient_id", patientId);
    return apiClient.post(ENDPOINTS.PNEUMONIA_PREDICT, body);
  },

  async predictSkinCancer(file, model = "QuantumDerma", patientId = "PT-89421") {
    const body = new FormData();
    body.append("image", file);
    body.append("model", model);
    body.append("patient_id", patientId);
    return apiClient.post(ENDPOINTS.SKIN_CANCER_PREDICT, body);
  },
};

