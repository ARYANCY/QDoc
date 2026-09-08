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

  if (layers.labels === false) return null;

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
      style={{ pointerEvents: 'auto', transition: 'opacity 0.05s ease' }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedAnatomy(isSelected ? null : anatomyId);
        }}
        className={`px-2.5 py-1 rounded-lg backdrop-blur-md text-[11px] font-medium transition-all shadow-2xl flex flex-col gap-0.5 border cursor-pointer ${
          isSelected
            ? 'bg-[#0284C7]/90 border-sky-300 text-white ring-2 ring-sky-400/50 shadow-sky-500/20'
            : percentage > 40
            ? 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-rose-900/40'
            : 'bg-[#0C1220]/95 border-[#1E293B] text-slate-200 hover:border-sky-400'
        }`}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold">{anatomy.label}</span>
          {percentage > 0 && (
            <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
              percentage > 40 ? 'bg-rose-600/60 text-white' : 'bg-emerald-600/50 text-white'
            }`}>
              {percentage}%
            </span>
          )}
        </div>
        <div className="text-[9px] font-mono text-slate-400">
          {percentage > 40 ? 'Elevated Biomarker Telemetry' : 'Normal Physiological State'}
        </div>
      </div>
    </Html>
  );
}
