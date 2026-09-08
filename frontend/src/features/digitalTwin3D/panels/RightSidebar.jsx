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
  const dbData = useTwinStore((state) => state.dbData);

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
          <Info size={16} color="var(--dt-gold)" />
          <h3 style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFFFFF', margin: 0 }}>
            Anatomy Inspector
          </h3>
        </div>
        <span
          style={{
            fontFamily: 'var(--dt-font-mono)',
            fontSize: '0.60rem',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'var(--dt-bg-input)',
            color: 'var(--dt-gold)',
            border: '1px solid var(--dt-border-default)',
            fontWeight: 700,
          }}
        >
          {selectedAnatomy || 'NONE SELECTED'}
        </span>
      </div>

      <div className="dt-panel-body">
        {/* 1. Selected Organ Details Card */}
        {anatomy ? (
          <div className="dt-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {anatomy.label}
                </h4>
                <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.60rem', color: 'var(--dt-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Category: {anatomy.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCameraAction('focus')}
                title="Focus 3D Camera on this Organ"
                className="dt-action-btn"
                style={{ padding: '5px 8px' }}
              >
                <Crosshair size={13} color="var(--dt-gold)" />
              </button>
            </div>

            <p style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.68rem', color: 'var(--dt-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {anatomy.description}
            </p>

            {/* Intensity Severity Slider */}
            <div className="dt-slider-wrap">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--dt-font-mono)', fontSize: '0.68rem' }}>
                <span style={{ color: 'var(--dt-text-muted)', fontWeight: 700 }}>Disease Involvement:</span>
                <span style={{ fontWeight: 800, color: tier.hexColor }}>
                  {percentage}% ({tier.label})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => updateInvolvement(anatomy.id, parseInt(e.target.value))}
                className="dt-range-slider"
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              borderRadius: '8px',
              border: '1px dashed var(--dt-border-default)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Layers size={22} color="var(--dt-text-muted)" />
            <p style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.70rem', color: 'var(--dt-text-muted)', margin: 0 }}>
              Click any 3D organ mesh in the viewport to inspect tissue telemetry
            </p>
          </div>
        )}

        {/* 2. Active Affected Organs Summary */}
        <div className="dt-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--dt-text-secondary)' }}>
              Affected Organs ({affectedList.length})
            </span>
            <ShieldAlert size={14} color="var(--dt-gold)" />
          </div>

          {affectedList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '12px', color: 'var(--dt-text-muted)', fontSize: '0.68rem', fontFamily: 'var(--dt-font-mono)' }}>
              All organ systems operating at healthy baseline
            </div>
          ) : (
            <div className="dt-affected-list">
              {affectedList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedAnatomy(item.id)}
                  className={`dt-affected-item ${selectedAnatomy === item.id ? 'active' : ''}`}
                >
                  <span style={{ fontWeight: 700 }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.60rem',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: '3px',
                        color: item.tier.hexColor,
                        backgroundColor: `${item.tier.hexColor}20`,
                      }}
                    >
                      {item.percentage}%
                    </span>
                    <ChevronRight size={12} color="var(--dt-text-muted)" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. DB Risk Profile (when patient is active) */}
        {patientMode === 'active' && dbData?.selected_visit?.module_risks && (
          <div className="dt-card" style={{ borderLeft: '3px solid var(--dt-teal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--dt-teal-glow)' }}>
                DB Biomarker Risk Profile
              </span>
              <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.60rem', color: 'var(--dt-text-muted)' }}>
                {dbData.selected_visit.date}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              {Object.entries(dbData.selected_visit.module_risks).map(([sys, risk]) => {
                const pct = Math.round(risk * 100);
                const label = sys.replace('oncology_', '').replace('_', ' ');
                const color = pct > 60 ? '#EF4444' : pct > 30 ? '#F59E0B' : '#10B981';
                return (
                  <div key={sys} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--dt-font-mono)', fontSize: '0.62rem' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--dt-text-secondary)' }}>{label}</span>
                      <span style={{ fontWeight: 800, color }}>{pct}%</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '2px', background: '#181C26', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '2px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Clinical Status Card */}
        <div className="dt-card">
          <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--dt-text-secondary)' }}>
            Twin Simulation Status
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--dt-font-mono)', fontSize: '0.68rem', color: 'var(--dt-text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Anatomical Sex:</span>
              <strong style={{ color: '#FFFFFF', textTransform: 'capitalize' }}>{patient.sex}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Age Cohort:</span>
              <strong style={{ color: '#FFFFFF' }}>{patient.ageGroup} yrs</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Condition:</span>
              <strong style={{ color: 'var(--dt-gold)' }}>{disease?.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Database Sync:</span>
              <strong style={{ color: patientMode === 'active' ? 'var(--dt-teal-glow)' : 'var(--dt-text-muted)' }}>
                {patientMode === 'active' ? '● Live DB Connected' : '○ Standalone Preview'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

