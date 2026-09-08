import React from 'react';
import { SEVERITY_TIERS } from '../data/visualizationRules';
import { useTwinStore } from '../store/twinStore';
import { ShieldCheck, AlertCircle, AlertTriangle, Activity, Flame, AlertOctagon } from 'lucide-react';

const iconMap = {
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Activity,
  Flame,
  AlertOctagon
};

export default function BottomBar() {
  const involvementMap = useTwinStore((state) => state.involvementMap);
  const patientMode = useTwinStore((state) => state.patientMode);

  const values = Object.values(involvementMap).filter((v) => v > 0);
  const maxInvolvement = values.length > 0 ? Math.max(...values) : 0;
  const avgInvolvement = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  return (
    <footer className="h-11 bg-[#090A0D] border-t border-[#20232B] px-4 flex items-center justify-between z-20 text-xs select-none">
      {/* Visual Severity Legend */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono hidden md:inline">
          Severity Tiers:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {SEVERITY_TIERS.map((tier) => (
            <div
              key={tier.level}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#12141C] border border-[#222530]"
            >
              <span
                className="w-2 h-2 rounded-full shadow-sm"
                style={{ backgroundColor: tier.hexColor }}
              ></span>
              <span className="text-slate-300 text-[10px] font-mono font-medium">
                {tier.label}
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                {tier.range[0]}–{tier.range[1]}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Max Intensity:</span>
          <span className="text-[#D4AF37] font-bold">{maxInvolvement}%</span>
        </div>
        <div className="w-[1px] h-3 bg-[#242833] hidden sm:block"></div>
        <div className="flex items-center gap-1.5 hidden sm:flex">
          <span className="text-slate-500">Avg Affected:</span>
          <span className="text-slate-200 font-bold">{avgInvolvement}%</span>
        </div>
        <div className="w-[1px] h-3 bg-[#242833] hidden sm:block"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Engine:</span>
          <span className="text-[#2DD4BF] font-bold">25 GLB PBR</span>
        </div>
      </div>
    </footer>
  );
}
