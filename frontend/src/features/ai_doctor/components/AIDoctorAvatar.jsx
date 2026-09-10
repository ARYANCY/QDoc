import React, { useRef, useEffect } from "react";
import { Sparkles, Activity, ShieldCheck, Stethoscope, Mic, Volume2 } from "lucide-react";

export default function AIDoctorAvatar({ isSpeaking, isListening, callActive, voicePersonality = "sarah" }) {
  const canvasRef = useRef(null);

  // Animated Audio Equalizer Waveform on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw dynamic audio waveform
      const barCount = 32;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        let amplitude = 4;
        if (isSpeaking) {
          // Dynamic active wave pattern when AI Doctor is speaking
          const sine = Math.sin(phase + i * 0.35);
          const noise = Math.sin(phase * 1.5 + i * 0.8);
          amplitude = Math.abs(sine * 24 + noise * 12) + 6;
        } else if (isListening) {
          // Subtle pulse when listening to patient
          amplitude = Math.abs(Math.sin(phase * 0.8 + i * 0.2) * 10) + 3;
        } else if (callActive) {
          // Ambient idle breathing wave
          amplitude = Math.abs(Math.sin(phase * 0.4 + i * 0.15) * 6) + 2;
        }

        const x = i * (barWidth + 2) + 1;
        const barHeight = Math.min(height - 4, amplitude);
        const y = centerY - barHeight / 2;

        // Gradient color for bars
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isSpeaking) {
          grad.addColorStop(0, "#D4AF37"); // Haute Gold
          grad.addColorStop(1, "#0F766E"); // Teal
        } else if (isListening) {
          grad.addColorStop(0, "#0EA5E9"); // Sky
          grad.addColorStop(1, "#6366F1"); // Indigo
        } else {
          grad.addColorStop(0, "#52525B");
          grad.addColorStop(1, "#27272A");
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, Math.max(3, barHeight));
      }

      phase += isSpeaking ? 0.12 : (isListening ? 0.06 : 0.03);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, isListening, callActive]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #090A0C 0%, #121418 100%)",
        overflow: "hidden",
        border: "1px solid var(--border-default)",
      }}
    >
      {/* Background Neural Grid Accent */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(212, 175, 55, 0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      {/* Top Clinical Header Badges */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "16px",
          right: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "3px 8px",
              background: isSpeaking ? "var(--gold)" : (callActive ? "var(--accent-teal)" : "#27272A"),
              color: isSpeaking ? "#000000" : "#FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: isSpeaking ? "#000" : (callActive ? "#10B981" : "#A1A1AA"),
                animation: isSpeaking ? "pulse 1s infinite" : "none",
              }}
            />
            {isSpeaking ? "AI DOCTOR SPEAKING" : (isListening ? "LISTENING TO YOU..." : (callActive ? "VAPI LIVE CALL" : "STANDBY"))}
          </span>

          <span style={{ fontSize: "0.65rem", color: "var(--text-light)", fontFamily: "var(--font-mono)" }}>
            1-on-1 Telehealth AI
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 800,
              padding: "2px 6px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--gold)",
              fontFamily: "var(--font-mono)",
            }}
          >
            VAPI VOICE ENGINE
          </span>
        </div>
      </div>

      {/* Center 3D Neural Doctor Hologram Orb */}
      <div
        style={{
          position: "relative",
          width: "160px",
          height: "160px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "10px",
        }}
      >
        {/* Pulsing Outer Rings */}
        {isSpeaking && (
          <>
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "2px solid rgba(212, 175, 55, 0.4)",
                animation: "pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "130%",
                height: "130%",
                borderRadius: "50%",
                border: "1px solid rgba(15, 118, 110, 0.3)",
                animation: "pulseRing 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 0.5s",
              }}
            />
          </>
        )}

        {/* Doctor Core Sphere */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: isSpeaking
              ? "radial-gradient(circle at 30% 30%, #FDF8E2 0%, #D4AF37 45%, #0F766E 90%)"
              : "radial-gradient(circle at 30% 30%, #E2E8F0 0%, #334155 50%, #0F172A 100%)",
            boxShadow: isSpeaking
              ? "0 0 35px rgba(212, 175, 55, 0.5), 0 0 60px rgba(15, 118, 110, 0.3)"
              : "0 0 20px rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            border: "2px solid rgba(255, 255, 255, 0.25)",
            position: "relative",
            zIndex: 5,
          }}
        >
          <div style={{ textAlign: "center", color: isSpeaking ? "#0F1012" : "#FFFFFF" }}>
            <Stethoscope size={38} strokeWidth={2.2} />
            <div style={{ fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.08em", marginTop: "2px", textTransform: "uppercase" }}>
              Dr. Quantum
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Identity & Title */}
      <div style={{ textAlign: "center", marginTop: "16px", zIndex: 5 }}>
        <h3
          style={{
            margin: "0 0 4px 0",
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "#FFFFFF",
            fontFamily: "var(--font-serif)",
            letterSpacing: "0.02em",
          }}
        >
          Dr. Quantum, MD, Ph.D.
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "0.74rem",
            color: "var(--gold)",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Chief AI Clinical Specialist • Q-MedSense Platform
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: "0.66rem", color: "var(--text-light)" }}>
          Trained on Multi-Modal EHR, 3D Digital Twin & Quantum Diagnostic Models
        </p>
      </div>

      {/* Bottom Live Equalizer Bar Canvas */}
      <div
        style={{
          width: "85%",
          maxWidth: "360px",
          height: "44px",
          marginTop: "16px",
          marginBottom: "16px",
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
        }}
      >
        <canvas ref={canvasRef} width={340} height={36} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
