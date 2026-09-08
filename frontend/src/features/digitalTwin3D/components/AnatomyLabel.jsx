import React from 'react';
import { Html } from '@react-three/drei';
import { useTwinStore } from '../store/twinStore';
import { ANATOMY_REGISTRY } from '../data/anatomyRegistry';
import { getSeverityTier } from '../data/visualizationRules';

export default function AnatomyLabel({ anatomyId, position }) {
  const selectedAnatomy = useTwinStore((state) => state.selectedAnatomy);
  const hoveredAnatomy = useTwinStore((state) => state.hoveredAnatomy);
  const involvementMap = useTwinStore((state) => state.involvementMap);
  const layers = useTwinStore((state) => state.layers);
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);

  if (layers.labels === false || anatomyId === 'SKIN' || anatomyId === 'VASCULAR_SYSTEM') return null;

  const anatomy = ANATOMY_REGISTRY[anatomyId];
  if (!anatomy || !anatomy.position) return null;

  const percentage = involvementMap[anatomyId] || 0;
  const isSelected = selectedAnatomy === anatomyId;
  const isHovered = hoveredAnatomy === anatomyId;

  // Only show labels when explicitly hovered (5ms instant response) or selected
  const shouldShow = isHovered || isSelected;
  if (!shouldShow) return null;

  const tier = getSeverityTier(percentage);
  const targetPos = position || anatomy.position;

  return (
    <Html
      position={[targetPos[0], targetPos[1] + 0.08, targetPos[2]]}
      distanceFactor={4.5}
      center
      style={{ pointerEvents: 'auto', transition: 'opacity 0.1s ease' }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedAnatomy(isSelected ? null : anatomyId);
        }}
        className="dt-anatomy-label-badge"
        style={{
          background: isSelected
            ? 'rgba(15, 118, 110, 0.95)'
            : percentage > 40
            ? 'rgba(159, 18, 57, 0.95)'
            : 'rgba(14, 16, 23, 0.92)',
          borderColor: isSelected
            ? 'var(--dt-teal-glow)'
            : percentage > 40
            ? '#F43F5E'
            : 'var(--dt-border-default)',
          boxShadow: isSelected
            ? '0 0 16px rgba(45, 212, 191, 0.35)'
            : percentage > 40
            ? '0 0 16px rgba(244, 63, 94, 0.35)'
            : '0 4px 14px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.68rem', fontWeight: 800, color: '#FFFFFF' }}>
            {anatomy.label}
          </span>
          {percentage > 0 && (
            <span
              style={{
                fontFamily: 'var(--dt-font-mono)',
                fontSize: '0.60rem',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '3px',
                background: percentage > 40 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                color: '#FFFFFF'
              }}
            >
              {percentage}%
            </span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.56rem', color: percentage > 40 ? '#FCA5A5' : 'var(--dt-text-muted)', marginTop: '1px' }}>
          {percentage > 40 ? 'Elevated Biomarker Telemetry' : 'Normal Physiological State'}
        </div>
      </div>
    </Html>
  );
}
