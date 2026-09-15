import React from 'react';
import { SEVERITY_TIERS } from '../data/visualizationRules';
import { useTwinStore } from '../store/twinStore';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

export default function BottomBar() {
  const involvementMap = useTwinStore((state) => state.involvementMap);
  const patient = useTwinStore((state) => state.patient);
  const patientMode = useTwinStore((state) => state.patientMode);

  const values = Object.values(involvementMap).filter((v) => v > 0);
  const maxInvolvement = values.length > 0 ? Math.max(...values) : 0;
  const organCount = values.length;

  return (
    <footer className="dt-bottombar">
      {/* Visual Severity Legend */}
      <div className="dt-legend-group">
        <span style={{ color: 'var(--dt-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Severity:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {SEVERITY_TIERS.map((tier) => (
            <div key={tier.level} className="dt-legend-item">
              <span
                className="dt-legend-dot"
                style={{ backgroundColor: tier.hexColor }}
              />
              <span style={{ color: 'var(--dt-text-primary)', fontWeight: 600 }}>
                {tier.label}
              </span>
              <span style={{ color: 'var(--dt-text-muted)', fontSize: '0.62rem' }}>
                ({tier.range[0]}–{tier.range[1]}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Twin Telemetry & Status Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="dt-legend-item" style={{ background: 'var(--dt-accent-blue-soft)', borderColor: 'rgba(37, 99, 235, 0.2)' }}>
          <Activity size={12} color="var(--dt-accent-blue)" />
          <span style={{ color: 'var(--dt-accent-blue)', fontWeight: 700 }}>
            Peak Risk: {maxInvolvement}%
          </span>
        </div>

        <div className="dt-legend-item">
          <ShieldAlert size={12} color={organCount > 0 ? '#D97706' : '#059669'} />
          <span style={{ color: 'var(--dt-text-primary)', fontWeight: 600 }}>
            {organCount} Hotspot{organCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="dt-legend-item" style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
          <Cpu size={12} color="#059669" />
          <span style={{ color: '#059669', fontWeight: 700 }}>
            {patientMode === 'active' ? `Twin Synced: ${patient.patientId || 'PT-89421'}` : 'Interactive Standby'}
          </span>
        </div>
      </div>
    </footer>
  );
}
