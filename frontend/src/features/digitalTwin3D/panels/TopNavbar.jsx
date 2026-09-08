import React, { useState } from 'react';
import { useTwinStore } from '../store/twinStore';
import {
  Activity,
  Layers,
  FileText,
  GitCompare,
  Clock,
  Sparkles,
  ChevronDown,
  Check,
  Dna
} from 'lucide-react';

export default function TopNavbar() {
  const layers = useTwinStore((state) => state.layers);
  const toggleLayer = useTwinStore((state) => state.toggleLayer);
  const setReportOpen = useTwinStore((state) => state.setReportOpen);
  const setComparisonOpen = useTwinStore((state) => state.setComparisonOpen);
  const setTimelineOpen = useTwinStore((state) => state.setTimelineOpen);
  const patient = useTwinStore((state) => state.patient);
  const patientMode = useTwinStore((state) => state.patientMode);

  const [layersMenuOpen, setLayersMenuOpen] = useState(false);

  const layerItems = [
    { key: 'skin',          label: 'Skin Surface Envelope' },
    { key: 'skeleton',      label: 'Skeletal / Spinal Framework' },
    { key: 'organs',        label: 'Primary Organ Systems' },
    { key: 'vessels',       label: 'Arterial & Venous Vasculature' },
    { key: 'airway',        label: 'Airway (Trachea / Bronchi / Larynx)' },
    { key: 'digestive',     label: 'Digestive Tract (Colon / Small Int.)' },
    { key: 'urinary',       label: 'Urinary Tract (Kidneys / Ureters / Bladder)' },
    { key: 'diseaseOverlay',label: 'Quantum Disease Overlays' },
    { key: 'labels',        label: '3D Spatial Anatomy Labels' },
  ];

  return (
    <header className="h-13 bg-[#090A0D] border-b border-[#20232B] px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#181A20] to-[#0F1014] border border-[#2D313B] flex items-center justify-center shadow-lg">
          <Dna className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-black tracking-wider uppercase text-slate-100 font-display">
              3D Physiological Digital Twin
            </h1>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#181A20] text-[#D4AF37] border border-[#D4AF37]/30 tracking-wider">
              25 GLB ANATOMY
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            {patientMode === 'active'
              ? `Synchronized with Patient ${patient.patientId || 'PT-89421'}`
              : 'Interactive 3D Biomechanical & Organ Telemetry Engine'}
          </p>
        </div>
      </div>

      {/* Action Buttons & Modals */}
      <div className="flex items-center gap-2">
        {/* Layer Visibility Menu */}
        <div className="relative">
          <button
            onClick={() => setLayersMenuOpen(!layersMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12141A] border border-[#252933] text-xs font-semibold text-slate-300 hover:text-white hover:border-[#3A3F4E] transition shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-mono text-[11px]">Layers</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {layersMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0F1117] border border-[#2B303C] p-2 shadow-2xl z-50 animate-fade-in backdrop-blur-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 border-b border-[#20232B] font-mono">
                Anatomical Layers (9)
              </div>
              <div className="space-y-1 mt-1.5">
                {layerItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleLayer(item.key)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-[#1A1D26] hover:text-white transition"
                  >
                    <span className="text-[11px] font-medium truncate pr-2">{item.label}</span>
                    {layers[item.key] ? (
                      <span className="w-4 h-4 rounded bg-[#0F766E] border border-[#14B8A6]/40 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded border border-slate-700 shrink-0"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comparison Mode */}
        <button
          onClick={() => setComparisonOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12141A] border border-[#252933] text-xs font-semibold text-slate-300 hover:text-white hover:border-[#3A3F4E] transition shadow-sm"
        >
          <GitCompare className="w-3.5 h-3.5 text-violet-400" />
          <span className="font-mono text-[11px]">Compare</span>
        </button>

        {/* Timeline Progression Mode */}
        <button
          onClick={() => setTimelineOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12141A] border border-[#252933] text-xs font-semibold text-slate-300 hover:text-white hover:border-[#3A3F4E] transition shadow-sm"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[11px]">Timeline</span>
        </button>

        {/* Export Report Action */}
        <button
          onClick={() => setReportOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-110 text-black text-xs font-bold shadow-lg shadow-[#D4AF37]/20 transition active:scale-95"
        >
          <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="font-mono text-[11px] tracking-wider uppercase">Export Report</span>
        </button>
      </div>
    </header>
  );
}
