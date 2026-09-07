import React from 'react';
import { useTwinStore } from '../store/twinStore';
import { DISEASE_REGISTRY } from '../data/diseaseRegistry';
import { getSeverityTier } from '../data/visualizationRules';
import { Layers, Activity } from 'lucide-react';

export default function LiverDiseaseControls() {
  const diseaseParams = useTwinStore((state) => state.diseaseParams.LIVER_DISEASE);
  const updateDiseaseParam = useTwinStore((state) => state.updateDiseaseParam);

  const disease = DISEASE_REGISTRY.LIVER_DISEASE;
  const tier = getSeverityTier(diseaseParams.percentage);

  return (
    <div className="space-y-4">
      {/* Hepatic Parenchymal Involvement Slider */}
      <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            Hepatic Parenchymal Involvement
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
            onChange={(e) => updateDiseaseParam('LIVER_DISEASE', 'percentage', Number(e.target.value))}
            className="w-full accent-amber-600 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={diseaseParams.percentage}
            onChange={(e) => updateDiseaseParam('LIVER_DISEASE', 'percentage', Math.max(0, Math.min(100, Number(e.target.value))))}
            className="w-14 px-1.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-center text-slate-200"
          />
        </div>
      </div>

      {/* Hepatic Lobe Segmentation */}
      <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          Hepatic Lobe Segmentation
        </label>
        <div className="grid grid-cols-2 gap-2">
          {disease.lobes.map((lobe) => (
            <button
              key={lobe.id}
              onClick={() => updateDiseaseParam('LIVER_DISEASE', 'selectedLobe', lobe.label)}
              className={`text-left px-3 py-2 rounded-lg text-xs transition border ${
                diseaseParams.selectedLobe === lobe.label
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-medium'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {lobe.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
