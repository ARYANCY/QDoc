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
  Check
} from 'lucide-react';

export default function TopNavbar() {
  const layers = useTwinStore((state) => state.layers);
  const toggleLayer = useTwinStore((state) => state.toggleLayer);
  const setReportOpen = useTwinStore((state) => state.setReportOpen);
  const setComparisonOpen = useTwinStore((state) => state.setComparisonOpen);
  const setTimelineOpen = useTwinStore((state) => state.setTimelineOpen);

  const [layersMenuOpen, setLayersMenuOpen] = useState(false);

  const layerItems = [
    { key: 'skin', label: 'Skin Surface Layer' },
    { key: 'skeleton', label: 'Skeletal Framework' },
    { key: 'organs', label: 'Internal Organs' },
    { key: 'vessels', label: 'Vascular Network' },
    { key: 'diseaseOverlay', label: 'Disease Overlays' },
    { key: 'labels', label: '3D Anatomy Labels' }
  ];

  return (
    <header className="h-14 bg-surface border-b border-slate-800 px-4 flex items-center justify-between z-30">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-100 tracking-tight">
              3D Digital Twin Anatomy
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              PROD-V1
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Clinical Disease Visualization Platform
          </p>
        </div>
      </div>

      {/* Action Buttons & Modals */}
      <div className="flex items-center gap-2.5">
        {/* Layer Visibility Menu */}
        <div className="relative">
          <button
            onClick={() => setLayersMenuOpen(!layersMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-secondary border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 transition shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Anatomy Layers</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {layersMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-surface border border-slate-700 p-2 shadow-2xl z-50 animate-fade-in">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Visibility Toggles
              </div>
              <div className="space-y-1 mt-1">
                {layerItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleLayer(item.key)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition"
                  >
                    <span>{item.label}</span>
                    {layers[item.key] ? (
                      <span className="w-4 h-4 rounded bg-sky-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-black stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded border border-slate-600"></span>
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-secondary border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 transition shadow-sm"
        >
          <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
          <span>Twin Comparison</span>
        </button>

        {/* Timeline Progression Mode */}
        <button
          onClick={() => setTimelineOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-secondary border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 transition shadow-sm"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Timeline</span>
        </button>

        {/* Export Report Action */}
        <button
          onClick={() => setReportOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 transition active:scale-95"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
}
