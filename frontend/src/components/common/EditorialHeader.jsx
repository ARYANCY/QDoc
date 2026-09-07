import { useState, useEffect } from "react";
import {
  User,
  LogOut,
  Sliders,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function EditorialHeader({
  currentUser,
  onLogout,
  onOpenProfile,
  highContrast,
  setHighContrast,
  activeTab,
  setActiveTab,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}) {
  const [timeString, setTimeString] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="editorial-header"
      style={{
        height: "58px",
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-default)",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        zIndex: 40,
        position: "relative",
      }}
    >
      {/* ── Left: Mobile Hamburger & Editorial Masthead Tag ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle Navigation Drawer"
          style={{
            background: "none",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xs)",
            padding: "6px",
            cursor: "pointer",
            color: "var(--ink-primary)",
            display: "none", // Display controlled via CSS media query
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("home")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: 0,
          }}
          title="Return to Home Overview"
        >
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.18rem",
              fontWeight: 900,
              letterSpacing: "0.04em",
              color: "var(--ink-primary)",
              textTransform: "uppercase",
            }}
          >
            Q-MEDSENSE
          </span>
          <span
            className="edition-badge"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.56rem",
              background: "var(--gold-light)",
              color: "var(--text-gold)",
              border: "1px solid var(--gold-border)",
              padding: "1px 6px",
              fontWeight: 800,
              letterSpacing: "0.10em",
            }}
          >
            ISSUE 09 // CLINIQUE
          </span>
        </button>

        <div
          className="header-divider-desktop"
          style={{
            width: "1px",
            height: "18px",
            background: "var(--border-default)",
          }}
        />

        {/* Live Quantum Clock & Telemetry */}
        <div
          className="header-telemetry-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.64rem",
            color: "var(--text-muted)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--emerald-couture)",
            }}
          />
          <span>QPU ONLINE: {timeString}</span>
        </div>
      </div>

      {/* ── Center / Actions: Quick Nav Links ── */}
      <nav className="header-nav-center" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            fontWeight: activeTab === "home" ? 800 : 600,
            color: activeTab === "home" ? "var(--ink-primary)" : "var(--text-muted)",
            borderBottom: activeTab === "home" ? "2px solid var(--gold)" : "2px solid transparent",
            padding: "4px 8px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s ease",
          }}
        >
          Project Story
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("diagnostic")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            fontWeight: activeTab === "diagnostic" ? 800 : 600,
            color: activeTab === "diagnostic" ? "var(--ink-primary)" : "var(--text-muted)",
            borderBottom: activeTab === "diagnostic" ? "2px solid var(--gold)" : "2px solid transparent",
            padding: "4px 8px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s ease",
          }}
        >
          Diagnostic Lab
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("twin")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            fontWeight: activeTab === "twin" ? 800 : 600,
            color: activeTab === "twin" ? "var(--ink-primary)" : "var(--text-muted)",
            borderBottom: activeTab === "twin" ? "2px solid var(--gold)" : "2px solid transparent",
            padding: "4px 8px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s ease",
          }}
        >
          Digital Twin
        </button>
      </nav>

      {/* ── Right: Notifications, A11y & Profile (Role switch removed; available strictly via login) ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Notifications Bell */}
        <NotificationBell />

        {/* A11y Contrast Toggle */}
        <button
          type="button"
          className={`a11y-pill-btn ${highContrast ? "active" : ""}`}
          onClick={() => setHighContrast(!highContrast)}
          title="Toggle High Contrast Mode"
          style={{
            background: highContrast ? "var(--ink-primary)" : "var(--bg-surface-alt)",
            color: highContrast ? "var(--gold)" : "var(--text-muted)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xs)",
            padding: "6px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sliders size={13} />
        </button>

        {/* User Profile Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px",
              background: "var(--bg-surface-alt)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xs)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "var(--ink-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.64rem",
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                border: "1px solid var(--gold)",
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  color: "var(--ink-primary)",
                  lineHeight: 1.1,
                }}
              >
                {currentUser?.name || "User"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.56rem",
                  color: "var(--text-gold)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 800,
                }}
              >
                {currentUser?.role || "GUEST"}
              </div>
            </div>
            <ChevronDown size={12} color="var(--text-muted)" />
          </button>

          {/* Menu dropdown */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "6px",
                width: "230px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xs)",
                boxShadow: "var(--shadow-md)",
                padding: "8px",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: "8px 10px",
                  borderBottom: "1px solid var(--border-subtle)",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    color: "var(--text-gold)",
                    fontWeight: 800,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    display: "block",
                  }}
                >
                  AUTHENTICATED AS
                </span>
                <strong style={{ fontSize: "0.82rem", color: "var(--ink-primary)", display: "block" }}>
                  {currentUser?.name}
                </strong>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  Role: {currentUser?.role?.toUpperCase()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenProfile();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "8px 10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.76rem",
                  textAlign: "left",
                  color: "var(--text-primary)",
                  borderRadius: "var(--radius-xs)",
                }}
              >
                <User size={13} />
                <span>Profile & Identity</span>
              </button>

              <div style={{ height: "1px", background: "var(--border-subtle)", margin: "4px 0" }} />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "8px 10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.76rem",
                  textAlign: "left",
                  color: "var(--risk-high)",
                  borderRadius: "var(--radius-xs)",
                }}
                title="Log out to switch role or account"
              >
                <LogOut size={13} />
                <span>Sign Out / Switch Persona</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
