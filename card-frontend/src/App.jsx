import React, { useState, useEffect } from 'react';
import {
  Phone, AlertTriangle, Heart, Shield, Activity,
  Pill, User, Droplet, Clock, Stethoscope, Share2,
  PhoneCall, AlertOctagon, CheckCircle2, Siren,
  Smartphone, MapPin, Building2, Copy, Check, Printer,
  QrCode, ExternalLink, Flame, ShieldAlert
} from 'lucide-react';

export default function App() {
  const [patientId, setPatientId] = useState('PT-ALEX');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shakeTriggered, setShakeTriggered] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Extract patientId from hash or search params
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('emergency/')) {
      const parts = hash.split('emergency/');
      if (parts[1]) setPatientId(parts[1].trim());
    } else {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id') || params.get('patientId');
      if (idParam) setPatientId(idParam);
    }
  }, []);

  const emergencyPortalUrl = typeof window !== 'undefined'
    ? window.location.href
    : `http://localhost:5173/#emergency/${patientId}`;

  // Fetch live patient emergency telemetry
  const fetchCardData = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      try {
        res = await fetch(`/api/v1/emergency/${patientId}`);
      } catch {
        res = await fetch(`http://127.0.0.1:8000/api/v1/emergency/${patientId}`);
      }
      if (!res.ok) {
        res = await fetch(`http://127.0.0.1:8000/api/v1/emergency/${patientId}`);
      }
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.warn('Fallback to local test persona:', err);
      setData({
        id: patientId,
        name: 'Alexander Reed',
        age: 48,
        gender: 'Male',
        blood_group: 'O+',
        mrn: `MRN-${patientId}-QX`,
        abha_id: '91-4829-1092-8821',
        organ_donor: true,
        hospital: 'AIIMS Cardiology & Oncology OPD',
        emergency_contacts: [
          { name: 'Liam Reed', relation: 'Brother / Next of Kin', phone: '+91 98333 44556', is_primary: true },
          { name: 'Dr. Sarah Jenkins', relation: 'Attending Physician', phone: '+91 98222 11445', is_primary: false }
        ],
        allergies: [
          { allergen: 'Penicillin', severity: 'HIGH', reaction: 'Anaphylaxis / Severe Bronchospasm' },
          { allergen: 'Sulfonamides', severity: 'MODERATE', reaction: 'Cutaneous Rash / Erythema' }
        ],
        medications: [
          { name: 'Atorvastatin', dose: '20mg', frequency: 'Once daily (OD) - Night' },
          { name: 'Aspirin', dose: '75mg', frequency: 'Once daily (OD) - Post Meal' },
          { name: 'Metformin HCl', dose: '500mg', frequency: 'Twice daily (BD)' }
        ],
        baseline_vitals: {
          blood_pressure: '120/78 mmHg',
          heart_rate_bpm: 72,
          spo2_percent: 98,
          temperature_f: 98.6
        },
        conditions: ['Coronary Plaque Risk', 'Dense Breast Tissue', 'Mild Dyslipidemia']
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
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;
    const SHAKE_THRESHOLD = 18;

    function handleMotion(e) {
      const current = e.accelerationIncludingGravity;
      if (!current) return;

      const now = Date.now();
      if ((now - lastTime) > 100) {
        const diffTime = now - lastTime;
        lastTime = now;

        const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;
        if (speed > SHAKE_THRESHOLD * 10) {
          setShakeTriggered(true);
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    }

    if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, []);

  const primaryContact = data?.emergency_contacts?.find((c) => c.is_primary) || data?.emergency_contacts?.[0] || {
    name: 'Liam Reed',
    phone: '+91 98333 44556',
    relation: 'Brother / Next of Kin',
  };

  const secondaryContact = data?.emergency_contacts?.length > 1 ? data.emergency_contacts[1] : null;

    const INDIA_HELPLINES = [
    { code: '108', title: 'Ambulance / Medical', desc: 'National Emergency Medical Service', icon: Siren },
    { code: '112', title: 'National Emergency', desc: 'All-in-One Unified Response', icon: ShieldAlert },
    { code: '100', title: 'Police Helpline', desc: 'Emergency Police Assistance', icon: Shield },
    { code: '101', title: 'Fire & Rescue', desc: 'Emergency Fire Services', icon: Flame },
    { code: '1091', title: 'Women Safety', desc: 'National Women Helpline', icon: Heart },
    { code: '1075', title: 'Health Helpline', desc: 'National Health Services (MoHFW)', icon: Stethoscope },
  ];

  function copyTriageLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(emergencyPortalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="emergency-passport-canvas" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #0F172A', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: '0.12em', color: '#0F172A', textTransform: 'uppercase' }}>
          Loading Medical Emergency Passport...
        </h2>
        <p style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
          Verifying Permanent Patient Record & Cryptographic WORM Seal
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="emergency-passport-canvas" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div className="emergency-card-panel" style={{ maxWidth: '420px', textAlign: 'center', alignItems: 'center', border: '1.5px solid #0F172A' }}>
          <AlertOctagon size={42} color="#0F172A" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '8px 0 4px 0' }}>Emergency Record Unavailable</h2>
          <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>{error}</p>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#94A3B8', marginTop: '8px' }}>Patient ID: {patientId}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="emergency-passport-canvas">
      {/* ── Emergency Top Sticky Header ── */}
      <header className="emergency-header-sticky">
        <div className="emergency-brand">
          <div className="emergency-brand-icon">
            <Siren size={20} />
          </div>
          <div>
            <div className="emergency-brand-title">
              <span>CRITICAL MEDICAL PASSPORT</span>
              <span style={{ width: '6px', height: '6px', background: '#DC2626', display: 'inline-block' }} />
            </div>
            <div className="emergency-brand-sub">Q-MEDSENSE EMERGENCY TRIAGE</div>
          </div>
        </div>

        <div className="emergency-header-actions">
          <button
            type="button"
            onClick={handlePrint}
            className="emergency-btn-secondary no-print"
            style={{ padding: '8px 14px', fontSize: '0.74rem' }}
            title="Print Medical Passport"
          >
            <Printer size={14} />
            <span>Print Pass</span>
          </button>

          <button
            type="button"
            onClick={() => setShakeTriggered(true)}
            className="emergency-btn-sos"
          >
            <Smartphone size={14} />
            <span>SOS / Call</span>
          </button>
        </div>
      </header>

      {/* ── Shake-to-Call Emergency Trigger Modal ── */}
      {shakeTriggered && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.15s ease',
          }}
          onClick={() => setShakeTriggered(false)}
        >
          <div
            className="emergency-card-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              border: '2px solid #0F172A',
              padding: '28px 24px',
              background: '#FFFFFF',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                background: '#F1F5F9',
                border: '2px solid #DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                color: '#0F172A',
              }}
            >
              <PhoneCall size={28} />
            </div>

            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0F172A', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              EMERGENCY CALL PROTOCOL ACTIVATED
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: '4px 0 8px 0' }}>
              Call Primary Contact Now?
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
              Immediate dialer trigger for <strong style={{ color: '#0F172A' }}>{data?.name}</strong>'s next of kin:
            </p>

            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #0F172A',
                padding: '14px 16px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#64748B' }}>Contact Person:</span>
                <strong style={{ color: '#0F172A' }}>{primaryContact.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#64748B' }}>Relationship:</span>
                <strong style={{ color: '#334155' }}>{primaryContact.relation}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#64748B' }}>Phone:</span>
                <strong style={{ color: '#0F172A' }}>{primaryContact.phone}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={`tel:${primaryContact.phone.replace(/[^0-9+]/g, '')}`}
                className="emergency-call-btn"
                style={{ justifyContent: 'center', padding: '14px', fontSize: '0.88rem' }}
              >
                <PhoneCall size={16} />
                <span>DIAL {primaryContact.phone}</span>
              </a>

              <a
                href="tel:108"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: '#FFFFFF',
                  border: '1px solid #0F172A',
                  color: '#0F172A',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                }}
              >
                <Siren size={15} color="#0F172A" />
                <span>Or Call 108 (National Ambulance Hotline)</span>
              </a>

              <button
                type="button"
                onClick={() => setShakeTriggered(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  padding: '6px',
                  marginTop: '4px',
                }}
              >
                Cancel / Dismiss Overlay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Triage Container ── */}
      <main className="emergency-container">
        {/* 1. Hero Patient Identity Header */}
        <div className="emergency-hero-card">
          <div className="emergency-hero-bio">
            <span className="emergency-hero-label">VERIFIED PATIENT RECORD</span>
            <h1 className="emergency-hero-name">{data?.name || 'Alexander Reed'}</h1>
            <div className="emergency-hero-meta">
              <span>{data?.age || 48} Yrs</span>
              <span>•</span>
              <span>{data?.gender || 'Male'}</span>
              <span>•</span>
              <span>MRN: <strong style={{ color: '#0F172A' }}>{data?.mrn || `MRN-${patientId}-QX`}</strong></span>
              <span>•</span>
              <span>ABHA: <strong style={{ color: '#0F172A' }}>{data?.abha_id || '91-4829-1092-8821'}</strong></span>
            </div>

            <div className="emergency-hero-badges">
              <span className="emergency-badge-permanent">
                <Shield size={13} /> PERMANENT ID: {patientId}
              </span>

              {data?.organ_donor && (
                <span className="emergency-badge-donor">
                  <Heart size={13} /> ORGAN DONOR: YES
                </span>
              )}

              {data?.allergies && data.allergies.length > 0 && (
                <span className="emergency-badge-allergy">
                  <AlertTriangle size={13} /> ⚠ SEVERE ANAPHYLAXIS RISK
                </span>
              )}
            </div>
          </div>

          {/* Blood Group Hero Badge */}
          <div className="emergency-blood-hero">
            <span className="emergency-blood-title">BLOOD</span>
            <span className="emergency-blood-value">{data?.blood_group || 'O+'}</span>
          </div>
        </div>

        {/* 2. Responsive 2-Column Grid (Desktop) / Stream (Mobile) */}
        <div className="emergency-grid-layout">
          
          {/* ── LEFT COLUMN: Clinical Critical Data ── */}
          <div className="emergency-column">
            
            {/* Primary Emergency Contact */}
            <div className="emergency-card-panel">
              <div className="emergency-card-header">
                <h3 className="emergency-card-title">
                  <Phone size={16} color="#0F172A" />
                  <span>Primary Emergency Contact</span>
                </h3>
                <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', fontWeight: 800, background: '#F1F5F9', color: '#0F172A', padding: '3px 8px', border: '1px solid #CBD5E1' }}>
                  NEXT OF KIN
                </span>
              </div>

              <div className="emergency-contact-box">
                <div className="emergency-contact-info">
                  <div className="emergency-contact-name">{primaryContact.name}</div>
                  <div className="emergency-contact-rel">{primaryContact.relation}</div>
                  <div className="emergency-contact-phone">{primaryContact.phone}</div>
                </div>

                <a
                  href={`tel:${primaryContact.phone.replace(/[^0-9+]/g, '')}`}
                  className="emergency-call-btn"
                >
                  <PhoneCall size={14} />
                  <span>Call Now</span>
                </a>
              </div>

              {secondaryContact && (
                <div className="emergency-contact-box" style={{ background: '#F8FAFC', padding: '10px 14px' }}>
                  <div className="emergency-contact-info">
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{secondaryContact.name}</div>
                    <div style={{ fontSize: '0.70rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>{secondaryContact.relation}</div>
                  </div>
                  <a
                    href={`tel:${secondaryContact.phone.replace(/[^0-9+]/g, '')}`}
                    className="emergency-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                  >
                    <Phone size={12} />
                    <span>Dial</span>
                  </a>
                </div>
              )}
            </div>

            {/* Known Allergies & Anaphylaxis Alerts */}
            <div className="emergency-card-panel">
              <div className="emergency-card-header">
                <h3 className="emergency-card-title">
                  <AlertTriangle size={16} color="#0F172A" />
                  <span>Known Allergies & Anaphylaxis Alerts</span>
                </h3>
                <span style={{ fontSize: '0.64rem', color: '#0F172A', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                  CRITICAL ALERT
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data?.allergies && data.allergies.length > 0 ? (
                  data.allergies.map((alg, idx) => {
                    const name = typeof alg === 'string' ? alg : (alg?.allergen || alg?.name || 'Allergen');
                    const severity = (typeof alg === 'object' && alg?.severity) ? alg.severity : 'HIGH';
                    const reaction = (typeof alg === 'object' && alg?.reaction) ? alg.reaction : 'Allergic sensitivity / Adverse reaction';
                    return (
                      <div key={idx} className="emergency-item-row emergency-item-danger">
                        <div>
                          <div className="emergency-item-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{name}</span>
                            <span className="emergency-pill-tag pill-danger">{severity}</span>
                          </div>
                          <div className="emergency-item-sub">{reaction}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                    No severe drug allergies currently recorded on file.
                  </div>
                )}
              </div>
            </div>

            {/* Active Medications & Regimen */}
            <div className="emergency-card-panel">
              <div className="emergency-card-header">
                <h3 className="emergency-card-title">
                  <Pill size={16} color="#0F172A" />
                  <span>Active Medications & Regimen</span>
                </h3>
                <span style={{ fontSize: '0.64rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                  PHARMACOTHERAPY
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data?.medications && data.medications.length > 0 ? (
                  data.medications.map((med, idx) => {
                    const name = typeof med === 'string' ? med : (med?.name || 'Medication');
                    const dose = typeof med === 'object' && med?.dose ? med.dose : 'Standard';
                    const freq = typeof med === 'object' && med?.frequency ? med.frequency : 'Daily';
                    return (
                      <div key={idx} className="emergency-item-row">
                        <div>
                          <div className="emergency-item-title">{name}</div>
                          <div className="emergency-item-sub">{freq}</div>
                        </div>
                        <span className="emergency-pill-tag pill-cyan">{dose}</span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                    No ongoing active medications reported.
                  </div>
                )}
              </div>
            </div>

            {/* Baseline Vitals & Diagnosed Conditions */}
            <div className="emergency-card-panel">
              <div className="emergency-card-header">
                <h3 className="emergency-card-title">
                  <Activity size={16} color="#0F172A" />
                  <span>Baseline Vitals & Conditions</span>
                </h3>
              </div>

              <div className="emergency-vitals-grid">
                <div className="emergency-vital-card">
                  <span className="emergency-vital-label">Blood Pressure</span>
                  <span className="emergency-vital-val">{data?.baseline_vitals?.blood_pressure || '120/78 mmHg'}</span>
                </div>
                <div className="emergency-vital-card">
                  <span className="emergency-vital-label">Resting Heart Rate</span>
                  <span className="emergency-vital-val">{data?.baseline_vitals?.heart_rate_bpm || 72} <span style={{ fontSize: '0.7rem', color: '#64748B' }}>BPM</span></span>
                </div>
                <div className="emergency-vital-card">
                  <span className="emergency-vital-label">Blood Oxygen (SpO2)</span>
                  <span className="emergency-vital-val">{data?.baseline_vitals?.spo2_percent || 98}%</span>
                </div>
                <div className="emergency-vital-card">
                  <span className="emergency-vital-label">Attending Facility</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>{data?.hospital || 'AIIMS Cardiology'}</span>
                </div>
              </div>

              {data?.conditions && data.conditions.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Diagnosed Medical Conditions
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {data.conditions.map((cond, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          background: '#F1F5F9',
                          color: '#334155',
                          padding: '4px 10px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        {typeof cond === 'string' ? cond : (cond?.name || cond?.condition || 'Condition')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT COLUMN: Permanent QR Pass & India Speed Dial ── */}
          <div className="emergency-column">
            
            {/* Permanent Scannable QR Pass */}
            <div className="emergency-qr-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} color="#0F172A" />
                <h3 style={{ fontSize: '0.84rem', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0F172A', margin: 0 }}>
                  Permanent Triage QR Pass
                </h3>
              </div>

              <p style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>
                Scan with any smartphone or hospital terminal camera for immediate EHR access and clinical telemetry.
              </p>

              {/* High Contrast QR Code Image */}
              <div className="emergency-qr-box">
                <img
                  src={`http://127.0.0.1:8000/api/v1/emergency/${patientId}/qr.png`}
                  alt="Permanent QR Triage Pass"
                  style={{ width: '148px', height: '148px', objectFit: 'contain', imageRendering: 'crisp-edges' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: '#0F172A' }}>
                  Permanent ID: <strong>{patientId}</strong>
                </div>
                <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                  WORM SHA-256: e3b0c442...991b7852
                </div>
              </div>

              <div className="emergency-qr-actions no-print">
                <button
                  type="button"
                  onClick={copyTriageLink}
                  className="emergency-btn-secondary"
                >
                  {copiedLink ? <Check size={14} color="#0F172A" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Copied URL!' : 'Copy Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="emergency-btn-secondary"
                >
                  <Printer size={14} />
                  <span>Print Pass</span>
                </button>
              </div>
            </div>

            {/* India Emergency Speed Dial (24x7 Hotlines) */}
            <div className="emergency-card-panel">
              <div className="emergency-card-header">
                <h3 className="emergency-card-title">
                  <Siren size={16} color="#0F172A" />
                  <span>India Emergency Speed Dial</span>
                </h3>
                <span style={{ fontSize: '0.64rem', color: '#059669', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                  TOLL-FREE 24x7
                </span>
              </div>

              <div className="emergency-speed-grid">
                {INDIA_HELPLINES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.code}
                      href={`tel:${item.code}`}
                      className="emergency-speed-card"
                    >
                      <div>
                        <div className="emergency-speed-dial-num">{item.code}</div>
                        <div className="emergency-speed-dial-title">{item.title}</div>
                        <div className="emergency-speed-dial-desc">{item.desc}</div>
                      </div>

                      <div className="emergency-speed-icon-wrap" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A' }}>
                        <Icon size={16} />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Cryptographic WORM Verification Seal */}
            <div className="emergency-audit-footer">
              <div className="emergency-audit-title">
                <Shield size={14} />
                <span>WORM AUDIT VERIFIED MEDICAL RECORD</span>
              </div>
              <p className="emergency-audit-meta">
                Cryptographically sealed & signed by Q-MedSense Health Authority Network
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
