import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useTwinStore } from '../store/twinStore';

export default function LesionMarker() {
  const meshRef = useRef();
  const selectedDisease = useTwinStore((state) => state.selectedDisease);
  const selectedAnatomy = useTwinStore((state) => state.selectedAnatomy);
  const hoveredAnatomy = useTwinStore((state) => state.hoveredAnatomy);
  const diseaseParams = useTwinStore((state) => state.diseaseParams);
  const layers = useTwinStore((state) => state.layers);

  const breastParams = diseaseParams?.BREAST_CANCER;
  const isVisible = selectedDisease === 'BREAST_CANCER' && !!breastParams?.lesionEnabled && layers.diseaseOverlay !== false;

  const lesionX = breastParams?.lesionX ?? 0.09;
  const lesionY = breastParams?.lesionY ?? 0.40;
  const lesionZ = breastParams?.lesionZ ?? 0.10;
  const lesionRadius = breastParams?.lesionRadius ?? 0.035;
  const leftPercentage = breastParams?.leftPercentage ?? 0;

  // useFrame is ALWAYS called unconditionally on every render
  useFrame((state) => {
    if (!meshRef.current || !isVisible) return;
    const time = state.clock.getElapsedTime();
    const pulse = Math.sin(time * 3) * 0.15 + 1;
    meshRef.current.scale.set(pulse, pulse, pulse);
  });

  if (!isVisible) return null;

  return (
    <group position={[lesionX, lesionY, lesionZ]}>
      {/* 3D Lesion core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[lesionRadius, 24, 24]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={1.2}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Outer radiation halo */}
      <mesh>
        <sphereGeometry args={[lesionRadius * 1.5, 16, 16]} />
        <meshBasicMaterial
          color="#f43f5e"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Floating 3D annotation on hover / selection */}
      {layers.labels && (selectedAnatomy === 'BREAST_LEFT' || hoveredAnatomy === 'BREAST_LEFT') && (
        <Html distanceFactor={4.5} position={[0, lesionRadius + 0.05, 0]}>
          <div className="bg-rose-950/90 border border-rose-500 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-rose-200 whitespace-nowrap shadow-lg flex items-center gap-1 font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            Biopsy Lesion Focal Point: {leftPercentage}%
          </div>
        </Html>
      )}
    </group>
  );
}
