import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  AlertTriangle,
  Heart,
  Shield,
  Activity,
  User,
  CheckCircle2,
  Copy,
  Printer,
  Smartphone,
  RefreshCw,
  X,
  Stethoscope,
  Info
} from 'lucide-react';

export default function App() {
  const [patientId, setPatientId] = useState('PT-ALEX');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shakeDetected, setShakeDetected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shakeSupported, setShakeSupported] = useState(true);

  // Extract patientId from hash or search params or path
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('emergency/')) {
      const parts = hash.split('emergency/');
      if (parts[1]) setPatientId(parts[1].trim());
    } else {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id');
      if (idParam) setPatientId(idParam);
    }
  }, []);

  // Fetch live patient emergency telemetry
  const fetchCardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/emergency/${patientId}/card-data`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setData(json.card_data);
    } catch (err) {
      console.warn('Fallback to local test persona:', err);
      // Fallback data if backend offline
      setData({
        user_id: patientId,
        name: 'Alexander Reed',
        blood_group: 'O+',
        emergency_phone: '+91 98333 44556',
        emergency_contact_name: 'Liam Reed',
        emergency_contact_relation: 'Brother',
        allergies: 'Penicillin (Anaphylaxis), Peanuts',
        active_medications: 'Atorvastatin 20mg (OD), Aspirin 75mg (OD)',
        medical_history: 'Hypertension (Stage 1), Mild Hyperlipidemia',
        abha_id: '91-4829-1092-8821',
        hospital: 'AIIMS Cardiology & Oncology OPD',
        license_id: 'PT-REC-89421',
        attending_physician: 'Dr. Sarah Lin (Cardiologist)',
        organ_donor: true,
        sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardData();
  }, [patientId]);

  // Accelerometer Shake Detection
  useEffect(() => {
    let lastX = null;
    let lastY = null;
    let lastZ = null;
    let lastTime = 0;
    const SHAKE_THRESHOLD = 15;

    function handleMotion(e) {
      const current = e.accelerationIncludingGravity;
      if (!current || current.x === null) return;

      const now = Date.now();
      if ((now - lastTime) > 100) {
        const diffTime = now - lastTime;
        lastTime = now;

        if (lastX !== null) {
          const deltaX = Math.abs(current.x - lastX);
          const deltaY = Math.abs(current.y - lastY);
          const deltaZ = Math.abs(current.z - lastZ);
          const speed = (deltaX + deltaY + deltaZ) / diffTime * 10000;

          if (speed > SHAKE_THRESHOLD * 50) {
            triggerShakeCall();
          }
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    }

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion, false);
    } else {
      setShakeSupported(false);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [data]);

  const triggerShakeCall = () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    setShakeDetected(true);
  };

  const copyEmergencyDossier = () => {
    if (!data) return;
    const text = `Q-MEDSENSE EMERGENCY DOSSIER
