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
    <div className="space-y-4">
      {/* Heart Involvement Slider */}
      <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-500" />
            Cardiac Involvement
          </label>
          <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${tier.badgeClass}`}>
            {diseaseParams.percentage}% ({tier.label})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={diseaseParams.percentage}
            onChange={(e) => updateDiseaseParam('HEART_DISEASE', 'percentage', Number(e.target.value))}
            className="w-full accent-red-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={diseaseParams.percentage}
            onChange={(e) => updateDiseaseParam('HEART_DISEASE', 'percentage', Math.max(0, Math.min(100, Number(e.target.value))))}
            className="w-14 px-1.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-center text-slate-200"
          />
        </div>
      </div>

      {/* Cardiac Substructure Focus */}
      <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-red-400" />
          Cardiac Substructure Simulation
        </label>
        <div className="grid grid-cols-2 gap-2">
          {disease.subregions.map((sub) => (
            <button
              key={sub.id}
              onClick={() => updateDiseaseParam('HEART_DISEASE', 'selectedSubregion', sub.label)}
              className={`text-left px-3 py-2 rounded-lg text-xs transition border ${
                diseaseParams.selectedSubregion === sub.label
                  ? 'bg-red-500/20 border-red-500/50 text-red-200 font-medium'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Pulsatile Emissive Feedback Toggle */}
      <div className="p-3 rounded-xl bg-surface-secondary/50 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-red-400" />
          <span className="text-xs text-slate-300">Pulsatile Cardiac Animation</span>
        </div>
        <button
          onClick={() => updateDiseaseParam('HEART_DISEASE', 'pulseIntensity', !diseaseParams.pulseIntensity)}
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
            diseaseParams.pulseIntensity
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {diseaseParams.pulseIntensity ? 'Active' : 'Static'}
        </button>
      </div>
    </div>
  );
}
