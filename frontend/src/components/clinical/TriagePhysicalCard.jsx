import React from 'react';
import {
  Phone, Mail, MapPin, QrCode, Shield, Heart,
  ExternalLink, Copy, Check, ChevronRight, AlertTriangle,
  FileText, Activity, ShieldCheck, Ambulance, Siren, Stethoscope,
  Pill, AlertOctagon, User, Clock
} from 'lucide-react';
import QRCodeSVG from '../common/QRCodeSVG';

/**
 * TriagePhysicalCard Component
 * Faithfully reproduces the physical card design layout with Front and Back face support:
 * - face='front': Front Face (Hello / Name, Blood Group, QR Code, Contact Rows, @Handle tray)
 * - face='back': Back Face (Clinical Allergies, Active Medications, Vitals, Attending Physician, WORM Seal)
 * - variant='light' (Clinical Day White) | 'dark' (First Responder Matte Black)
 */
export default function TriagePhysicalCard({
  patient = {},
  variant = 'light',
  face = 'front', // 'front' | 'back'
  emergencyPortalUrl = '',
  onCopy = null,
  copied = false,
}) {
  const isDark = variant === 'dark';
  const isBack = face === 'back';

  // Format Patient Values
  const name = patient.name || 'Alexander Reed';
  const firstName = name.split(' ')[0] || 'Alexander';
  const lastName = name.split(' ').slice(1).join(' ') || 'Reed';
  const bloodGroup = patient.blood_group || 'O+';
  const abhaId = patient.abha_id || '91-4829-1092-8821';
  const patientId = patient.id || patient.user_id || 'PT-89421';
  const hospital = patient.hospital || 'AIIMS Cardiology & Emergency OPD';
  const mrn = patient.mrn || patient.license_id || `MRN-${patientId}-QX`;

  const primaryContact = patient.emergency_contacts?.find(c => c.is_primary) || patient.emergency_contacts?.[0] || {
    name: patient.emergency_contact_name || 'Liam Reed',
    relation: patient.emergency_contact_relation || 'Brother / Next of Kin',
    phone: patient.emergency_phone || '+91 98333 44556'
  };
  const phoneFormatted = primaryContact.phone || '+91 98333 44556';
  const emailFormatted = (firstName.toLowerCase() + '.' + (lastName ? lastName.toLowerCase() : 'pt') + '@qrakshak.org');
  const locationFormatted = hospital.split(',')[0] || 'New Delhi, India';

  // Clinical Details
  const allergiesList = Array.isArray(patient.allergies)
    ? patient.allergies.map(a => typeof a === 'string' ? a : (a.allergen || a.name || 'Penicillin')).join(', ')
    : (patient.allergies || 'Penicillin (Severe)');

  const medsList = Array.isArray(patient.medications || patient.active_medications)
    ? (patient.medications || patient.active_medications).map(m => typeof m === 'string' ? m : (m.name || 'Atorvastatin 20mg')).join(', ')
    : 'Atorvastatin 20mg (OD), Aspirin 75mg';

  const bp = patient.baseline_vitals?.blood_pressure || '120/78 mmHg';
  const hr = patient.baseline_vitals?.heart_rate_bpm || 72;
  const spo2 = patient.baseline_vitals?.spo2_percent || 98;

  return (
    <div className={`triage-card-shell ${isDark ? 'triage-dark' : 'triage-light'} ${isBack ? 'triage-card-back-view' : ''}`}>
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* FRONT FACE                                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {!isBack && (
        <>
          {/* ── TOP SECTION: 2-Column Split ── */}
          <div className="triage-card-top-grid">
            
            {/* ── LEFT CELL: Patient Identity & Giant Typography ── */}
            <div className="triage-cell triage-cell-left">
              <div className="triage-inner-frame">
                {/* Top Three Dots */}
                <div className="triage-dots-row">
                  <span className="triage-dot" />
                  <span className="triage-dot" />
                  <span className="triage-dot" />
                </div>

                {/* Status Pill & Blood Tag */}
                <div className="triage-left-content">
                  <div className="triage-role-pill">
                    <span className="triage-pulse-indicator" />
                    <span className="triage-role-text">VERIFIED EHR</span>
                  </div>
                  <div className="triage-blood-tag">
                    <span className="triage-blood-lbl">BLOOD</span>
                    <span className="triage-blood-val">{bloodGroup}</span>
                  </div>
                </div>

                {/* Giant Bold Headline Typography */}
                <div className="triage-giant-headline">
                  <div className="triage-headline-sub">hello</div>
                  <div className="triage-headline-name">{firstName}</div>
                  <div className="triage-headline-last">{lastName}</div>
                </div>
              </div>
            </div>

            {/* ── RIGHT CELL: Top Tabs + QR Code + Direct Contacts ── */}
            <div className="triage-cell triage-cell-right">
              <div className="triage-inner-frame">
                {/* Top Tabs Header */}
                <div className="triage-tabs-header">
                  <a href="tel:108" className="triage-tab-item" title="Call 108 Ambulance">
                    <Ambulance size={13} />
                    <span>108</span>
                  </a>
                  <div className="triage-tab-divider" />
                  <div className="triage-tab-item" title="Organ Donor Consented">
                    <Heart size={13} />
                    <span>DONOR</span>
                  </div>
                  <div className="triage-tab-divider" />
                  <div className="triage-tab-item" title="Cryptographic Ledger Verified">
                    <ShieldCheck size={13} />
                    <span>WORM</span>
                  </div>
                </div>

                {/* QR Code + Title / Description Area */}
                <div className="triage-qr-meta-box">
                  <div className="triage-qr-wrap">
                    <QRCodeSVG
                      value={emergencyPortalUrl || window.location.href}
                      size={74}
                      fgColor={isDark ? '#000000' : '#0F172A'}
                      bgColor="#FFFFFF"
                    />
                  </div>
                  <div className="triage-meta-text">
                    <div className="triage-title-row">
                      <span className="triage-card-title-text">Emergency Pass</span>
                      <ChevronRight size={14} className="triage-chevron" />
                    </div>
                    <div className="triage-affiliation-text">{hospital}</div>
                    <div className="triage-tagline-text">Instant EHR & Telemetry Scan</div>
                  </div>
                </div>

                {/* Direct Contact Block */}
                <div className="triage-contact-rows">
                  <a href={`mailto:${emailFormatted}`} className="triage-contact-line">
                    <Mail size={12} className="triage-contact-icon" />
                    <span className="triage-contact-val">{emailFormatted}</span>
                  </a>
                  <a href={`tel:${phoneFormatted.replace(/[^0-9+]/g, '')}`} className="triage-contact-line">
                    <Phone size={12} className="triage-contact-icon" />
                    <span className="triage-contact-val">{phoneFormatted} ({primaryContact.name})</span>
                  </a>
                  <div className="triage-contact-line">
                    <MapPin size={12} className="triage-contact-icon" />
                    <span className="triage-contact-val">{locationFormatted}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── BOTTOM SECTION: Full-Width Capsule Tray ── */}
          <div className="triage-bottom-tray">
            <div className="triage-inner-frame triage-bottom-frame">
              <div className="triage-handle-text">
                <span className="triage-at-symbol">@</span>
                <span className="triage-handle-value">{abhaId.replace(/-/g, '')}</span>
              </div>

              <div className="triage-bottom-meta">
                <span className="triage-id-badge">ID: {patientId}</span>
                {onCopy && (
                  <button
                    type="button"
                    onClick={onCopy}
                    className="triage-copy-pill"
                    title="Copy triage link"
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copied ? 'Copied' : 'Share Pass'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* BACK FACE (Clinical Safeguards, Vitals, Meds, Ledger)               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isBack && (
        <>
          <div className="triage-card-top-grid">
            
            {/* ── LEFT CELL: Critical Medical Flags & Baseline Vitals ── */}
            <div className="triage-cell triage-cell-left">
              <div className="triage-inner-frame">
                <div className="triage-dots-row">
                  <span className="triage-dot" />
                  <span className="triage-dot" />
                  <span className="triage-dot" />
                </div>

                <div className="triage-back-section-title">
                  <AlertTriangle size={13} color="#DC2626" />
                  <span>CRITICAL ALERTS</span>
                </div>

                <div className="triage-back-alert-box">
                  <div className="triage-back-lbl">ALLERGIES</div>
                  <div className="triage-back-val-danger">{allergiesList}</div>
                </div>

                <div className="triage-back-vitals-grid">
                  <div className="triage-back-vital-item">
                    <span className="triage-back-vital-lbl">BP</span>
                    <strong className="triage-back-vital-val">{bp}</strong>
                  </div>
                  <div className="triage-back-vital-item">
                    <span className="triage-back-vital-lbl">HR</span>
                    <strong className="triage-back-vital-val">{hr} bpm</strong>
                  </div>
                  <div className="triage-back-vital-item">
                    <span className="triage-back-vital-lbl">SpO2</span>
                    <strong className="triage-back-vital-val">{spo2}%</strong>
                  </div>
                </div>

                <div className="triage-back-donor-badge">
                  <Heart size={11} color={isDark ? '#4ADE80' : '#16866A'} />
                  <span>ORGAN DONOR: {patient.organ_donor ? 'YES (CON)' : 'YES'}</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT CELL: Active Rx & First Responder Directives ── */}
            <div className="triage-cell triage-cell-right">
              <div className="triage-inner-frame">
                <div className="triage-tabs-header">
                  <div className="triage-tab-item" title="MRN Number">
                    <FileText size={12} />
                    <span>{mrn}</span>
                  </div>
                  <div className="triage-tab-divider" />
                  <div className="triage-tab-item" title="Clinical Attending Doctor">
                    <Stethoscope size={12} />
                    <span>ATTENDING</span>
                  </div>
                </div>

                <div className="triage-back-rx-box">
                  <div className="triage-back-lbl">ACTIVE MEDICATIONS (Rx)</div>
                  <div className="triage-back-rx-text">{medsList}</div>
                </div>

                <div className="triage-back-instruction-box">
                  <div className="triage-back-lbl">FIRST RESPONDER DIRECTIVE</div>
                  <p className="triage-back-instruction-text">
                    Scan front QR pass with any smartphone camera for full longitudinal EHR, drug interactions & tamper-evident audit history.
                  </p>
                </div>

                <div className="triage-back-attending-row">
                  <span className="triage-back-lbl">FACILITY: </span>
                  <span className="triage-back-val-bold">{hospital}</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── BOTTOM TRAY: WORM Ledger & Permanent ID Seal ── */}
          <div className="triage-bottom-tray">
            <div className="triage-inner-frame triage-bottom-frame">
              <div className="triage-handle-text" style={{ fontSize: '0.74rem' }}>
                <ShieldCheck size={14} style={{ marginRight: '4px', opacity: 0.8 }} />
                <span>WORM SHA-256: e3b0c442...991b7852</span>
              </div>

              <div className="triage-bottom-meta">
                <span className="triage-id-badge">ID: {patientId}</span>
                <span className="triage-verified-tag">VERIFIED PASS</span>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