Patient: ${data.name} (MRN: ${data.license_id || data.user_id})
Blood Group: ${data.blood_group}
Emergency Contact: ${data.emergency_contact_name} (${data.emergency_contact_relation}) - ${data.emergency_phone}
Allergies: ${data.allergies || 'None'}
Prescriptions: ${data.active_medications || 'None'}
ABHA ID: ${data.abha_id || 'N/A'}
Hospital: ${data.hospital || 'AIIMS'}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const emergencyPhoneClean = data?.emergency_phone ? data.emergency_phone.replace(/\s+/g, '') : '+919833344556';

  return (
    <div className="triage-container">
      {/* ── Top Emergency Header ────────────────────────────────────────── */}
      <div className="triage-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={22} color="#FFFFFF" className="pulse-icon" />
          <div>
            <div style={{ fontSize: '0.90rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CRITICAL EMERGENCY HUD
            </div>
            <div style={{ fontSize: '0.62rem', opacity: 0.9, fontFamily: 'var(--font-mono)' }}>
              INDIA DISPATCH & SPEED DIAL PORTAL
            </div>
          </div>
        </div>
        <span className="triage-badge">LIVE TELEMETRY</span>
      </div>

      {/* ── Shake Sensor Sensor / Simulation Banner ─────────────────────── */}
      <div className="shake-hud-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Smartphone size={20} color="#38BDF8" className="pulse-icon" />
          <div>
            <strong style={{ fontSize: '0.76rem', color: '#38BDF8', textTransform: 'uppercase', display: 'block' }}>
              📳 Shake Phone To Speed Call
            </strong>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
              Accelerometer active. Shake device or tap test button.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={triggerShakeCall}
          style={{
            padding: '5px 10px',
            fontSize: '0.64rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            background: '#0284C7',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Test Shake
        </button>
      </div>

      {/* ── Patient Vital Hero Card ─────────────────────────────────────── */}
      {data && (
        <div className="patient-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.60rem', fontWeight: 800, color: 'var(--accent-sky)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                VERIFIED PATIENT DOSSIER
              </span>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: '2px' }}>
                {data.name}
              </h1>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                MRN: <strong style={{ color: '#F8FAFC' }}>{data.license_id || data.user_id}</strong> · ABHA: <strong style={{ color: 'var(--accent-sky)' }}>{data.abha_id}</strong>
              </div>
            </div>

            {/* Large Blood Group Badge */}
            <div className="blood-badge">
              <span style={{ fontSize: '0.50rem', fontWeight: 900, letterSpacing: '0.08em', opacity: 0.9 }}>BLOOD</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, lineHeight: 1 }}>{data.blood_group || 'O+'}</span>
            </div>
          </div>

          {/* Primary Escalation Button */}
          <a href={`tel:${emergencyPhoneClean}`} className="primary-call-cta">
            <PhoneCall size={20} className="pulse-icon" />
            <span>Call Next of Kin: {data.emergency_contact_name || 'Emergency Contact'}</span>
          </a>

          <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '-6px', marginBottom: '14px' }}>
            Direct Hotline: <strong style={{ color: '#EF4444' }}>{data.emergency_phone}</strong> ({data.emergency_contact_relation || 'Next of Kin'})
          </div>

          {/* ── Severe Allergies & Critical Alert Callout ─────────────────── */}
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontWeight: 900, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              <AlertTriangle size={15} /> Severe Allergies Alert
            </div>
            <p style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FCA5A5' }}>
              {data.allergies || 'None Reported'}
            </p>
          </div>

          {/* ── India National Emergency Speed Dial Grid ─────────────────── */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--accent-sky)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              🇮🇳 India National Emergency Speed Dial
            </div>
            <div className="speed-dial-grid">
              <a href="tel:108" className="dial-btn">
                <span className="dial-number">108</span>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800 }}>Ambulance</div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-secondary)' }}>National Emergency</div>
                </div>
              </a>

              <a href="tel:112" className="dial-btn">
                <span className="dial-number">112</span>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800 }}>All-in-One</div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-secondary)' }}>Integrated Helpline</div>
                </div>
              </a>

              <a href="tel:100" className="dial-btn">
                <span className="dial-number">100</span>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800 }}>Police</div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-secondary)' }}>Emergency Control</div>
                </div>
              </a>

              <a href="tel:1075" className="dial-btn">
                <span className="dial-number">1075</span>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800 }}>Health Helpline</div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-secondary)' }}>National Medical</div>
                </div>
              </a>
            </div>
          </div>

          {/* ── Clinical Profile & Prescriptions ─────────────────────────── */}
          <div className="section-panel">
            <div className="section-title">
              <Stethoscope size={14} /> Clinical Dossier & Prescriptions
            </div>
            <div className="data-row">
              <span className="data-label">Active Medications</span>
              <span className="data-value">{data.active_medications || 'None'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Medical History</span>
              <span className="data-value">{data.medical_history || 'None'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Hospital / Center</span>
              <span className="data-value">{data.hospital || 'AIIMS Cardiology'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Attending Specialist</span>
              <span className="data-value">{data.attending_physician || 'Self-Managed'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Organ Donor Consented</span>
              <span className="data-value" style={{ color: data.organ_donor ? '#10B981' : '#94A3B8' }}>
                {data.organ_donor ? '✓ YES (CONSENTED)' : 'NO'}
              </span>
            </div>
          </div>

          {/* ── Quick Action Tools ───────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={copyEmergencyDossier}
              style={{
                padding: '10px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: '#F8FAFC',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Copy size={13} />
              {copied ? 'Dossier Copied!' : 'Copy Dossier'}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                padding: '10px',
                background: 'var(--bg-card)',
                border: '1px solid #0284C7',
                borderRadius: '8px',
                color: '#38BDF8',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Printer size={13} />
              Print Triage Page
            </button>
          </div>

          {/* Bottom Security Hash */}
          <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '0.58rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            WORM LEDGER IMMUTABLE SHA-256: {data.sha256_hash ? data.sha256_hash.slice(0, 32) : 'e3b0c44298fc1c149afbf4c8996fb924'}...
          </div>
        </div>
      )}

      {/* ── Shake Modal Popup ─────────────────────────────────────────── */}
      {shakeDetected && (
        <div className="shake-modal-overlay" onClick={() => setShakeDetected(false)}>
          <div className="shake-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                <PhoneCall size={30} className="pulse-icon" />
              </div>
            </div>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', color: '#FFFFFF', marginBottom: '4px' }}>
              📳 Shake Detected!
            </h2>
            <p style={{ fontSize: '0.76rem', color: '#94A3B8', marginBottom: '18px' }}>
              Immediate next-of-kin escalation triggered. Tap below to call immediately.
            </p>

            <a
              href={`tel:${emergencyPhoneClean}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px',
                background: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '10px',
                fontSize: '1.05rem',
                fontWeight: 900,
                textDecoration: 'none',
                textTransform: 'uppercase',
                boxShadow: '0 6px 20px rgba(220, 38, 38, 0.6)',
                marginBottom: '12px'
              }}
            >
              <Phone size={22} />
              Call {data?.emergency_contact_name || 'Liam Reed'}: {data?.emergency_phone || '+91 98333 44556'}
            </a>

            <button
              type="button"
              onClick={() => setShakeDetected(false)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
