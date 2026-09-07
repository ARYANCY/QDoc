import React from 'react';
import { useTwinStore } from '../store/twinStore';
import { DISEASE_REGISTRY } from '../data/diseaseRegistry';
import { getSeverityTier } from '../data/visualizationRules';
import { Wind, Layers } from 'lucide-react';

export default function PneumoniaControls() {
  const diseaseParams = useTwinStore((state) => state.diseaseParams.PNEUMONIA);
  const updateDiseaseParam = useTwinStore((state) => state.updateDiseaseParam);

  const disease = DISEASE_REGISTRY.PNEUMONIA;
  const leftTier = getSeverityTier(diseaseParams.leftPercentage);
  const rightTier = getSeverityTier(diseaseParams.rightPercentage);

  return (
    <div className="space-y-4">
      {/* Right Lung Involvement */}
      <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            Right Lung Involvement
          </label>
          <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${rightTier.badgeClass}`}>
            {diseaseParams.rightPercentage}% ({rightTier.label})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={diseaseParams.rightPercentage}
            onChange={(e) => updateDiseaseParam('PNEUMONIA', 'rightPercentage', Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={diseaseParams.rightPercentage}
            onChange={(e) => updateDiseaseParam('PNEUMONIA', 'rightPercentage', Math.max(0, Math.min(100, Number(e.target.value))))}
            className="w-14 px-1.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-center text-slate-200"
          />
        </div>
      </div>

      {/* Left Lung Involvement */}
      <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            Left Lung Involvement
          </label>
          <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${leftTier.badgeClass}`}>
            {diseaseParams.leftPercentage}% ({leftTier.label})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={diseaseParams.leftPercentage}
            onChange={(e) => updateDiseaseParam('PNEUMONIA', 'leftPercentage', Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={diseaseParams.leftPercentage}
            onChange={(e) => updateDiseaseParam('PNEUMONIA', 'leftPercentage', Math.max(0, Math.min(100, Number(e.target.value))))}
            className="w-14 px-1.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-center text-slate-200"
          />
        </div>
      </div>

      {/* Lobar Pulmonary Zone Mapping */}
      <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Lobar Pulmonary Zone Mapping
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {disease.lungZones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => updateDiseaseParam('PNEUMONIA', 'selectedZone', zone.label)}
              className={`text-left px-3 py-1.5 rounded-lg text-xs transition border flex items-center justify-between ${
                diseaseParams.selectedZone === zone.label
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 font-medium'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{zone.label}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {zone.organ === 'LUNG_RIGHT' ? 'Right' : 'Left'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
