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
  Layers,
  Dna
} from 'lucide-react';

export default function RightSidebar() {
  const selectedAnatomy = useTwinStore((state) => state.selectedAnatomy);
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const selectedDisease = useTwinStore((state) => state.selectedDisease);
  const involvementMap = useTwinStore((state) => state.involvementMap);
  const updateInvolvement = useTwinStore((state) => state.updateInvolvement);
  const setCameraAction = useTwinStore((state) => state.setCameraAction);
  const patient = useTwinStore((state) => state.patient);
  const patientMode = useTwinStore((state) => state.patientMode);
  const dbData = useTwinStore((state) => state.dbData);

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
    <aside className="w-80 h-full bg-[#090A0D] border-l border-[#20232B] flex flex-col overflow-hidden select-none z-20">
      {/* Header */}
      <div className="p-3.5 border-b border-[#20232B] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono">
            Anatomy Inspector
          </h2>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#14161F] text-[#D4AF37] border border-[#2B303C]">
          {selectedAnatomy || 'NONE'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#252933]">
        {/* 1. Selected Organ Details */}
        {anatomy ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#12141C] border border-[#262A38] shadow-md space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">
                    {anatomy.label}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    Category: {anatomy.category}
                  </span>
                </div>
                <button
                  onClick={() => setCameraAction('focus')}
                  title="Focus Camera on Organ"
                  className="p-1.5 rounded-lg bg-[#181B26] border border-[#2A2E3D] text-slate-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                {anatomy.description}
              </p>

              {/* Intensity Slider */}
              <div className="space-y-1.5 pt-2 border-t border-[#1F232D]">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 font-bold">Severity Involvement:</span>
                  <span className="font-bold" style={{ color: tier.hexColor }}>
                    {percentage}% ({tier.label})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => updateInvolvement(anatomy.id, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#1B1E28] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-[#101218] border border-dashed border-[#222530] space-y-2">
            <Layers className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">
              Click any 3D organ mesh to inspect tissue telemetry
            </p>
          </div>
        )}

        {/* 2. Active Involvement Summary */}
        <div className="p-3.5 rounded-xl bg-[#12141C] border border-[#262A38] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
              Affected Organs ({affectedList.length})
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>

          {affectedList.length === 0 ? (
            <p className="text-[11px] text-slate-500 font-mono text-center py-2">
              All organs operating at healthy baseline
            </p>
          ) : (
            <div className="space-y-1.5">
              {affectedList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedAnatomy(item.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-mono transition border ${
                    selectedAnatomy === item.id
                      ? 'bg-[#1A1E2B] border-[#D4AF37] text-slate-100'
                      : 'bg-[#0E1015] border-[#1E212A] text-slate-400 hover:bg-[#151720] hover:text-slate-200'
                  }`}
                >
                  <span className="font-medium truncate">{item.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                      style={{ color: item.tier.hexColor, backgroundColor: `${item.tier.hexColor}15` }}
                    >
                      {item.percentage}%
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. DB Risk Profile (when patient active) */}
        {patientMode === 'active' && dbData?.selected_visit?.module_risks && (
          <div className="p-3.5 rounded-xl bg-[#0F1D1B] border border-[#115E59]/40 space-y-2 text-xs font-mono">
            <div className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-wider flex justify-between">
              <span>DB Biomarker Risk Profile</span>
              <span className="text-slate-400">{dbData.selected_visit.date}</span>
            </div>
            <div className="space-y-2 pt-1">
              {Object.entries(dbData.selected_visit.module_risks).map(([sys, risk]) => {
                const pct = Math.round(risk * 100);
                const label = sys.replace('oncology_', '').replace('_', ' ');
                const color = pct > 60 ? '#EF4444' : pct > 30 ? '#F59E0B' : '#10B981';
                return (
                  <div key={sys} className="space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-300 capitalize">{label}</span>
                      <span className="font-mono font-bold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#182826] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Clinical Profile Summary */}
        <div className="p-3.5 rounded-xl bg-[#12141C] border border-[#262A38] space-y-2 text-xs font-mono">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
            Twin Simulation Status
          </div>
          <div className="space-y-1.5 text-slate-400 text-[11px]">
            <div className="flex justify-between">
              <span>Anatomical Sex:</span>
              <span className="font-bold text-slate-200 capitalize">{patient.sex}</span>
            </div>
            <div className="flex justify-between">
              <span>Age Cohort:</span>
              <span className="font-bold text-slate-200">{patient.ageGroup}</span>
            </div>
            <div className="flex justify-between">
              <span>Condition:</span>
              <span className="font-bold text-[#D4AF37]">{disease?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Sync Mode:</span>
              <span className={`font-bold ${patientMode === 'active' ? 'text-[#2DD4BF]' : 'text-slate-500'}`}>
                {patientMode === 'active' ? '● Live DB Connected' : '○ Standalone Preview'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
