import React from 'react';
import { useTwinStore } from '../store/twinStore';
import { ANATOMY_REGISTRY } from '../data/anatomyRegistry';
import { DISEASE_REGISTRY } from '../data/diseaseRegistry';
import { getSeverityTier } from '../data/visualizationRules';
import {
  Info,
  Crosshair,
  ShieldAlert,
  ChevronRight,
  Layers,
  Activity
} from 'lucide-react';

export default function RightSidebar() {
  const selectedAnatomy = useTwinStore((state) => state.selectedAnatomy);
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const selectedDisease = useTwinStore((state) => state.selectedDisease);
  const involvementMap = useTwinStore((state) => state.involvementMap);
  const updateInvolvement = useTwinStore((state) => state.updateInvolvement);
  const setCameraAction = useTwinStore((state) => state.setCameraAction);
  const patient = useTwinStore((state) => state.patient);
  const patientMode = useTwinStore((state) => state.patientMode);

  const anatomy = selectedAnatomy ? ANATOMY_REGISTRY[selectedAnatomy] : null;
  const disease = DISEASE_REGISTRY[selectedDisease];
  const percentage = anatomy ? (involvementMap[anatomy.id] || 0) : 0;
  const tier = getSeverityTier(percentage);

  // List of all currently affected structures
  const affectedList = Object.entries(involvementMap)
    .filter(([_, val]) => val > 0)
    .map(([id, val]) => ({
      id,
      label: ANATOMY_REGISTRY[id]?.label || id,
      percentage: val,
      tier: getSeverityTier(val)
    }));

  return (
    <aside className="dt-right-sidebar">
      {/* Header */}
      <div className="dt-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} color="var(--dt-accent-blue)" />
          <h3 style={{ fontSize: '0.80rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--dt-text-primary)', margin: 0 }}>
            Anatomy Inspector
          </h3>
        </div>
        <span
          style={{
            fontFamily: 'var(--dt-font-mono)',
            fontSize: '0.60rem',
            padding: '2px 7px',
            borderRadius: '4px',
            background: 'var(--dt-bg-card-hover)',
            color: 'var(--dt-accent-blue)',
            border: '1px solid var(--dt-border-default)',
            fontWeight: 700,
          }}
        >
          {selectedAnatomy || 'NONE SELECTED'}
        </span>
      </div>

      <div className="dt-panel-body">
        {/* 1. Active Affected Organs Summary */}
        <div className="dt-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--dt-text-primary)' }}>
              Affected Organs ({affectedList.length})
            </span>
            <ShieldAlert size={14} color="#D97706" />
          </div>

          <div className="dt-affected-list">
            {affectedList.length === 0 ? (
              <p style={{ fontSize: '0.70rem', color: 'var(--dt-text-muted)', margin: 0 }}>
                No active disease hotspots mapped.
              </p>
            ) : (
              affectedList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedAnatomy(item.id);
                    setCameraAction('focus');
                  }}
                  className={`dt-affected-item ${selectedAnatomy === item.id ? 'active' : ''}`}
                >
                  <span style={{ fontWeight: 600 }}>{item.label}</span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: `${item.tier.hexColor}15`,
                      color: item.tier.hexColor,
                      border: `1px solid ${item.tier.hexColor}40`,
                      fontWeight: 800,
                    }}
                  >
                    {item.percentage}%
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 2. Disease Simulation Baseline */}
        <div className="dt-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--dt-text-primary)' }}>
              Twin Simulation Status
            </span>
            <Activity size={14} color="#059669" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--dt-text-muted)' }}>Anatomical Sex:</span>
              <strong style={{ color: 'var(--dt-text-primary)' }}>{patient.sex || 'Female'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--dt-text-muted)' }}>Age Cohort:</span>
              <strong style={{ color: 'var(--dt-text-primary)' }}>{patient.ageGroup || '40-60 yrs'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--dt-text-muted)' }}>Condition:</span>
              <strong style={{ color: 'var(--dt-accent-blue)' }}>{disease?.name || 'Breast Cancer'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--dt-text-muted)' }}>Database Sync:</span>
              <strong style={{ color: '#059669' }}>Live DB Connected</strong>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
