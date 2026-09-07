import React from 'react';
import { SEVERITY_TIERS } from '../data/visualizationRules';
import { useTwinStore } from '../store/twinStore';
import { ShieldCheck, AlertCircle, AlertTriangle, Activity, Flame, AlertOctagon } from 'lucide-react';

const iconMap = {
  ShieldCheck: ShieldCheck,
  AlertCircle: AlertCircle,
  AlertTriangle: AlertTriangle,
  Activity: Activity,
  Flame: Flame,
  AlertOctagon: AlertOctagon
};

export default function BottomBar() {
  const involvementMap = useTwinStore((state) => state.involvementMap);
  const selectedDisease = useTwinStore((state) => state.selectedDisease);

  const values = Object.values(involvementMap).filter((v) => v > 0);
  const maxInvolvement = values.length > 0 ? Math.max(...values) : 0;
  const avgInvolvement = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  return (
    <footer className="h-12 bg-surface border-t border-slate-800 px-4 flex items-center justify-between z-20 text-xs">
      {/* Visual Severity Legend */}
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden md:inline">
          Severity Scale:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {SEVERITY_TIERS.map((tier) => {
            const IconComponent = iconMap[tier.icon] || Activity;
            return (
              <div
                key={tier.level}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-surface-secondary border border-slate-800"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: tier.hexColor }}
                ></span>
                <span className="text-slate-300 text-[11px] font-medium">
                  {tier.label}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {tier.range[0]}–{tier.range[1]}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Max Intensity:</span>
          <span className="text-slate-200 font-bold">{maxInvolvement}%</span>
        </div>
        <div className="w-[1px] h-3 bg-slate-700 hidden sm:block"></div>
        <div className="flex items-center gap-1.5 hidden sm:flex">
          <span className="text-slate-500">Avg Affected:</span>
          <span className="text-slate-200 font-bold">{avgInvolvement}%</span>
        </div>
      </div>
    </footer>
  );
}
