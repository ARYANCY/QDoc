import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import AnatomyModel from './AnatomyModel';
import CameraControls from './CameraControls';
import ErrorBoundary from './ErrorBoundary';
import { useTwinStore } from '../store/twinStore';
import {
  RotateCcw, Eye, Maximize2, Minimize2,
  Crosshair, Loader2, AlertTriangle, UserCheck, Dna,
  Layers, Sparkles
} from 'lucide-react';

export default function DigitalTwinViewer({ canvasRef }) {
  const setCameraAction    = useTwinStore((s) => s.setCameraAction);
  const selectedAnatomy    = useTwinStore((s) => s.selectedAnatomy);
  const xrayMode           = useTwinStore((s) => s.xrayMode);
  const setXrayMode        = useTwinStore((s) => s.setXrayMode);
  const xrayIntensity      = useTwinStore((s) => s.xrayIntensity);
  const setXrayIntensity   = useTwinStore((s) => s.setXrayIntensity);
  const patientMode        = useTwinStore((s) => s.patientMode);
  const patient            = useTwinStore((s) => s.patient);
  const patientError       = useTwinStore((s) => s.patientError);
  const clearPatient       = useTwinStore((s) => s.clearPatient);
  const dbData             = useTwinStore((s) => s.dbData);

  const containerRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const cameraPresets = ['Front', 'Back', 'Left', 'Right', 'Top'];

  return (
    <ErrorBoundary>
      <div ref={containerRef} className="relative w-full h-full bg-[#07080A] overflow-hidden flex flex-col select-none">

        {/* 3D WebGL Canvas */}
        <Canvas
          ref={canvasRef}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0.38, 2.35], fov: 44, near: 0.05, far: 60 }}
          shadows
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <color attach="background" args={['#07080A']} />

          {/* Cinematic Haute Studio Lighting */}
          <ambientLight intensity={0.95} />
          <directionalLight position={[5, 8, 5]}  intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
          <directionalLight position={[-5, 6, -4]} intensity={0.8} color="#D4AF37" />
          <directionalLight position={[0, -2, 4]}  intensity={0.4} color="#0F766E" />
          <pointLight position={[0, 0.4, 2.2]} intensity={1.0} color="#ffffff" distance={7} />
          <hemisphereLight skyColor="#1A1C24" groundColor="#060708" intensity={0.6} />

          {/* Holographic Floor Grid */}
          <gridHelper
            args={[6, 24, '#D4AF3730', '#20243040']}
            position={[0, -0.90, 0]}
          />

          <Suspense fallback={null}>
            <AnatomyModel />
          </Suspense>
          <CameraControls />
        </Canvas>

        {/* ── TOP UNIFIED TOOLBAR: Non-overlapping responsive HUD ─────────── */}
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none gap-2">
          {/* Left: Compact Camera Presets */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0C0E14]/90 border border-[#232734] backdrop-blur-md shadow-xl pointer-events-auto">
            {cameraPresets.map((label) => (
              <button
                key={label}
                onClick={() => setCameraAction(label.toLowerCase())}
                className="px-2 py-0.5 text-[9px] font-mono font-bold rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider"
                title={`View from ${label}`}
              >
                {label}
              </button>
            ))}
            <div className="w-px h-3 bg-[#252935] mx-0.5" />
            <button
              onClick={() => setCameraAction('reset')}
              title="Reset 3D Camera"
              className="p-1 rounded text-slate-400 hover:text-[#38BDF8] hover:bg-white/10 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Right: X-Ray & Fullscreen */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setXrayMode(!xrayMode)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0C0E14]/90 border text-[9px] font-mono font-bold backdrop-blur-md transition shadow-xl ${
                xrayMode ? 'border-[#0F766E] text-[#2DD4BF]' : 'border-[#232734] text-slate-400 hover:text-white'
              }`}
              title="Toggle Anatomical X-Ray Transparency"
            >
              <Eye className={`w-3 h-3 ${xrayMode ? 'text-[#2DD4BF]' : 'text-slate-500'}`} />
              <span className="uppercase tracking-wider">X-Ray {xrayMode ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-[#0C0E14]/90 border border-[#232734] text-slate-400 hover:text-white hover:border-[#383E50] backdrop-blur-md transition shadow-xl"
              title="Toggle Fullscreen 3D Studio"
            >
              {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* ── BOTTOM LEFT: Organ Selection HUD ──────────────────────────────── */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          {selectedAnatomy ? (
            <div className="p-3 rounded-xl bg-[#0C0E14]/90 border border-[#252935] backdrop-blur-md shadow-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
                <Crosshair className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Selected Organ</div>
                <div className="text-xs font-mono font-bold text-slate-100">{selectedAnatomy}</div>
              </div>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-[#0C0E14]/70 border border-[#20232E] backdrop-blur-sm text-[10px] font-mono text-slate-500">
              Hover / click organ mesh to inspect
            </div>
          )}
        </div>

        {/* ── BOTTOM RIGHT: System Tag ──────────────────────────────────────── */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-[#0C0E14]/70 border border-[#20232E] backdrop-blur-sm flex items-center gap-2 text-[9px] font-mono text-slate-400">
            <span className="text-[#D4AF37] font-bold">25 GLB</span>
            <span className="text-slate-600">|</span>
            <span>WebGL PBR</span>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
