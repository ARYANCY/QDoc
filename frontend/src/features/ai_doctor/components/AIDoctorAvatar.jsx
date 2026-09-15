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
      const barCount = 36;
      const barWidth = width / barCount - 3;

      for (let i = 0; i < barCount; i++) {
        let amplitude = 4;
        if (isSpeaking) {
          // Dynamic active wave pattern when AI Doctor is speaking
          const sine = Math.sin(phase + i * 0.35);
          const noise = Math.sin(phase * 1.5 + i * 0.8);
          amplitude = Math.abs(sine * 24 + noise * 12) + 6;
        } else if (isListening) {
          // Subtle pulse when listening to patient
          amplitude = Math.abs(Math.sin(phase * 0.8 + i * 0.2) * 12) + 4;
        } else if (callActive) {
          // Ambient idle breathing wave
          amplitude = Math.abs(Math.sin(phase * 0.4 + i * 0.15) * 6) + 3;
        }

        const x = i * (barWidth + 3) + 2;
        const barHeight = Math.min(height - 4, amplitude);
        const y = centerY - barHeight / 2;

        // Gradient color for bars
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isSpeaking) {
          grad.addColorStop(0, "#2563EB"); // Blue
          grad.addColorStop(1, "#059669"); // Emerald
        } else if (isListening) {
          grad.addColorStop(0, "#0284C7"); // Sky
          grad.addColorStop(1, "#6366F1"); // Indigo
        } else {
          grad.addColorStop(0, "#94A3B8"); // Slate
          grad.addColorStop(1, "#CBD5E1");
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
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        overflow: "hidden",
        border: "1px solid var(--border-default)",
        boxSizing: "border-box",
      }}
    >
      {/* Background Subtle Dot Pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(#E2E8F0 1.2px, transparent 1.2px)",
          backgroundSize: "20px 20px",
          opacity: 0.8,
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
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "4px 9px",
              borderRadius: "4px",
              background: isSpeaking ? "#EFF6FF" : (callActive ? "#ECFDF5" : "#F1F5F9"),
              color: isSpeaking ? "#1D4ED8" : (callActive ? "#059669" : "#64748B"),
              border: `1px solid ${isSpeaking ? "#BFDBFE" : (callActive ? "#A7F3D0" : "#E2E8F0")}`,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: isSpeaking ? "#2563EB" : (callActive ? "#10B981" : "#94A3B8"),
                animation: isSpeaking ? "pulse 1s infinite" : "none",
              }}
            />
            {isSpeaking ? "AI DOCTOR SPEAKING" : (isListening ? "LISTENING..." : (callActive ? "LIVE CALL" : "STANDBY"))}
          </span>

          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>
            1-on-1 Telehealth AI
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 700,
              color: "#2563EB",
              background: "#EFF6FF",
              border: "1px solid #DBEAFE",
              padding: "3px 8px",
              borderRadius: "4px",
            }}
          >
            VAPI VOICE ENGINE
          </span>
        </div>
      </div>

      {/* Main Avatar Orb */}
      <div
        style={{
          position: "relative",
          width: "140px",
          height: "140px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          zIndex: 5,
        }}
      >
        {/* Animated Glow Rings */}
        <div
          style={{
            position: "absolute",
            inset: isSpeaking ? "-14px" : "-6px",
            borderRadius: "50%",
            background: isSpeaking
              ? "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(5,150,105,0.08) 70%, transparent 100%)"
              : "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
            transition: "all 0.3s ease",
            animation: isSpeaking ? "pulseRipple 1.8s infinite" : "none",
          }}
        />

        {/* Doctor Avatar Orb */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
            border: "3px solid #FFFFFF",
            boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.15), 0 2px 6px rgba(15, 23, 42, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            position: "relative",
            zIndex: 6,
          }}
        >
          <Stethoscope size={36} color="#60A5FA" style={{ marginBottom: "4px" }} />
          <span style={{ fontSize: "0.60rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F8FAFC" }}>
            DR. QUANTUM
          </span>
        </div>
      </div>

      {/* Doctor Name & Designation */}
      <div style={{ textAlign: "center", zIndex: 5, marginBottom: "12px" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "var(--ink-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          Dr. Quantum, MD, Ph.D.
        </h3>
        <p
          style={{
            margin: "3px 0 0 0",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--accent-blue)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Chief AI Clinical Specialist • Q-MedSense Platform
        </p>
        <span style={{ fontSize: "0.66rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
          Trained on Multi-Modal EHR, 3D Digital Twin & Quantum Diagnostic Models
        </span>
      </div>

      {/* Audio Waveform Equalizer Canvas */}
      <div
        style={{
          width: "280px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
        }}
      >
        <canvas
          ref={canvasRef}
          width={280}
          height={36}
          style={{ width: "280px", height: "36px" }}
        />
      </div>
    </div>
  );
}
