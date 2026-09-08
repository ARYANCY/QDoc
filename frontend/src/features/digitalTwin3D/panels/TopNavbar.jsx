import React, { useState } from 'react';
import { useTwinStore } from '../store/twinStore';
import {
  Layers,
  FileText,
  GitCompare,
  Clock,
  ChevronDown,
  Check,
  Dna,
  Download
} from 'lucide-react';

export default function TopNavbar({ onExportReport }) {
  const layers = useTwinStore((state) => state.layers);
  const toggleLayer = useTwinStore((state) => state.toggleLayer);
  const setComparisonOpen = useTwinStore((state) => state.setComparisonOpen);
  const setTimelineOpen = useTwinStore((state) => state.setTimelineOpen);
  const patient = useTwinStore((state) => state.patient);
  const patientMode = useTwinStore((state) => state.patientMode);

  const [layersMenuOpen, setLayersMenuOpen] = useState(false);

  const layerItems = [
    { key: 'skin',          label: 'Skin & Outer Surface' },
    { key: 'skeleton',      label: 'Skeletal & Bone Structure' },
    { key: 'organs',        label: 'Primary Internal Organs' },
    { key: 'vessels',       label: 'Blood Vessels & Circulatory' },
    { key: 'airway',        label: 'Respiratory Airway' },
    { key: 'digestive',     label: 'Digestive Tract' },
    { key: 'urinary',       label: 'Urinary System' },
    { key: 'diseaseOverlay',label: 'Disease Heatmap Overlays' },
    { key: 'labels',        label: '3D Anatomical Labels' },
  ];

  return (
    <header className="dt-topbar">
      {/* Brand & Studio Identity */}
      <div className="dt-topbar-left">
        <div className="dt-topbar-icon-box">
          <Dna size={18} color="var(--dt-gold)" />
        </div>
        <div>
          <div className="dt-topbar-title-wrap">
            <h1 className="dt-topbar-title">
              3D Digital Health Twin
            </h1>
            <span className="dt-topbar-pill">
              25 3D ORGANS
            </span>
          </div>
          <p className="dt-topbar-sub">
            {patientMode === 'active'
              ? `Synchronized with Patient ${patient.patientId || 'PT-89421'}`
              : 'Interactive 3D Anatomical & Biomechanical Simulation'}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="dt-topbar-actions">
        {/* Layer Visibility Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setLayersMenuOpen(!layersMenuOpen)}
            className="dt-action-btn"
          >
            <Layers size={14} color="var(--dt-gold)" />
            <span>Anatomy Layers</span>
            <ChevronDown size={13} color="var(--dt-text-muted)" />
          </button>

          {layersMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                marginTop: '6px',
                width: '260px',
                borderRadius: '8px',
                background: '#0E1118',
                border: '1px solid var(--dt-border-default)',
                padding: '8px',
                boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                zIndex: 60,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--dt-font-mono)',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: 'var(--dt-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '4px 8px 6px',
                  borderBottom: '1px solid var(--dt-border-subtle)',
                }}
              >
                Anatomical Layers ({layerItems.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px' }}>
                {layerItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleLayer(item.key)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '5px',
                      background: layers[item.key] ? 'rgba(15, 118, 110, 0.12)' : 'transparent',
                      border: 'none',
                      color: layers[item.key] ? '#FFFFFF' : 'var(--dt-text-secondary)',
                      fontFamily: 'var(--dt-font-mono)',
                      fontSize: '0.68rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.14s ease',
                    }}
                  >
                    <span>{item.label}</span>
                    {layers[item.key] ? (
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          background: 'var(--dt-teal)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={11} color="#FFFFFF" strokeWidth={3} />
                      </span>
                    ) : (
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          border: '1px solid var(--dt-border-default)',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comparison Mode */}
        <button
          type="button"
          onClick={() => setComparisonOpen(true)}
          className="dt-action-btn"
        >
          <GitCompare size={14} color="#A78BFA" />
          <span>Compare</span>
        </button>

        {/* Timeline Progression Mode */}
        <button
          type="button"
          onClick={() => setTimelineOpen(true)}
          className="dt-action-btn"
        >
          <Clock size={14} color="#FBBF24" />
          <span>Timeline</span>
        </button>

        {/* Export Report Action */}
        <button
          type="button"
          onClick={onExportReport}
          className="dt-action-btn dt-action-btn-gold"
        >
          <Download size={14} strokeWidth={2.5} />
          <span>Export Clinical Report</span>
        </button>
      </div>
    </header>
  );
}

