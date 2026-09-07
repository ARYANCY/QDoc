import React from 'react';
import { useTwinStore } from '../store/twinStore';
import { getSeverityTier } from '../data/visualizationRules';
import { Network, Activity } from 'lucide-react';

export default function DiabetesControls() {
  const diseaseParams = useTwinStore((state) => state.diseaseParams.DIABETES);
  const updateDiseaseParam = useTwinStore((state) => state.updateDiseaseParam);

  const targets = [
    { key: 'pancreas', label: 'Pancreas (Endocrine/Islet)', val: diseaseParams.pancreas, color: 'accent-yellow-500' },
    { key: 'kidneyLeft', label: 'Left Kidney (Renal/Nephron)', val: diseaseParams.kidneyLeft, color: 'accent-purple-500' },
    { key: 'kidneyRight', label: 'Right Kidney (Renal/Nephron)', val: diseaseParams.kidneyRight, color: 'accent-purple-500' },
    { key: 'heart', label: 'Heart (Cardiovascular Baseline)', val: diseaseParams.heart, color: 'accent-red-500' },
    { key: 'vascular', label: 'Vascular Network (Micro/Macro)', val: diseaseParams.vascular, color: 'accent-rose-500' },
  ];

  return (
    <div className="space-y-3.5">
      <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
        <Network className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Systemic Metabolic Model:</strong> Adjust configured involvement across multiple distributed target organs simultaneously.
        </span>
      </div>

      {targets.map((item) => {
        const tier = getSeverityTier(item.val);
        return (
          <div key={item.key} className="p-3 rounded-xl bg-surface-secondary/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                {item.label}
              </label>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${tier.badgeClass}`}>
                {item.val}% ({tier.label})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={item.val}
                onChange={(e) => updateDiseaseParam('DIABETES', item.key, Number(e.target.value))}
                className={`w-full ${item.color} h-1.5 bg-slate-700 rounded-lg cursor-pointer`}
              />
              <input
                type="number"
                min="0"
                max="100"
                value={item.val}
                onChange={(e) => updateDiseaseParam('DIABETES', item.key, Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-14 px-1.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-center text-slate-200"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
