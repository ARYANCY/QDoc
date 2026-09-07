import React from 'react';
import { useTwinStore } from '../store/twinStore';
import { ANATOMY_REGISTRY } from '../data/anatomyRegistry';
import { DISEASE_REGISTRY } from '../data/diseaseRegistry';
import { getSeverityTier } from '../data/visualizationRules';
import {
  Info,
  Crosshair,
  Sliders,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';

export default function RightSidebar() {
  const selectedAnatomy = useTwinStore((state) => state.selectedAnatomy);
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const selectedDisease = useTwinStore((state) => state.selectedDisease);
  const involvementMap = useTwinStore((state) => state.involvementMap);
  const updateInvolvement = useTwinStore((state) => state.updateInvolvement);
  const setCameraAction = useTwinStore((state) => state.setCameraAction);
  const patient = useTwinStore((state) => state.patient);

  const anatomy = selectedAnatomy ? ANATOMY_REGISTRY[selectedAnatomy] : null;
  const disease = DISEASE_REGISTRY[selectedDisease];
  const percentage = anatomy ? involvementMap[anatomy.id] || 0 : 0;
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
    <aside className="w-80 h-full bg-surface border-l border-slate-800 flex flex-col overflow-hidden select-none z-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Anatomy Inspector
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 1. Selected Organ Details */}
        {anatomy ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-secondary border border-slate-700/80 shadow-md space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    {anatomy.label}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {anatomy.category} • Layer: {anatomy.layer}
                  </span>
                </div>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold ${tier.badgeClass}`}>
                  {percentage}%
                </span>
              </div>

              <p className="text-xs text-slate-300/90 leading-relaxed">
                {anatomy.description}
              </p>

              {/* Involvement Slider for this organ */}
              <div className="pt-2 border-t border-slate-750 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Involvement Level:</span>
                  <span className="font-semibold text-slate-200 font-mono">
                    {tier.label} ({percentage}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => updateInvolvement(anatomy.id, Number(e.target.value))}
                  className="w-full accent-sky-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Action: Focus Camera */}
              <button
                onClick={() => setCameraAction('focus')}
                className="w-full py-2 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 text-xs font-semibold border border-sky-400/40 transition flex items-center justify-center gap-1.5"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Focus Camera on {anatomy.label}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-surface-secondary/40 border border-dashed border-slate-800 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              Click any organ in the 3D viewer to inspect anatomical parameters.
            </p>
          </div>
        )}

        {/* 2. All Affected Structures in Current Simulation */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Affected Structures ({affectedList.length})
            </h4>
          </div>

          {affectedList.length > 0 ? (
            <div className="space-y-1.5">
              {affectedList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedAnatomy(item.id)}
                  className={`w-full p-2.5 rounded-lg text-left transition border flex items-center justify-between ${
                    selectedAnatomy === item.id
                      ? 'bg-sky-950/60 border-sky-500/50 text-sky-200 ring-1 ring-sky-500/30'
                      : 'bg-surface-secondary/60 border-slate-800 text-slate-300 hover:bg-surface-secondary hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.tier.hexColor }}></span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${item.tier.badgeClass}`}>
                    {item.percentage}%
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-surface-secondary/30 text-center text-xs text-slate-500">
              No active disease involvement configured.
            </div>
          )}
        </div>

        {/* 3. Clinical Profile Summary */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Twin Simulation Profile
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Sex Config:</span>
              <span className="font-medium capitalize">{patient.sex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Age Group:</span>
              <span className="font-medium">{patient.ageGroup}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Condition:</span>
              <span className="font-medium text-sky-300">{disease?.name}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
