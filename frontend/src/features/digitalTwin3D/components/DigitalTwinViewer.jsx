import React, { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import AnatomyModel from './AnatomyModel';
import CameraControls from './CameraControls';
import ErrorBoundary from './ErrorBoundary';
import { useTwinStore } from '../store/twinStore';
import {
  RotateCcw,
  Eye,
  Maximize2,
  Minimize2,
  Crosshair
} from 'lucide-react';

export default function DigitalTwinViewer({ canvasRef }) {
  const setCameraAction = useTwinStore((state) => state.setCameraAction);
  const selectedAnatomy = useTwinStore((state) => state.selectedAnatomy);
  const xrayMode = useTwinStore((state) => state.xrayMode);
  const setXrayMode = useTwinStore((state) => state.setXrayMode);
  const xrayIntensity = useTwinStore((state) => state.xrayIntensity);
  const setXrayIntensity = useTwinStore((state) => state.setXrayIntensity);

  const containerRef = useRef();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const patientAnalysis = useTwinStore((state) => state.patientAnalysis);
  const [showAnalysisPopup, setShowAnalysisPopup] = React.useState(true);

  // When new patient analysis arrives, make sure popup is visible
  React.useEffect(() => {
    if (patientAnalysis) {
      setShowAnalysisPopup(true);
    }
  }, [patientAnalysis]);

  return (
    <ErrorBoundary>
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden flex flex-col select-none"
        style={{
          background: 'radial-gradient(circle at 50% 35%, #FFFFFF 0%, #F8F7F4 60%, #ECE8E0 100%)',
        }}
      >
        {/* 3D WebGL Canvas */}
        <Canvas
          ref={canvasRef}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
          camera={{ position: [0, 0.22, 2.3], fov: 45, near: 0.1, far: 50 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <color attach="background" args={['#F9F8F5']} />

          {/* Haute Medical Studio Lighting */}
          <ambientLight intensity={1.35} />
          <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />
          <directionalLight position={[-5, 5, -4]} intensity={0.9} color="#e0f2fe" />
          <directionalLight position={[0, -2, 4]} intensity={0.6} color="#f8fafc" />
          <pointLight position={[0, 0.35, 2.0]} intensity={1.0} color="#ffffff" distance={8} />

          {/* Minimalist Platinum Studio Pedestal Grid */}
          <gridHelper
            args={[5, 16, '#cbd5e1', '#e2e8f0']}
            position={[0, -0.86, 0]}
          />

          <Suspense fallback={null}>
            <AnatomyModel />
          </Suspense>

          <CameraControls />
        </Canvas>

        {/* Top Left HUD: Minimalist Light Camera Pills */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 p-1 rounded-full backdrop-blur-md bg-white/85 border border-slate-200/90 shadow-sm">
          {['front', 'back', 'left', 'right'].map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => setCameraAction(dir)}
              className="px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition"
            >
              {dir}
            </button>
          ))}
          <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />
          <button
            type="button"
            onClick={() => setCameraAction('reset')}
            title="Reset Camera View"
            className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top Right HUD: Focus, Popup Toggle & Fullscreen */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {selectedAnatomy && (
            <button
              type="button"
              onClick={() => setCameraAction('focus')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/85 border border-slate-200/90 text-[11px] font-semibold text-slate-800 hover:bg-white shadow-sm transition"
            >
              <Crosshair className="w-3.5 h-3.5 text-rose-500" />
              <span>Focus {selectedAnatomy}</span>
            </button>
          )}

          {patientAnalysis && !showAnalysisPopup && (
            <button
              type="button"
              onClick={() => setShowAnalysisPopup(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700 hover:bg-rose-100 shadow-sm transition animate-pulse"
            >
              <span>View Analysis</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Twin'}
            className="p-2 rounded-full backdrop-blur-md bg-white/85 border border-slate-200/90 text-slate-700 hover:text-slate-950 hover:bg-white shadow-sm transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom Left HUD: Sleek X-Ray Slider */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/85 border border-slate-200/90 shadow-sm">
          <button
            type="button"
            onClick={() => setXrayMode(!xrayMode)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${
              xrayMode
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>X-Ray</span>
          </button>

          {xrayMode && (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5">
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={xrayIntensity}
                onChange={(e) => setXrayIntensity(parseFloat(e.target.value))}
                className="w-16 accent-slate-900 h-1 bg-slate-200 rounded cursor-pointer"
              />
              <span className="text-[10px] font-mono font-bold text-slate-700">
                {Math.round(xrayIntensity * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* ── FLOATING LUXURY LIGHT-THEME PATIENT ANALYSIS POPUP ── */}
        {patientAnalysis && showAnalysisPopup && (
          <div
            className="absolute bottom-3 right-3 z-20 w-80 max-w-[calc(100%-24px)] rounded-2xl p-4 backdrop-blur-xl bg-white/95 border border-slate-200/90 shadow-2xl transition-all"
            style={{
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header with dismiss button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                  PATIENT: {patientAnalysis.patientId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAnalysisPopup(false)}
                className="text-slate-400 hover:text-slate-700 text-xs px-1.5 py-0.5 rounded transition"
                title="Dismiss Card"
              >
                ✕
              </button>
            </div>

            {/* Disease & Pathology */}
            <div className="mt-2.5">
              <div className="text-[11px] font-medium text-slate-500">
                {patientAnalysis.disease}
              </div>
              <div className="text-[14px] font-bold font-serif text-slate-950 mt-0.5 leading-snug">
                {patientAnalysis.predictedClass}
              </div>
            </div>

            {/* Metric Badges */}
            <div className="flex items-center gap-2 mt-2.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  patientAnalysis.severity === 'danger'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {patientAnalysis.severity === 'danger' ? 'Elevated Anomaly' : 'Baseline Verified'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                {Math.round(patientAnalysis.confidence * 100)}% Confidence
              </span>
            </div>

            {/* Patient Biomarkers from Analysis */}
            {patientAnalysis.topFeatures && patientAnalysis.topFeatures.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <div className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-semibold mb-1.5">
                  ANALYZED BIOMARKER CONTRIBUTIONS
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patientAnalysis.topFeatures.slice(0, 3).map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-medium"
                    >
                      {typeof feat === 'object' ? `${feat.feature || feat.name}: ${feat.value !== undefined ? Number(feat.value).toFixed(2) : feat.importance !== undefined ? (Number(feat.importance) * 100).toFixed(0) + '%' : ''}` : feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Narrative */}
            {patientAnalysis.clinicalNarrative && (
              <p className="mt-2 text-[11px] text-slate-600 line-clamp-3 leading-relaxed border-t border-slate-100 pt-2">
                {patientAnalysis.clinicalNarrative}
              </p>
            )}

            {/* Quantum Telemetry */}
            {patientAnalysis.telemetry && (
              <div className="mt-2 text-[9px] font-mono text-slate-400 flex justify-between items-center border-t border-slate-100 pt-1.5">
                <span>Ansatz: {patientAnalysis.telemetry.qubits}Q • {patientAnalysis.telemetry.entanglement}</span>
                <span>Synced {patientAnalysis.timestamp}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
