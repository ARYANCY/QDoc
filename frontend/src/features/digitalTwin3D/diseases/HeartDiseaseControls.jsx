import React from 'react';
import { useTwinStore } from '../store/twinStore';
import { DISEASE_REGISTRY } from '../data/diseaseRegistry';
import { getSeverityTier } from '../data/visualizationRules';
import { Heart, Activity, Waves } from 'lucide-react';

export default function HeartDiseaseControls() {
  const diseaseParams = useTwinStore((state) => state.diseaseParams.HEART_DISEASE);
  const updateDiseaseParam = useTwinStore((state) => state.updateDiseaseParam);
  
  const disease = DISEASE_REGISTRY.HEART_DISEASE;
  const tier = getSeverityTier(diseaseParams.percentage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Heart Involvement Slider */}
      <div style={{ background: '#0D0E15', padding: '10px', borderRadius: '6px', border: '1px solid var(--dt-border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--dt-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Heart size={14} color="#EF4444" />
            Cardiac Involvement
          </label>
          <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.60rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: `${tier.hexColor}20`, color: tier.hexColor }}>
            {diseaseParams.percentage}% ({tier.label})
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="0"
            max="100"
            value={diseaseParams.percentage}
            onChange={(e) => updateDiseaseParam('HEART_DISEASE', 'percentage', Number(e.target.value))}
            className="dt-range-slider"
            style={{ flex: 1 }}
          />
          <input
            type="number"
            min="0"
            max="100"
            value={diseaseParams.percentage}
            onChange={(e) => updateDiseaseParam('HEART_DISEASE', 'percentage', Math.max(0, Math.min(100, Number(e.target.value))))}
            className="dt-input"
            style={{ width: '54px', padding: '4px 6px', textAlign: 'center', fontSize: '0.68rem' }}
          />
        </div>
      </div>

      {/* Cardiac Substructure Focus */}
      <div style={{ background: '#0D0E15', padding: '10px', borderRadius: '6px', border: '1px solid var(--dt-border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--dt-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={12} color="#EF4444" />
          Cardiac Substructure Simulation
        </label>
        <div className="dt-grid-2">
          {disease.subregions.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => updateDiseaseParam('HEART_DISEASE', 'selectedSubregion', sub.label)}
              className={`dt-affected-item ${diseaseParams.selectedSubregion === sub.label ? 'active' : ''}`}
              style={{ padding: '6px 8px', fontSize: '0.66rem' }}
            >
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pulsatile Emissive Animation Toggle */}
      <div style={{ background: '#0D0E15', padding: '10px', borderRadius: '6px', border: '1px solid var(--dt-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Waves size={14} color="#EF4444" />
          <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.68rem', color: 'var(--dt-text-secondary)' }}>
            Pulsatile Cardiac Animation
          </span>
        </div>
        <button
          type="button"
          onClick={() => updateDiseaseParam('HEART_DISEASE', 'pulseIntensity', !diseaseParams.pulseIntensity)}
          className="dt-action-btn"
          style={{ padding: '2px 8px', fontSize: '0.58rem' }}
        >
          {diseaseParams.pulseIntensity ? 'Active' : 'Static'}
        </button>
      </div>
    </div>
  );
}

