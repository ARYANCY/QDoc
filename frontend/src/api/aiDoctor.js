/**
 * AI Doctor & Vapi Voice Consultation API Service
 */

const API_BASE = "/api/v1/ai-doctor";

export const aiDoctorApi = {
  /**
   * Fetch server-side Vapi configuration and supported voice personas
   */
  async getConfig() {
    try {
      const res = await fetch(`${API_BASE}/config`);
      if (!res.ok) throw new Error("Failed to fetch AI Doctor configuration");
      return await res.json();
    } catch (err) {
      console.warn("Using local fallback config for AI Doctor:", err);
      return {
        status: "success",
        has_vapi_key: false,
        vapi_public_key: "",
        vapi_assistant_id: "",
        service_name: "Q-MedSense Vapi Voice AI Engine",
        supported_voices: [
          { id: "sarah", name: "Dr. Sarah (Warm Clinical - Female)", provider: "11labs" },
          { id: "george", name: "Dr. George (Reassuring - Male)", provider: "11labs" },
          { id: "aura-asteria-en", name: "Dr. Asteria (Crisp Medical)", provider: "deepgram" },
          { id: "alloy", name: "Dr. Quantum (Neutral Specialist)", provider: "openai" },
        ],
      };
    }
  },

  /**
   * Fetch patient clinical dossier & system prompt tailored for AI Doctor
   */
  async getPatientContext(patientId = "PT-89421") {
    const res = await fetch(`${API_BASE}/context/${encodeURIComponent(patientId)}`);
    if (!res.ok) throw new Error(`Failed to load patient dossier for ${patientId}`);
    return await res.json();
  },

  /**
   * Generate Vapi Assistant config with dynamically injected clinical history
   */
  async generateAssistantConfig({
    patientId = "PT-89421",
    patientName,
    assistantName = "Dr. Quantum — AI Clinical Specialist",
    voiceProvider = "11labs",
    voiceId = "clara",
    modelName = "gpt-4o",
    temperature = 0.3,
  } = {}) {
    const res = await fetch(`${API_BASE}/assistant-config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patientId,
        patient_name: patientName,
        assistant_name: assistantName,
        voice_provider: voiceProvider,
        voice_id: voiceId,
        model_name: modelName,
        temperature,
      }),
    });
    if (!res.ok) throw new Error("Failed to generate Vapi assistant payload");
    return await res.json();
  },

  /**
   * Interactive text / fallback consultation chat query
   */
  async sendChatMessage({ patientId = "PT-89421", patientName, message, history = [] }) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patientId,
        patient_name: patientName,
        message,
        history,
      }),
    });
    if (!res.ok) throw new Error("Failed to get response from AI Doctor");
    return await res.json();
  },
};
