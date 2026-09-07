import React from 'react';
import { useTwinStore } from '../store/twinStore';
import { DISEASE_REGISTRY } from '../data/diseaseRegistry';
import { getSeverityTier } from '../data/visualizationRules';
import { Target, CircleDot, Activity } from 'lucide-react';

export default function BreastCancerControls() {
  const diseaseParams = useTwinStore((state) => state.diseaseParams.BREAST_CANCER);
  const updateDiseaseParam = useTwinStore((state) => state.updateDiseaseParam);
  const patient = useTwinStore((state) => state.patient);

  const disease = DISEASE_REGISTRY.BREAST_CANCER;
  const leftTier = getSeverityTier(diseaseParams.leftPercentage);
  const rightTier = getSeverityTier(diseaseParams.rightPercentage);

  return (
    <div className="space-y-4">
      {/* Left Breast Involvement */}
      <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            Left Breast Involvement
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
            onChange={(e) => updateDiseaseParam('BREAST_CANCER', 'leftPercentage', Number(e.target.value))}
            className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={diseaseParams.leftPercentage}
            onChange={(e) => updateDiseaseParam('BREAST_CANCER', 'leftPercentage', Math.max(0, Math.min(100, Number(e.target.value))))}
            className="w-14 px-1.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-center text-slate-200"
          />
        </div>
      </div>

      {/* Right Breast Involvement */}
      <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400"></span>
            Right Breast Involvement
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
            onChange={(e) => updateDiseaseParam('BREAST_CANCER', 'rightPercentage', Number(e.target.value))}
            className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={diseaseParams.rightPercentage}
            onChange={(e) => updateDiseaseParam('BREAST_CANCER', 'rightPercentage', Math.max(0, Math.min(100, Number(e.target.value))))}
            className="w-14 px-1.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-center text-slate-200"
          />
        </div>
      </div>

      {/* Anatomical Quadrant Selection */}
      <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-pink-400" />
          Anatomical Quadrant Mapping
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {disease.quadrants.map((quad) => (
            <button
              key={quad.id}
              onClick={() => updateDiseaseParam('BREAST_CANCER', 'selectedQuadrant', quad.label)}
              className={`text-left px-3 py-1.5 rounded-lg text-xs transition border ${
                diseaseParams.selectedQuadrant === quad.label
                  ? 'bg-pink-500/20 border-pink-500/50 text-pink-200 font-medium'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {quad.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Lesion Position Marker Configuration */}
      <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <CircleDot className="w-3.5 h-3.5 text-rose-400" />
            3D Localized Lesion Marker
          </label>
          <button
            onClick={() => updateDiseaseParam('BREAST_CANCER', 'lesionEnabled', !diseaseParams.lesionEnabled)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              diseaseParams.lesionEnabled
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {diseaseParams.lesionEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {diseaseParams.lesionEnabled && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-slate-400">Position X (Lateral):</span>
              <input
                type="number"
                step="0.05"
                value={diseaseParams.lesionX}
                onChange={(e) => updateDiseaseParam('BREAST_CANCER', 'lesionX', parseFloat(e.target.value))}
                className="w-full mt-1 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Position Y (Height):</span>
              <input
                type="number"
                step="0.05"
                value={diseaseParams.lesionY}
                onChange={(e) => updateDiseaseParam('BREAST_CANCER', 'lesionY', parseFloat(e.target.value))}
                className="w-full mt-1 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Position Z (Depth):</span>
              <input
                type="number"
                step="0.05"
                value={diseaseParams.lesionZ}
                onChange={(e) => updateDiseaseParam('BREAST_CANCER', 'lesionZ', parseFloat(e.target.value))}
                className="w-full mt-1 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Lesion Radius:</span>
              <input
                type="number"
                step="0.02"
                min="0.04"
                max="0.4"
                value={diseaseParams.lesionRadius}
                onChange={(e) => updateDiseaseParam('BREAST_CANCER', 'lesionRadius', parseFloat(e.target.value))}
                className="w-full mt-1 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Anatomical Configuration Note */}
      {patient.sex === 'male' && (
        <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-300 leading-relaxed">
          Rendering male anatomical configuration. Visualization illustrates tissue mapping independent of demographic prevalence.
        </div>
      )}
    </div>
  );
}
