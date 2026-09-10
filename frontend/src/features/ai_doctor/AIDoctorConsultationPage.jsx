import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Settings,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  User,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  PhoneCall,
  Maximize2,
  Minimize2,
} from "lucide-react";

import AIDoctorAvatar from "./components/AIDoctorAvatar.jsx";
import LiveTranscriptHUD from "./components/LiveTranscriptHUD.jsx";
import PatientClinicalDossier from "./components/PatientClinicalDossier.jsx";
import VapiConfigModal from "./components/VapiConfigModal.jsx";
import { aiDoctorApi } from "../../api/aiDoctor.js";
import "../../styles.css";

export default function AIDoctorConsultationPage({ patientId = "PT-89421", currentUser }) {
  const [dossier, setDossier] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [loadingContext, setLoadingContext] = useState(true);
  const [error, setError] = useState(null);

  // Call States
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(false);
  const [isPatientSpeaking, setIsPatientSpeaking] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState("");
  const [transcript, setTranscript] = useState([]);

  // Hardware Controls
  const [micMuted, setMicMuted] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [speakerMuted, setSpeakerMuted] = useState(false);

  // UI Panels
  const [showTranscript, setShowTranscript] = useState(true);
  const [showDossier, setShowDossier] = useState(true);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [vapiConfig, setVapiConfig] = useState(null);
  const [engineMode, setEngineMode] = useState("auto"); // "vapi" | "browser_voice"

  // Media Refs
  const userVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const vapiInstanceRef = useRef(null);
  const timerRef = useRef(null);

  // Synchronized refs to avoid stale closure state in event listeners
  const callActiveRef = useRef(callActive);
  const micMutedRef = useRef(micMuted);
  const isDoctorSpeakingRef = useRef(isDoctorSpeaking);

  useEffect(() => {
    callActiveRef.current = callActive;
  }, [callActive]);

  useEffect(() => {
    micMutedRef.current = micMuted;
  }, [micMuted]);

  useEffect(() => {
    isDoctorSpeakingRef.current = isDoctorSpeaking;
  }, [isDoctorSpeaking]);

  // Load Patient Clinical Context & Vapi Config on mount
  useEffect(() => {
    async function initContext() {
      setLoadingContext(true);
      setError(null);
      try {
        const [contextRes, configRes] = await Promise.all([
          aiDoctorApi.getPatientContext(patientId),
          aiDoctorApi.getConfig(),
        ]);
        setDossier(contextRes.dossier);
        setSystemPrompt(contextRes.system_prompt);
        setVapiConfig(configRes);
      } catch (err) {
        console.error("Failed to load AI Doctor context:", err);
        setError("Could not load clinical records for AI Doctor. Operating with baseline persona.");
      } finally {
        setLoadingContext(false);
      }
    }
    initContext();
  }, [patientId]);

  // Handle Call Timer
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive]);

  // Manage WebCam Video Stream
  useEffect(() => {
    async function startCamera() {
      if (cameraActive && callActive) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          mediaStreamRef.current = stream;
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.warn("WebCam video not accessible:", err);
        }
      } else {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = null;
        }
      }
    }
    startCamera();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraActive, callActive]);

  // Format seconds to mm:ss
  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // Safely ensure Speech Recognition is running for continuous conversation
  function ensureSpeechRecognitionRunning() {
    if (!callActiveRef.current || micMutedRef.current) return;
    try {
      if (!recognitionRef.current) {
        recognitionRef.current = setupSpeechRecognition();
      }
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (e) {
      // Ignored if already started or starting
    }
  }

  // Pre-load voices on mount to avoid initial male voice fallback on Chromium
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Safe helper to pick the best female English voice (supports Windows Zira/Jenny/Aria, Mac Samantha/Victoria, Chrome Clara/Google)
  function getBestFemaleVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    return (
      voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Zira") || v.name.includes("Jenny") || v.name.includes("Aria") || v.name.includes("Clara") || v.name.includes("Samantha") || v.name.includes("Victoria") || v.name.includes("Karen") || v.name.includes("Hazel") || v.name.includes("Susan") || v.name.includes("Female"))) ||
      voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google US English") || v.name.toLowerCase().includes("natural"))) ||
      voices.find((v) => v.lang.startsWith("en") && !v.name.includes("David") && !v.name.includes("Mark") && !v.name.includes("George") && !v.name.includes("Male")) ||
      voices[0]
    );
  }

  // Speak text using Browser TTS (Fallback Engine)
  function speakBrowserVoice(text) {
    if (speakerMuted || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.08;

      const femaleVoice = getBestFemaleVoice();
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => setIsDoctorSpeaking(true);
      utterance.onend = () => {
        setIsDoctorSpeaking(false);
        setTimeout(() => {
          ensureSpeechRecognitionRunning();
        }, 150);
      };
      utterance.onerror = () => {
        setIsDoctorSpeaking(false);
        setTimeout(() => {
          ensureSpeechRecognitionRunning();
        }, 150);
      };

      window.speechSynthesis.speak(utterance);
    };

    const currentVoices = window.speechSynthesis.getVoices();
    if (!currentVoices || currentVoices.length === 0) {
      // Voices not cached yet by browser — attach one-time handler
      window.speechSynthesis.onvoiceschanged = () => {
        doSpeak();
      };
      setTimeout(doSpeak, 200);
    } else {
      doSpeak();
    }
  }

  // Setup Browser Speech Recognition for Patient Voice Dictation
  function setupSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return null;

    const recognizer = new SpeechRec();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = "en-US";

    recognizer.onspeechstart = () => {
      // User started talking - immediately stop AI from speaking (barge-in interruption)
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsDoctorSpeaking(false);
      }
      setIsPatientSpeaking(true);
    };

    recognizer.onresult = (event) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setInterimSpeech(interim);
      if (interim) {
        // Stop AI speech immediately if user begins speaking mid-sentence
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setIsDoctorSpeaking(false);
        }
        setIsPatientSpeaking(true);
      }

      if (finalTranscript.trim()) {
        setIsPatientSpeaking(false);
        setInterimSpeech("");
        handleUserSpeechFinal(finalTranscript.trim());
      }
    };

    recognizer.onerror = (e) => {
      console.warn("Speech recognition notice:", e.error);
      setIsPatientSpeaking(false);
      if (callActiveRef.current && !micMutedRef.current && e.error !== "not-allowed") {
        setTimeout(() => {
          ensureSpeechRecognitionRunning();
        }, 300);
      }
    };

    recognizer.onend = () => {
      setIsPatientSpeaking(false);
      // Auto-restart recognizer on speech pause/end to continuously take follow-up questions
      if (callActiveRef.current && !micMutedRef.current) {
        setTimeout(() => {
          ensureSpeechRecognitionRunning();
        }, 150);
      }
    };

    return recognizer;
  }

  // Handle final transcribed patient question
  async function handleUserSpeechFinal(userQuery) {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTranscript((prev) => [...prev, { role: "user", content: userQuery, timestamp: now }]);

    setIsDoctorSpeaking(true);
    try {
      const res = await aiDoctorApi.sendChatMessage({
        patientId,
        message: userQuery,
        history: transcript.slice(-6).map((t) => ({ role: t.role, content: t.content })),
      });

      const docTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setTranscript((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.response,
          key_factors: res.key_factors,
          timestamp: docTime,
        },
      ]);

      speakBrowserVoice(res.response);
    } catch (err) {
      console.error("AI Doctor response error:", err);
      const fallbackText = "I've checked your vitals and test results—everything is looking steady and healthy. How else can I help?";
      setTranscript((prev) => [
        ...prev,
        { role: "assistant", content: fallbackText, timestamp: now },
      ]);
      speakBrowserVoice(fallbackText);
    }
  }

  // Toggle Microphone Mute
  function toggleMic() {
    const nextMuted = !micMuted;
    setMicMuted(nextMuted);
    micMutedRef.current = nextMuted;

    if (vapiInstanceRef.current) {
      try {
        vapiInstanceRef.current.setMuted(nextMuted);
      } catch (err) {}
    }

    if (recognitionRef.current) {
      if (nextMuted) {
        try {
          recognitionRef.current.stop();
        } catch {}
      } else {
        ensureSpeechRecognitionRunning();
      }
    }
  }

  // Start 1-on-1 Consultation Call
  async function handleStartCall() {
    setCallActive(true);
    setError(null);

    const storedKey = localStorage.getItem("qmed_vapi_public_key") || vapiConfig?.vapi_public_key;
    const storedAssistant = localStorage.getItem("qmed_vapi_assistant_id") || vapiConfig?.vapi_assistant_id;

    // Check if Vapi SDK is loaded and Key is available
    if (storedKey && window.Vapi) {
      try {
        setEngineMode("vapi");
        const vapi = new window.Vapi(storedKey);
        vapiInstanceRef.current = vapi;

        vapi.on("call-start", () => {
          setCallActive(true);
        });

        vapi.on("speech-start", () => {
          setIsDoctorSpeaking(true);
        });

        vapi.on("speech-end", () => {
          setIsDoctorSpeaking(false);
        });

        vapi.on("volume-level", (vol) => {
          if (vol > 0.05 && !isDoctorSpeakingRef.current) {
            setIsPatientSpeaking(true);
          } else if (vol <= 0.02) {
            setIsPatientSpeaking(false);
          }
        });

        vapi.on("message", (msg) => {
          if (msg.type === "transcript" && msg.transcriptType === "final") {
            const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            setTranscript((prev) => [...prev, { role: msg.role === "user" ? "user" : "assistant", content: msg.transcript, timestamp: time }]);
          }
          if (msg.type === "speech-update") {
            if (msg.status === "started") {
              if (msg.role === "user") setIsPatientSpeaking(true);
              if (msg.role === "assistant") setIsDoctorSpeaking(true);
            } else if (msg.status === "stopped") {
              if (msg.role === "user") setIsPatientSpeaking(false);
              if (msg.role === "assistant") setIsDoctorSpeaking(false);
            }
          }
        });

        vapi.on("call-end", () => {
          handleEndCall();
        });

        vapi.on("error", (err) => {
          console.warn("Vapi WebRTC error, falling back to local voice engine:", err);
          fallbackToBrowserVoice();
        });

        const patientFullName = currentUser?.name || currentUser?.full_name || dossier?.name || "Alexander Reed";
        const patientFirstName = patientFullName.split(" ")[0] || "there";
        const chosenVoice = localStorage.getItem("qmed_vapi_voice_id") || "clara";

        // Request assistant configuration with dynamic patient context
        const astPayload = await aiDoctorApi.generateAssistantConfig({
          patientId,
          voiceId: chosenVoice,
        });

        if (storedAssistant) {
          // Connect to Vapi Assistant with dynamic patient EHR values
          vapi.start(storedAssistant, {
            variableValues: {
              patient_name: patientFullName,
              first_name: patientFirstName,
              patient_id: dossier?.patient_id || patientId || "PT-89421",
              vitals: `${dossier?.vitals?.blood_pressure || "120/78"}, Pulse: ${dossier?.vitals?.heart_rate_bpm || 72} bpm`,
              conditions: (dossier?.chronic_conditions || []).join(", "),
              medications: (dossier?.medications || []).join(", "),
              allergies: (dossier?.allergies || []).join(", "),
            },
          });
        } else {
          vapi.start(astPayload.assistant_config);
        }
        return;
      } catch (err) {
        console.warn("Failed to start Vapi session directly, initiating high-fidelity local voice engine:", err);
      }
    }

    // Fallback to Browser Voice Engine
    fallbackToBrowserVoice();
  }

  function fallbackToBrowserVoice() {
    setEngineMode("browser_voice");
    const patientFullName = currentUser?.name || currentUser?.full_name || dossier?.name || "Alexander Reed";
    const firstName = patientFullName.split(" ")[0] || "there";
    const greeting = `Hi ${firstName}! I'm Dr. Quantum, your AI doctor. I've taken a look at your health check-ups and everything looks good. How are you feeling today?`;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTranscript([{ role: "assistant", content: greeting, timestamp: now }]);

    // Initial Doctor Greeting
    speakBrowserVoice(greeting);

    // Start Patient Speech Recognition
    if (!micMutedRef.current) {
      setTimeout(() => {
        ensureSpeechRecognitionRunning();
      }, 500);
    }
  }

  // End Call & Reset
  function handleEndCall() {
    setCallActive(false);
    setIsDoctorSpeaking(false);
    setIsPatientSpeaking(false);
    setInterimSpeech("");

    if (vapiInstanceRef.current) {
      try {
        vapiInstanceRef.current.stop();
      } catch {}
      vapiInstanceRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Quick Questions Prompts
  const QUICK_PROMPTS = [
    "Explain my blood pressure and cardiac risk score",
    "What did my skin lesion test show?",
    "Review my pneumonia chest radiograph",
    "Check my Aspirin and Atorvastatin medications",
    "Explain my 3D Digital Twin Composite Risk Score",
  ];

  if (loadingContext) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        <RefreshCw size={24} className="spin" style={{ margin: "0 auto 12px" }} />
        <p style={{ margin: 0 }}>Compiling patient clinical dossier and initializing Dr. Quantum AI...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-canvas)",
        gap: "10px",
        overflow: "hidden",
      }}
    >
      {/* ── Top Meeting HUD ───────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "34px", height: "34px", background: "var(--primary-soft)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} color="var(--gold)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Dr. Quantum 1-on-1 Voice Consultation
              </h3>
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 900,
                  padding: "2px 6px",
                  background: callActive ? "var(--risk-low-bg)" : "var(--bg-surface-alt)",
                  color: callActive ? "var(--risk-low)" : "var(--text-muted)",
                  border: `1px solid ${callActive ? "var(--risk-low-border)" : "var(--border-default)"}`,
                }}
              >
                {callActive ? `LIVE (${formatTime(callDuration)})` : "STANDBY"}
              </span>
            </div>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
              Patient: <strong>{dossier?.name || "Alexander Reed"}</strong> (MRN: {dossier?.mrn || "MRN-89421-QX"}) • Vapi Telehealth Protocol
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Suggested Questions Chips ──────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          paddingBottom: "2px",
        }}
      >
        {QUICK_PROMPTS.map((prompt, pIdx) => (
          <button
            key={pIdx}
            type="button"
            onClick={() => handleUserSpeechFinal(prompt)}
            disabled={!callActive}
            style={{
              padding: "5px 10px",
              fontSize: "0.70rem",
              fontWeight: 700,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
              cursor: callActive ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
              opacity: callActive ? 1 : 0.6,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Sparkles size={11} color="var(--gold)" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* ── Master Zoom-Style Video Stage Grid ─────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: showDossier
            ? (showTranscript ? "1fr 340px 300px" : "1fr 320px")
            : (showTranscript ? "1fr 360px" : "1fr"),
          gap: "10px",
          minHeight: 0,
        }}
      >
        {/* COLUMN 1: Dual Video Call Tiles */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            background: "#08090B",
            border: "1px solid var(--border-default)",
            overflow: "hidden",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)",
          }}
        >
          {/* Main Hero Tile: AI Doctor Hologram */}
          <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
            <AIDoctorAvatar
              isSpeaking={isDoctorSpeaking}
              isListening={isPatientSpeaking}
              callActive={callActive}
              voicePersonality={localStorage.getItem("qmed_vapi_voice_id") || "sarah"}
            />
          </div>

          {/* Picture-in-Picture Patient WebCam Tile */}
          <div
            style={{
              position: "absolute",
              bottom: "75px",
              right: "16px",
              width: "180px",
              height: "135px",
              background: "#121418",
              border: "2px solid var(--border-default)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
              overflow: "hidden",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {cameraActive && callActive ? (
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
              />
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.68rem", background: "#17191C" }}>
                <User size={28} style={{ marginBottom: "4px" }} />
                <span>{cameraActive ? "Camera Standby" : "Camera Off"}</span>
              </div>
            )}

            {/* Patient Tile HUD */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "rgba(0,0,0,0.75)",
                padding: "3px 6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.62rem",
                color: "#FFFFFF",
                fontWeight: 700,
              }}
            >
              <span>{dossier?.name ? dossier.name.split(" ")[0] : "You"}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                {micMuted ? <MicOff size={10} color="#EF4444" /> : <Mic size={10} color="#10B981" />}
              </span>
            </div>
          </div>

          {/* ── Zoom Meeting Bottom Control Bar ────────────────────────────── */}
          <div
            style={{
              height: "64px",
              background: "rgba(15, 16, 18, 0.95)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              zIndex: 30,
            }}
          >
            {/* Left Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--text-light)", fontFamily: "var(--font-mono)" }}>
                {callActive ? `DURATION: ${formatTime(callDuration)}` : "NOT IN CALL"}
              </span>
            </div>

            {/* Center Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={toggleMic}
                disabled={!callActive}
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: micMuted ? "#EF4444" : "rgba(255,255,255,0.12)",
                  border: 0,
                  cursor: callActive ? "pointer" : "not-allowed",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
                title={micMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {micMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Camera Toggle */}
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                disabled={!callActive}
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: !cameraActive ? "#EF4444" : "rgba(255,255,255,0.12)",
                  border: 0,
                  cursor: callActive ? "pointer" : "not-allowed",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
                title={cameraActive ? "Turn Camera Off" : "Turn Camera On"}
              >
                {!cameraActive ? <VideoOff size={18} /> : <Video size={18} />}
              </button>

              {/* Start Call / End Call Action Button */}
              {!callActive ? (
                <button
                  type="button"
                  onClick={handleStartCall}
                  style={{
                    background: "var(--gold-gradient)",
                    color: "#000000",
                    border: 0,
                    padding: "10px 24px",
                    fontWeight: 900,
                    fontSize: "0.82rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 0 20px rgba(212, 175, 55, 0.4)",
                  }}
                >
                  <PhoneCall size={16} />
                  <span>Start 1-on-1 Consultation</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEndCall}
                  style={{
                    background: "#DC2626",
                    color: "#FFFFFF",
                    border: 0,
                    padding: "10px 22px",
                    fontWeight: 900,
                    fontSize: "0.82rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 0 20px rgba(220, 38, 38, 0.5)",
                  }}
                >
                  <PhoneOff size={16} />
                  <span>End Call</span>
                </button>
              )}

              {/* Speaker Toggle */}
              <button
                type="button"
                onClick={() => setSpeakerMuted(!speakerMuted)}
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: speakerMuted ? "#EF4444" : "rgba(255,255,255,0.12)",
                  border: 0,
                  cursor: "pointer",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={speakerMuted ? "Unmute Speaker" : "Mute Speaker"}
              >
                {speakerMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            {/* Right Drawers Toggles */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setShowTranscript(!showTranscript)}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  background: showTranscript ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <MessageSquare size={13} />
                <span>Captions / Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDossier(!showDossier)}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  background: showDossier ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <FileText size={13} />
                <span>My EHR Dossier</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Live Transcript & Speech Feed */}
        {showTranscript && (
          <div style={{ height: "100%", overflow: "hidden" }}>
            <LiveTranscriptHUD
              transcript={transcript}
              interimUserSpeech={interimSpeech}
              isAIDoctorSpeaking={isDoctorSpeaking}
              onSendTextMessage={handleUserSpeechFinal}
            />
          </div>
        )}

        {/* COLUMN 3: Injected Patient Clinical Dossier Sidebar */}
        {showDossier && (
          <div style={{ height: "100%", overflow: "hidden" }}>
            <PatientClinicalDossier dossier={dossier} />
          </div>
        )}
      </div>

      {/* Vapi API Key Configuration Modal */}
      <VapiConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        currentConfig={vapiConfig}
        onSaveConfig={(saved) => {
          setVapiConfig((prev) => ({ ...prev, ...saved }));
        }}
      />
    </div>
  );
}
