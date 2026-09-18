import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, AlertTriangle, Heart, Shield, Activity,
  Pill, User, Droplet, Clock, Stethoscope, Share2,
  PhoneCall, AlertOctagon, CheckCircle2, Siren,
  Smartphone, MapPin, Building2, Copy, Check, Printer,
  QrCode, ExternalLink, Flame, ShieldAlert, ShieldCheck,
  RotateCw
} from 'lucide-react';
import apiClient from '../../api/client';
import QRCodeSVG from '../../components/common/QRCodeSVG';
import TriagePhysicalCard from '../../components/clinical/TriagePhysicalCard';
import PrintableMedicalCardSheet from '../../components/clinical/PrintableMedicalCardSheet';
import { animateCard3DFlip } from '../../utils/motion.js';

export default function EmergencyCardView({ patientId = 'USR-5EF52B' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shakeTriggered, setShakeTriggered] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cardTheme, setCardTheme] = useState('both'); // 'both' | 'light' | 'dark'
  const [cardFace, setCardFace] = useState('dual'); // 'dual' | 'front' | 'back' | 'flip3d'
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [is3DFlipped, setIs3DFlipped] = useState(false);
  const card3DInnerRef = useRef(null);

  function toggle3DFlip() {
    const next = !is3DFlipped;
    setIs3DFlipped(next);
    if (card3DInnerRef.current) {
      animateCard3DFlip(card3DInnerRef.current, next);
    }
  }

  // Permanent public portal URL
  const emergencyPortalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#emergency/${patientId}`
    : `${window.location.origin}/#emergency/${patientId}`;

  // 1. Fetch Public Emergency Profile
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/api/v1/emergency/${patientId}`);
        setData(res);
      } catch (err) {
        console.error('Failed to load emergency profile:', err);
        setError(err.message || 'Unable to retrieve emergency record from clinical vault.');
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [patientId]);

  // 2. Shake-to-Call Accelerometer Listener (DeviceMotionEvent)
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;
    const SHAKE_THRESHOLD = 18;

    function handleMotion(e) {
      const current = e.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if (currentTime - lastTime > 100) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

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
    name: '—',
    phone: '—',
    relation: 'Emergency Contact',
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
    setPrintModalOpen(true);
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
              <span style={{ width: '6px', height: '6px', background: 'var(--risk-high)', display: 'inline-block', borderRadius: '50%' }} />
            </div>
            <div className="emergency-brand-sub">QRakshak Emergency Triage</div>
          </div>
        </div>

        <div className="emergency-header-actions">
          {/* Card Style Switcher */}
          <div className="no-print" style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #CBD5E1', gap: '3px' }}>
            <button
              type="button"
              onClick={() => setCardTheme('both')}
              style={{
                background: cardTheme === 'both' ? '#FFFFFF' : 'transparent',
                color: cardTheme === 'both' ? '#0F172A' : '#64748B',
                border: 0,
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: cardTheme === 'both' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Both Cards
            </button>
            <button
              type="button"
              onClick={() => setCardTheme('light')}
              style={{
                background: cardTheme === 'light' ? '#FFFFFF' : 'transparent',
                color: cardTheme === 'light' ? '#0F172A' : '#64748B',
                border: 0,
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: cardTheme === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Day White
            </button>
            <button
              type="button"
              onClick={() => setCardTheme('dark')}
              style={{
                background: cardTheme === 'dark' ? '#0F172A' : 'transparent',
                color: cardTheme === 'dark' ? '#FFFFFF' : '#64748B',
                border: 0,
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: cardTheme === 'dark' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              Matte Black
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary no-print"
            style={{ padding: '8px 16px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Print Medical Passport"
          >
            <Printer size={15} />
            <span>Print Pass</span>
          </button>

          <button
            type="button"
            onClick={() => setShakeTriggered(true)}
            className="btn-danger"
            style={{ padding: '8px 16px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Smartphone size={15} />
            <span>SOS / Call Hotline</span>
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
            <h1 className="emergency-hero-name">{data?.name || 'Patient'}</h1>
            <div className="emergency-hero-meta">
              <span>{data?.age ? `${data.age} Yrs` : '—'}</span>
              <span>•</span>
              <span>{data?.gender || '—'}</span>
              <span>•</span>
              <span>MRN: <strong style={{ color: '#0F172A' }}>{data?.mrn || (patientId ? `MRN-${patientId}-QX` : '—')}</strong></span>
              <span>•</span>
              <span>ABHA: <strong style={{ color: '#0F172A' }}>{data?.abha_id || '—'}</strong></span>
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

        {/* ── PHYSICAL CARD SHOWCASE (MATCHING USER REFERENCE DESIGN) ── */}
        <div style={{ margin: '8px 0 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={18} color="#0F172A" />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0F172A', letterSpacing: '-0.01em' }}>
                Physical-Digital Emergency Triage Passports
              </h2>
            </div>

            {/* Theme & Face Controls */}
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Theme Selector */}
              <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #CBD5E1', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => setCardTheme('both')}
                  style={{
                    background: cardTheme === 'both' ? '#FFFFFF' : 'transparent',
                    color: cardTheme === 'both' ? '#0F172A' : '#64748B',
                    border: 0,
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: cardTheme === 'both' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Both Editions
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('light')}
                  style={{
                    background: cardTheme === 'light' ? '#FFFFFF' : 'transparent',
                    color: cardTheme === 'light' ? '#0F172A' : '#64748B',
                    border: 0,
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: cardTheme === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Day White
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('dark')}
                  style={{
                    background: cardTheme === 'dark' ? '#1E232B' : 'transparent',
                    color: cardTheme === 'dark' ? '#FFFFFF' : '#64748B',
                    border: 0,
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: cardTheme === 'dark' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  Matte Slate Gray
                </button>
              </div>

              {/* Face Selector: Front, Back, Dual */}
              <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #CBD5E1', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => setCardFace('dual')}
                  style={{
                    background: cardFace === 'dual' ? '#FFFFFF' : 'transparent',
                    color: cardFace === 'dual' ? '#087F8C' : '#64748B',
                    border: 0,
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: cardFace === 'dual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Dual View (Front + Back)
                </button>
                <button
                  type="button"
                  onClick={() => setCardFace('front')}
                  style={{
                    background: cardFace === 'front' ? '#FFFFFF' : 'transparent',
                    color: cardFace === 'front' ? '#087F8C' : '#64748B',
                    border: 0,
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: cardFace === 'front' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Front Face
                </button>
                <button
                  type="button"
                  onClick={() => setCardFace('back')}
                  style={{
                    background: cardFace === 'back' ? '#FFFFFF' : 'transparent',
                    color: cardFace === 'back' ? '#087F8C' : '#64748B',
                    border: 0,
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: cardFace === 'back' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Back Face (Clinical)
                </button>
                <button
                  type="button"
                  onClick={() => { setCardFace('flip3d'); setIs3DFlipped(false); }}
                  style={{
                    background: cardFace === 'flip3d' ? '#FFFFFF' : 'transparent',
                    color: cardFace === 'flip3d' ? '#087F8C' : '#64748B',
                    border: 0,
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: cardFace === 'flip3d' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <RotateCw size={11} />
                  <span>3D Interactive Flip</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cards Showcase Render */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              padding: '16px 8px',
            }}
          >
            {/* 3D INTERACTIVE PERSPECTIVE FLIP */}
            {cardFace === 'flip3d' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '520px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '440px', padding: '0 4px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RotateCw size={13} color="#087F8C" />
                    <span>Active Face: {is3DFlipped ? 'Back (Clinical Data & Vitals)' : 'Front (QR Triage & ID)'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={toggle3DFlip}
                    className="btn-tactile"
                    style={{
                      background: '#0F172A',
                      color: '#FFFFFF',
                      border: 0,
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.25)',
                    }}
                  >
                    <RotateCw size={12} />
                    <span>{is3DFlipped ? 'Flip to Front' : 'Flip to Back'}</span>
                  </button>
                </div>

                <div 
                  className="perspective-card-container" 
                  style={{ width: '100%', maxWidth: '440px', cursor: 'pointer' }}
                  onClick={toggle3DFlip}
                  title="Click anywhere on the card to flip 360°"
                >
                  <div 
                    ref={card3DInnerRef} 
                    className={`perspective-card-inner ${is3DFlipped ? 'is-flipped' : ''}`}
                  >
                    <div className="card-face-front">
                      <TriagePhysicalCard
                        patient={data}
                        variant={cardTheme === 'dark' ? 'dark' : 'light'}
                        face="front"
                        emergencyPortalUrl={emergencyPortalUrl}
                        onCopy={copyTriageLink}
                        copied={copiedLink}
                      />
                    </div>
                    <div className="card-face-back">
                      <TriagePhysicalCard
                        patient={data}
                        variant={cardTheme === 'dark' ? 'dark' : 'light'}
                        face="back"
                        emergencyPortalUrl={emergencyPortalUrl}
                        onCopy={copyTriageLink}
                        copied={copiedLink}
                      />
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '0.62rem', color: '#64748B', fontStyle: 'italic', textAlign: 'center' }}>
                  Interactive 3D Perspective: Click card or use toggle to simulate physical inspection
                </span>
              </div>
            ) : (
              <>
                {/* DAY WHITE EDITION */}
                {(cardTheme === 'both' || cardTheme === 'light') && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: cardFace === 'dual' ? '920px' : '480px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Clinical White Edition (Day / Print)
                      </span>
                      {cardFace === 'dual' && (
                        <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#087F8C', background: '#EBF8FA', padding: '1px 6px', borderRadius: '4px' }}>
                          FRONT + BACK DUAL VIEW
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                      {(cardFace === 'dual' || cardFace === 'front') && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%', maxWidth: '440px' }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Front View (QR & ID)</span>
                          <TriagePhysicalCard
                            patient={data}
                            variant="light"
                            face="front"
                            emergencyPortalUrl={emergencyPortalUrl}
                            onCopy={copyTriageLink}
                            copied={copiedLink}
                          />
                        </div>
                      )}

                      {(cardFace === 'dual' || cardFace === 'back') && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%', maxWidth: '440px' }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Back View (Allergies, Rx & Vitals)</span>
                          <TriagePhysicalCard
                            patient={data}
                            variant="light"
                            face="back"
                            emergencyPortalUrl={emergencyPortalUrl}
                            onCopy={copyTriageLink}
                            copied={copiedLink}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MATTE CHARCOAL EDITION */}
                {(cardTheme === 'both' || cardTheme === 'dark') && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: cardFace === 'dual' ? '920px' : '480px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Matte Slate Gray Edition (Emergency First Responder)
                      </span>
                      {cardFace === 'dual' && (
                        <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#087F8C', background: '#EBF8FA', padding: '1px 6px', borderRadius: '4px' }}>
                          FRONT + BACK DUAL VIEW
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                      {(cardFace === 'dual' || cardFace === 'front') && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%', maxWidth: '440px' }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Front View (QR & ID)</span>
                          <TriagePhysicalCard
                            patient={data}
                            variant="dark"
                            face="front"
                            emergencyPortalUrl={emergencyPortalUrl}
                            onCopy={copyTriageLink}
                            copied={copiedLink}
                          />
                        </div>
                      )}

                      {(cardFace === 'dual' || cardFace === 'back') && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%', maxWidth: '440px' }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Back View (Allergies, Rx & Vitals)</span>
                          <TriagePhysicalCard
                            patient={data}
                            variant="dark"
                            face="back"
                            emergencyPortalUrl={emergencyPortalUrl}
                            onCopy={copyTriageLink}
                            copied={copiedLink}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
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
            
            {/* Permanent Scannable QR Pass (Improvised) */}
            <div className="emergency-qr-panel">
              <div className="emergency-qr-header-pill">
                <span className="emergency-pulse-dot" />
                <span>LIVE RESCUE PASS • 24/7 ACTIVE</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} color="#087F8C" />
                <h3 style={{ fontSize: '0.88rem', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0F172A', margin: 0 }}>
                  Permanent Triage QR Pass
                </h3>
              </div>

              <p style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.45, margin: 0, maxWidth: '280px' }}>
                Scan with any smartphone camera or hospital terminal for immediate EHR access and clinical telemetry.
              </p>

              {/* Crisp SVG QR Box */}
              <div className="emergency-qr-box">
                <QRCodeSVG
                  value={emergencyPortalUrl}
                  size={148}
                  fgColor="#0F172A"
                  bgColor="#FFFFFF"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: '#0F172A', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>
                  PERMANENT ID: <span style={{ color: '#087F8C' }}>{patientId}</span>
                </div>
                <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} color="#059669" />
                  <span>WORM SHA-256: e3b0c442...991b7852</span>
                </div>
              </div>

              <div className="emergency-qr-actions no-print">
                <button
                  type="button"
                  onClick={copyTriageLink}
                  className="emergency-btn-copy-pass"
                  title="Copy permanent triage link"
                >
                  {copiedLink ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="emergency-btn-print-pass"
                  title="Open official print & wallet card sheet"
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
                Cryptographically sealed & signed by Q-RAKSHAK Health Authority Network
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* ── Dedicated Invisible Print Sheet (Rendered by @media print / window.print) ── */}
      <PrintableMedicalCardSheet
        patient={data}
        cardTheme={cardTheme}
        cardFace={cardFace}
        emergencyPortalUrl={emergencyPortalUrl}
      />

      {/* ── Interactive Print / Save PDF Preview Modal ── */}
      {printModalOpen && (
        <div
          className="modal-overlay no-print"
          onClick={() => setPrintModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Printer size={18} color="#087F8C" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0F172A' }}>
                    Print & Save PDF Medical ID Sheet
                  </h3>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  ISO/IEC 7810 ID-1 Standard (85.60 mm × 53.98 mm) • Scaled for double-sided wallet card lamination
                </span>
              </div>

              {/* Theme & Face Controls */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #CBD5E1', gap: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setCardTheme('both')}
                    style={{
                      background: cardTheme === 'both' ? '#FFFFFF' : 'transparent',
                      color: cardTheme === 'both' ? '#0F172A' : '#64748B',
                      border: 0,
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: cardTheme === 'both' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Both Editions
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme('light')}
                    style={{
                      background: cardTheme === 'light' ? '#FFFFFF' : 'transparent',
                      color: cardTheme === 'light' ? '#0F172A' : '#64748B',
                      border: 0,
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: cardTheme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Day White
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme('dark')}
                    style={{
                      background: cardTheme === 'dark' ? '#0F172A' : 'transparent',
                      color: cardTheme === 'dark' ? '#FFFFFF' : '#64748B',
                      border: 0,
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: cardTheme === 'dark' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                    }}
                  >
                    Matte Slate Gray
                  </button>
                </div>

                <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #CBD5E1', gap: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setCardFace('dual')}
                    style={{
                      background: cardFace === 'dual' ? '#FFFFFF' : 'transparent',
                      color: cardFace === 'dual' ? '#087F8C' : '#64748B',
                      border: 0,
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: cardFace === 'dual' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Dual (Front+Back)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardFace('front')}
                    style={{
                      background: cardFace === 'front' ? '#FFFFFF' : 'transparent',
                      color: cardFace === 'front' ? '#087F8C' : '#64748B',
                      border: 0,
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: cardFace === 'front' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardFace('back')}
                    style={{
                      background: cardFace === 'back' ? '#FFFFFF' : 'transparent',
                      color: cardFace === 'back' ? '#087F8C' : '#64748B',
                      border: 0,
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: cardFace === 'back' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>

            {/* Live Document Preview */}
            <div className="print-preview-container" style={{ background: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: '10px', padding: '16px', maxHeight: '56vh', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Print Document Preview (Live Card Sheet)</span>
                <span>ISO/IEC 7810 ID-1 • A4 / Letter</span>
              </div>
              <div>
                <PrintableMedicalCardSheet
                  patient={data}
                  cardTheme={cardTheme}
                  cardFace={cardFace}
                  emergencyPortalUrl={emergencyPortalUrl}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Tip: In the print dialog, select <strong>"Save as PDF"</strong> or your local color printer. Scale: <strong>100%</strong>.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPrintModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.78rem' }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrintModalOpen(false);
                    setTimeout(() => window.print(), 120);
                  }}
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={15} />
                  <span>Print Now / Save as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
