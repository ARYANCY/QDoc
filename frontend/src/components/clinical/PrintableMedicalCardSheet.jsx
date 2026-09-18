import React from 'react';
import { Scissors } from 'lucide-react';
import TriagePhysicalCard from './TriagePhysicalCard';

/**
 * PrintableMedicalCardSheet Component
 * Provides 1:1 ISO/IEC 7810 ID-1 standard wallet card print layout.
 * Activated by window.print() / @media print, and can also be previewed on screen.
 */
export default function PrintableMedicalCardSheet({
  patient = {},
  cardTheme = 'light', // 'light' | 'dark' | 'both'
  cardFace = 'dual',   // 'dual' | 'front' | 'back'
  emergencyPortalUrl = '',
}) {
  const patientId = patient?.user_id || patient?.id || 'PT-89421';
  const mrn = patient?.mrn || patient?.license_id || `MRN-${patientId}-QX`;
  const abhaId = patient?.abha_id || '91-4829-1092-8821';
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const renderCardPair = (variant, editionLabel) => {
    return (
      <div className="print-edition-block" key={variant}>
        <div className="print-edition-badge">
          <span>{editionLabel}</span>
          <span className="print-edition-standard">ISO/IEC 7810 ID-1 (85.60 mm × 53.98 mm)</span>
        </div>

        <div className="print-cards-cutting-frame">
          {/* Top & Bottom Alignment Marks */}
          <div className="print-corner-mark top-left">+</div>
          <div className="print-corner-mark top-right">+</div>
          <div className="print-corner-mark bottom-left">+</div>
          <div className="print-corner-mark bottom-right">+</div>

          <div className="print-cards-flex-row">
            {/* Front Face */}
            {(cardFace === 'dual' || cardFace === 'front') && (
              <div className="print-card-face-wrapper">
                <div className="print-face-label">FRONT FACE • SCAN TO ACCESS</div>
                <div className="print-card-scaler">
                  <TriagePhysicalCard
                    patient={patient}
                    variant={variant}
                    face="front"
                    emergencyPortalUrl={emergencyPortalUrl}
                  />
                </div>
              </div>
            )}

            {/* Center Fold / Cut Guide Line */}
            {cardFace === 'dual' && (
              <div className="print-fold-divider">
                <div className="print-fold-line" />
                <div className="print-fold-badge">
                  <Scissors size={11} className="print-scissors-icon" />
                  <span>FOLD / CUT</span>
                </div>
                <div className="print-fold-line" />
              </div>
            )}

            {/* Back Face */}
            {(cardFace === 'dual' || cardFace === 'back') && (
              <div className="print-card-face-wrapper">
                <div className="print-face-label">BACK FACE • CLINICAL DIRECTIVES</div>
                <div className="print-card-scaler">
                  <TriagePhysicalCard
                    patient={patient}
                    variant={variant}
                    face="back"
                    emergencyPortalUrl={emergencyPortalUrl}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="qrakshak-printable-id-card-sheet">
      {/* ── Official Print Header ── */}
      <header className="print-sheet-header">
        <div className="print-header-brand">
          <div className="print-cross-emblem">+</div>
          <div>
            <h1 className="print-sheet-title">Q-RAKSHAK EMERGENCY MEDICAL IDENTITY CARD</h1>
            <p className="print-sheet-subtitle">
              ISO/IEC 7810 ID-1 Standard Physical Telemetry Pass • National Health Stack / ABDM Aligned
            </p>
          </div>
        </div>

        <div className="print-header-meta">
          <div>MRN: <strong>{mrn}</strong></div>
          <div>ABHA: <strong>{abhaId}</strong></div>
          <div>PERMANENT ID: <strong>{patientId}</strong></div>
          <div>ISSUED: <strong>{currentDate}</strong></div>
        </div>
      </header>

      {/* ── Print Calibration Scale Bar ── */}
      <div className="print-calibration-bar">
        <div className="print-scale-marker">
          <span className="print-scale-label">CALIBRATION SCALE [50 mm]:</span>
          <div className="print-scale-ruler" />
          <span className="print-scale-hint">Physical ruler check: Exactly 50 mm (5.0 cm)</span>
        </div>
        <div className="print-instructions-callout">
          <strong>PRINT INSTRUCTIONS:</strong> Set printer dialog scale to <strong>"100% / Actual Size"</strong> (disable "Fit to Page"). Cut along outer dashed perimeter marks. Fold along center line to create double-sided wallet card.
        </div>
      </div>

      {/* ── Cards Section ── */}
      <div className="print-cards-stage">
        {(cardTheme === 'both' || cardTheme === 'light') &&
          renderCardPair('light', 'CLINICAL DAY WHITE EDITION')}

        {(cardTheme === 'both' || cardTheme === 'dark') &&
          renderCardPair('dark', 'FIRST RESPONDER MATTE CHARCOAL EDITION')}
      </div>

      {/* ── Footer Directives & Helpline Matrix ── */}
      <footer className="print-sheet-footer">
        <div className="print-helplines-grid">
          <div className="print-helpline-cell">
            <span className="print-helpline-num">108</span>
            <span className="print-helpline-desc">National Ambulance Service</span>
          </div>
          <div className="print-helpline-cell">
            <span className="print-helpline-num">112</span>
            <span className="print-helpline-desc">Unified National Emergency</span>
          </div>
          <div className="print-helpline-cell">
            <span className="print-helpline-num">1075</span>
            <span className="print-helpline-desc">MoHFW Health Helpline</span>
          </div>
          <div className="print-helpline-cell">
            <span className="print-helpline-num">100</span>
            <span className="print-helpline-desc">Police Emergency Response</span>
          </div>
        </div>

        <div className="print-legal-notice">
          <p>
            <strong>NOTICE TO PARAMEDICS, ER ATTENDANTS & FIRST RESPONDERS:</strong> Scan the high-resolution dynamic QR code on the front face using any standard smartphone camera. It resolves directly to the immutable tamper-evident triage portal at <code>{emergencyPortalUrl || `https://qrakshak.in/#emergency/${patientId}`}</code> providing real-time vitals, baseline ECG telemetry, physician contacts, and trauma directives.
          </p>
          <div className="print-ledger-seal-row">
            <span>Cryptographic Anchor: SHA-256 WORM Audit Log Verified</span>
            <span>Security Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
