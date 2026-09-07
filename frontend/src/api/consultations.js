import apiClient from "./client";

export const consultationsApi = {
  async listDoctors(specialty = null, status = "verified") {
    let url = "/api/v1/consultations/doctors?status=" + encodeURIComponent(status);
    if (specialty && specialty !== "all") {
      url += "&specialty=" + encodeURIComponent(specialty);
    }
    return apiClient.get(url);
  },

  async getDoctorProfile(doctorId) {
    return apiClient.get(`/api/v1/consultations/doctors/${doctorId}`);
  },

  async holdSlot(doctorId, slotTime, patientId = "PT-89421") {
    return apiClient.post("/api/v1/consultations/slots/hold", {
      doctor_id: doctorId,
      slot_time: slotTime,
      patient_id: patientId,
    });
  },

  async checkTriage(symptoms, vitals = {}) {
    return apiClient.post("/api/v1/consultations/triage-check", {
      symptoms,
      ...vitals,
    });
  },

  async bookConsultation(bookingPayload) {
    return apiClient.post("/api/v1/consultations/book", bookingPayload);
  },

  async listBookings(patientId = null, doctorId = null) {
    let url = "/api/v1/consultations/bookings";
    const params = [];
    if (patientId) params.push(`patient_id=${encodeURIComponent(patientId)}`);
    if (doctorId) params.push(`doctor_id=${encodeURIComponent(doctorId)}`);
    if (params.length > 0) url += "?" + params.join("&");
    return apiClient.get(url);
  },

  async getBooking(bookingId) {
    return apiClient.get(`/api/v1/consultations/bookings/${bookingId}`);
  },

  async transitionBooking(bookingId, status, reason = "") {
    return apiClient.post(`/api/v1/consultations/bookings/${bookingId}/transition`, {
      status,
      reason,
    });
  },

  async getRoom(bookingId) {
    return apiClient.get(`/api/v1/consultations/rooms/${bookingId}`);
  },

  async admitPatient(bookingId) {
    return apiClient.post(`/api/v1/consultations/rooms/${bookingId}/admit`, {});
  },

  async sendChatMessage(bookingId, sender, text) {
    return apiClient.post(`/api/v1/consultations/rooms/${bookingId}/chat`, {
      sender,
      text,
    });
  },

  async checkDrugInteractions(candidateDrugs, currentMedications = []) {
    return apiClient.post("/api/v1/consultations/prescriptions/check-interactions", {
      candidate_drugs: candidateDrugs,
      current_medications: currentMedications,
    });
  },

  async createPrescription(prescriptionPayload) {
    return apiClient.post("/api/v1/consultations/prescriptions", prescriptionPayload);
  },

  async listPrescriptions(patientId = null, doctorId = null) {
    let url = "/api/v1/consultations/prescriptions";
    const params = [];
    if (patientId) params.push(`patient_id=${encodeURIComponent(patientId)}`);
    if (doctorId) params.push(`doctor_id=${encodeURIComponent(doctorId)}`);
    if (params.length > 0) url += "?" + params.join("&");
    return apiClient.get(url);
  },

  async getPrescription(prescriptionId) {
    return apiClient.get(`/api/v1/consultations/prescriptions/${prescriptionId}`);
  },
};
