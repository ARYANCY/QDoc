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

  const patientAnalysis = useTwinStore((state) => state.patientAnalysis);
  const isSelected = selectedAnatomy === anatomyId;
  const isHovered = hoveredAnatomy === anatomyId;
  const isAnalyzed = patientAnalysis && patientAnalysis.targetOrgan === anatomyId;

  // Show labels if affected or analyzed or hovered or selected
  const shouldShow = percentage > 0 || isSelected || isHovered || isAnalyzed;
  if (!shouldShow) return null;

  const tier = getSeverityTier(percentage);
  const targetPos = position || anatomy.position;

  return (
    <Html
      position={[targetPos[0], targetPos[1] + 0.08, targetPos[2]]}
      distanceFactor={4.5}
      center
      style={{ pointerEvents: 'auto' }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedAnatomy(anatomyId);
        }}
        className={`px-2.5 py-0.5 rounded-full backdrop-blur-md text-[10px] font-medium transition-all shadow-md flex items-center gap-1.5 border whitespace-nowrap cursor-pointer ${
          isAnalyzed || isSelected
            ? 'bg-white/95 border-rose-500 text-rose-700 ring-2 ring-rose-400/40 font-bold'
            : percentage > 30
            ? 'bg-white/90 border-amber-400 text-amber-800'
            : 'bg-white/90 border-slate-200 text-slate-800 hover:border-slate-400'
        }`}
      >
        {isAnalyzed && (
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
        )}
        <span>{anatomy.label}</span>
        {(percentage > 0 || isAnalyzed) && (
          <span className={`font-mono text-[9px] font-bold px-1 py-0.2 rounded ${isAnalyzed ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
            {isAnalyzed ? `${patientAnalysis.confidence ? Math.round(patientAnalysis.confidence * 100) : percentage}% RISK` : `${percentage}%`}
          </span>
        )}
      </button>
    </Html>
  );
}
