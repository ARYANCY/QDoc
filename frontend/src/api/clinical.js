import apiClient from "./client";

export const clinicalApi = {
  async runDiagnosis(disease = "breast_cancer", patientId = "PT-89421", features = null) {
    return apiClient.post("/api/v1/clinical/diagnose", { disease, patient_id: patientId, features });
  },

  async getPatientRecord(patientId = "PT-89421") {
    return apiClient.get(`/api/v1/clinical/patient/${patientId}`);
  },

  async updatePatientRecord(patientId = "PT-89421", patientData = {}) {
    return apiClient.put(`/api/v1/clinical/patient/${patientId}`, patientData);
  },

  async getDiseaseFeatures(disease = "breast_cancer", patientId = "PT-89421") {
    return apiClient.get(`/api/v1/clinical/patient/${patientId}/features/${disease}`);
  },

  async predictPneumonia(file) {
    const body = new FormData();
    body.append("image", file);
    return apiClient.post("/api/v1/pneumonia/predict", body);
  },

  async predictSkinCancer(file, model = "QuantumDerma") {
    const body = new FormData();
    body.append("image", file);
    body.append("model", model);
    return apiClient.post("/api/v1/skin-cancer/predict", body);
  },
};
