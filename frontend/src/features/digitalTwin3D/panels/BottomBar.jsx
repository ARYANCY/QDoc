import React from 'react';
import { SEVERITY_TIERS } from '../data/visualizationRules';
import { useTwinStore } from '../store/twinStore';

export default function BottomBar() {
  const involvementMap = useTwinStore((state) => state.involvementMap);

  const values = Object.values(involvementMap).filter((v) => v > 0);
  const maxInvolvement = values.length > 0 ? Math.max(...values) : 0;
  const avgInvolvement = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  return (
    <footer className="dt-bottombar">
      {/* Visual Severity Legend */}
      <div className="dt-legend-group">
        <span style={{ color: 'var(--dt-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Severity Tiers:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {SEVERITY_TIERS.map((tier) => (
            <div key={tier.level} className="dt-legend-item">
              <span
                className="dt-legend-dot"
                style={{ backgroundColor: tier.hexColor, boxShadow: `0 0 6px ${tier.hexColor}60` }}
              />
              <span style={{ color: 'var(--dt-text-secondary)', fontWeight: 700 }}>
                {tier.label}
              </span>
              <span style={{ color: 'var(--dt-text-muted)', fontSize: '0.58rem' }}>
                {tier.range[0]}–{tier.range[1]}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--dt-text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span>Max Involvement:</span>
          <strong style={{ color: 'var(--dt-gold)' }}>{maxInvolvement}%</strong>
        </div>
        <div style={{ width: '1px', height: '12px', background: 'var(--dt-border-default)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span>Average Affected:</span>
          <strong style={{ color: '#FFFFFF' }}>{avgInvolvement}%</strong>
        </div>
        <div style={{ width: '1px', height: '12px', background: 'var(--dt-border-default)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span>3D Engine:</span>
          <strong style={{ color: 'var(--dt-teal-glow)' }}>25 Organ WebGL PBR</strong>
        </div>
      </div>
    </footer>
  );
}

