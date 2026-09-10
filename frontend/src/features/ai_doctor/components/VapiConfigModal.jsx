import React, { useState, useEffect } from "react";
import { Key, ShieldCheck, CheckCircle2, AlertCircle, X, ExternalLink, Sparkles, Sliders } from "lucide-react";

export default function VapiConfigModal({ isOpen, onClose, onSaveConfig, currentConfig }) {
  const [publicKey, setPublicKey] = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [voiceId, setVoiceId] = useState("sarah");
  const [voiceProvider, setVoiceProvider] = useState("11labs");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem("qmed_vapi_public_key") || currentConfig?.vapi_public_key || "";
      const storedAst = localStorage.getItem("qmed_vapi_assistant_id") || currentConfig?.vapi_assistant_id || "";
      const storedVoice = localStorage.getItem("qmed_vapi_voice_id") || "sarah";
      setPublicKey(storedKey);
      setAssistantId(storedAst);
      setVoiceId(storedVoice);
      setSavedSuccess(false);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  function handleSave(e) {
    if (e) e.preventDefault();
    const cleanKey = publicKey.trim();
    const cleanAst = assistantId.trim();

    localStorage.setItem("qmed_vapi_public_key", cleanKey);
    localStorage.setItem("qmed_vapi_assistant_id", cleanAst);
    localStorage.setItem("qmed_vapi_voice_id", voiceId);

    if (onSaveConfig) {
      onSaveConfig({
        vapi_public_key: cleanKey,
        vapi_assistant_id: cleanAst,
        voice_id: voiceId,
        voice_provider: voiceProvider,
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  }

  function handleClear() {
    localStorage.removeItem("qmed_vapi_public_key");
    localStorage.removeItem("qmed_vapi_assistant_id");
    setPublicKey("");
    setAssistantId("");
    if (onSaveConfig) {
      onSaveConfig({
        vapi_public_key: "",
        vapi_assistant_id: "",
        voice_id: voiceId,
        voice_provider: voiceProvider,
      });
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 10, 12, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          maxWidth: "520px",
          width: "100%",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          position: "relative",
          animation: "modalFadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", background: "var(--primary-soft)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Key size={18} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Vapi Voice AI Settings
              </h3>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                Configure your Vapi Public API Key for real-time 1-on-1 Voice Telehealth
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Informational Card */}
        <div style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-default)", padding: "12px", marginBottom: "16px", fontSize: "0.74rem", lineHeight: 1.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "var(--primary)", marginBottom: "4px" }}>
            <ShieldCheck size={15} />
            <span>How Vapi Voice AI Operates</span>
          </div>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            Q-MedSense automatically injects your live vital signs, 3D health twin scores, and quantum diagnostic scan records into Vapi so the AI Doctor speaks with personalized medical context.
          </p>
          <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <a
              href="https://vapi.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent-teal)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px", textDecoration: "none" }}
            >
              Get Vapi API Key at vapi.ai <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Public API Key */}
          <div>
            <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px", color: "var(--text-primary)" }}>
              Vapi Public API Key (Public Token)
            </label>
            <input
              type="text"
              placeholder="e.g. 9b8e21a4-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "0.82rem",
                fontFamily: "var(--font-mono)",
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                boxSizing: "border-box",
              }}
            />
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", marginTop: "3px" }}>
              Found in your Vapi Dashboard under <strong>Settings → API Keys → Public Key</strong>.
            </span>
          </div>

          {/* Optional Custom Assistant ID */}
          <div>
            <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px", color: "var(--text-primary)" }}>
              Custom Vapi Assistant ID (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave blank to use auto-generated Dr. Quantum with your clinical EHR"
              value={assistantId}
              onChange={(e) => setAssistantId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "0.82rem",
                fontFamily: "var(--font-mono)",
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                boxSizing: "border-box",
              }}
            />
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", marginTop: "3px" }}>
              If blank, Q-MedSense dynamically provisions Dr. Quantum with your real-time medical dossier.
            </span>
          </div>

          {/* Voice Personality */}
          <div>
            <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px", color: "var(--text-primary)" }}>
              Doctor Voice Personality
            </label>
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "0.82rem",
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                boxSizing: "border-box",
              }}
            >
              <option value="dashboard">Use Voice Configured in Vapi Dashboard (e.g. Clara)</option>
              <option value="clara">Clara (ElevenLabs / Vapi — Warm & Natural Female)</option>
              <option value="sarah">Dr. Sarah (ElevenLabs — Empathetic Female Physician)</option>
              <option value="aura-asteria-en">Dr. Asteria (Deepgram — Crisp Clear Female)</option>
              <option value="george">Dr. George (ElevenLabs — Reassuring Senior Physician)</option>
              <option value="alloy">Dr. Quantum (OpenAI — Direct Specialist)</option>
            </select>
          </div>

          {savedSuccess && (
            <div style={{ background: "var(--risk-low-bg)", color: "var(--risk-low)", border: "1px solid var(--risk-low-border)", padding: "8px 12px", fontSize: "0.76rem", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
              <CheckCircle2 size={16} />
              <span>Vapi configuration saved successfully!</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary"
              style={{ padding: "8px 14px", fontSize: "0.76rem" }}
            >
              Clear Keys
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1, padding: "8px 16px", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase" }}
            >
              Save & Activate Vapi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
