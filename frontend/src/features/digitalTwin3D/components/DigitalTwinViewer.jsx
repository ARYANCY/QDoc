import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import AnatomyModel from './AnatomyModel';
import CameraControls from './CameraControls';
import ErrorBoundary from './ErrorBoundary';
import { useTwinStore } from '../store/twinStore';
import {
  RotateCcw, Eye, Maximize2, Minimize2,
  Crosshair, Layers
} from 'lucide-react';

export default function DigitalTwinViewer({ canvasRef, compact = false }) {
  const setCameraAction    = useTwinStore((s) => s.setCameraAction);
  const selectedAnatomy    = useTwinStore((s) => s.selectedAnatomy);
  const xrayMode           = useTwinStore((s) => s.xrayMode);
  const setXrayMode        = useTwinStore((s) => s.setXrayMode);

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

  const cameraPresets = compact ? ['Front', 'Top'] : ['Front', 'Back', 'Left', 'Right', 'Top'];

  return (
    <ErrorBoundary>
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', userSelect: 'none' }}>

        {/* 3D WebGL Canvas */}
        <Canvas
          ref={canvasRef}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0.38, 2.35], fov: compact ? 48 : 44, near: 0.05, far: 60 }}
          shadows
          style={{ width: '100%', height: '100%', cursor: 'grab' }}
        >
          <color attach="background" args={['#07080B']} />

          {/* Cinematic Studio Lighting */}
          <ambientLight intensity={0.95} />
          <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
          <directionalLight position={[-5, 6, -4]} intensity={0.8} color="#D4AF37" />
          <directionalLight position={[0, -2, 4]} intensity={0.4} color="#0F766E" />
          <pointLight position={[0, 0.4, 2.2]} intensity={1.0} color="#ffffff" distance={7} />
          <hemisphereLight skyColor="#1A1C24" groundColor="#060708" intensity={0.6} />

          {/* Holographic Floor Grid */}
          <gridHelper
            args={[6, 24, '#D4AF37', '#202430']}
            position={[0, -0.90, 0]}
          />

          <Suspense fallback={null}>
            <AnatomyModel />
          </Suspense>
          <CameraControls />
        </Canvas>

        {/* ── Floating Top HUD Toolbar ── */}
        <div className={`dt-floating-hud-top ${compact ? 'compact' : ''}`}>
          {/* Left: Camera Orientation Presets */}
          <div className="dt-hud-group">
            {cameraPresets.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setCameraAction(label.toLowerCase())}
                className="dt-hud-btn"
                title={`View from ${label}`}
              >
                {label}
              </button>
            ))}
            <div style={{ width: '1px', height: '14px', background: 'var(--dt-border-default)', margin: '0 2px' }} />
            <button
              type="button"
              onClick={() => setCameraAction('reset')}
              title="Reset 3D Camera"
              className="dt-hud-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Right: X-Ray & Fullscreen */}
          <div className="dt-hud-group">
            <button
              type="button"
              onClick={() => setXrayMode(!xrayMode)}
              className={`dt-hud-btn ${xrayMode ? 'active' : ''}`}
              title="Toggle Anatomical X-Ray Tissue Transparency"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Eye size={12} color={xrayMode ? 'var(--dt-teal-glow)' : 'var(--dt-text-muted)'} />
              <span>{compact ? (xrayMode ? 'X-Ray' : 'Solid') : `X-Ray ${xrayMode ? 'ON' : 'OFF'}`}</span>
            </button>

            {!compact && (
              <>
                <div style={{ width: '1px', height: '14px', background: 'var(--dt-border-default)', margin: '0 2px' }} />
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="dt-hud-btn"
                  title="Toggle Fullscreen 3D View"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Floating Bottom-Left: Organ Selection HUD ── */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 15, pointerEvents: 'none' }}>
          {selectedAnatomy ? (
            <div className="dt-hud-organ-badge" style={{ pointerEvents: 'auto' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid var(--dt-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Crosshair size={16} color="var(--dt-gold)" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.58rem', color: 'var(--dt-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Selected Organ
                </div>
                <div style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {selectedAnatomy}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(14, 16, 23, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--dt-border-default)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontFamily: 'var(--dt-font-mono)',
                fontSize: '0.64rem',
                color: 'var(--dt-text-muted)',
              }}
            >
              Hover / click organ mesh to inspect telemetry
            </div>
          )}
        </div>

        {/* ── Floating Bottom-Right: Engine Tag ── */}
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 15, pointerEvents: 'none' }}>
          <div
            style={{
              background: 'rgba(14, 16, 23, 0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--dt-border-default)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontFamily: 'var(--dt-font-mono)',
              fontSize: '0.60rem',
              color: 'var(--dt-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ color: 'var(--dt-gold)', fontWeight: 800 }}>25 3D MESHES</span>
            <span>|</span>
            <span>WebGL 2.0 PBR</span>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

