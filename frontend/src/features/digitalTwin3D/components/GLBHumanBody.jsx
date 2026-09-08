import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../store/twinStore';
import { computeVisualizationState } from '../visualization/visualizationEngine';

/**
 * GLBHumanBody
 * Renders the sex-specific full-body skin mesh (skin_male.glb / skin_female.glb).
 * Also renders sex-specific vasculature overlay.
 * Uses translucent glass-skin material so internal organs show through.
 */

// Preload all body + vasculature GLBs at module init
useGLTF.preload('/models/skin_male.glb');
useGLTF.preload('/models/skin_female.glb');
useGLTF.preload('/models/vasculature_male.glb');
useGLTF.preload('/models/vasculature_female.glb');

// ─── Skin Body ─────────────────────────────────────────────────────────────
function SkinMesh({ isFemale }) {
  const modelPath = isFemale ? '/models/skin_female.glb' : '/models/skin_male.glb';
  const { scene } = useGLTF(modelPath);

  const selectedAnatomy = useTwinStore((s) => s.selectedAnatomy);
  const hoveredAnatomy  = useTwinStore((s) => s.hoveredAnatomy);
  const xrayMode        = useTwinStore((s) => s.xrayMode);
  const xrayIntensity   = useTwinStore((s) => s.xrayIntensity);
  const layers          = useTwinStore((s) => s.layers);
  const setSelectedAnatomy = useTwinStore((s) => s.setSelectedAnatomy);
  const setHoveredAnatomy  = useTwinStore((s) => s.setHoveredAnatomy);

  const isSelected = selectedAnatomy === 'SKIN';
  const isHovered  = hoveredAnatomy  === 'SKIN';

  const skinOpacity = xrayMode
    ? Math.max(0.02, 0.10 * (1 - xrayIntensity * 0.8))
    : 0.13;

  const { clonedScene } = useMemo(() => {
    const cloned = scene.clone(true);
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(
        isHovered ? '#60a5fa' : isSelected ? '#38bdf8' : '#94a3b8'
      ),
      transparent: true,
      opacity: skinOpacity,
      roughness: 0.10,
      metalness: 0.05,
      transmission: 0.3,
      thickness: 0.5,
      depthWrite: false,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(isHovered ? '#38bdf8' : isSelected ? '#0ea5e9' : '#000000'),
      emissiveIntensity: isHovered ? 0.20 : isSelected ? 0.12 : 0
    });

    // Auto-center to body origin
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.set(-center.x, 0, -center.z);

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.castShadow = false;
        child.receiveShadow = false;
        child.renderOrder = 10;
      }
    });
    return { clonedScene: cloned };
  }, [scene, skinOpacity, isHovered, isSelected]);

  if (layers.skin === false) return null;

  return (
    <group
      renderOrder={10}
      onClick={(e) => { e.stopPropagation(); setSelectedAnatomy('SKIN'); }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredAnatomy('SKIN');
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (hoveredAnatomy === 'SKIN') setHoveredAnatomy(null);
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

// ─── Vasculature Overlay ───────────────────────────────────────────────────
function VasculatureMesh({ isFemale }) {
  const modelPath = isFemale ? '/models/vasculature_female.glb' : '/models/vasculature_male.glb';
  const { scene } = useGLTF(modelPath);

  const layers          = useTwinStore((s) => s.layers);
  const xrayMode        = useTwinStore((s) => s.xrayMode);
  const xrayIntensity   = useTwinStore((s) => s.xrayIntensity);
  const involvementMap  = useTwinStore((s) => s.involvementMap);
  const patientMode     = useTwinStore((s) => s.patientMode);
  const selectedAnatomy = useTwinStore((s) => s.selectedAnatomy);
  const hoveredAnatomy  = useTwinStore((s) => s.hoveredAnatomy);
  const setSelectedAnatomy = useTwinStore((s) => s.setSelectedAnatomy);
  const setHoveredAnatomy  = useTwinStore((s) => s.setHoveredAnatomy);

  const percentage = involvementMap['VASCULAR_SYSTEM'] || 0;
  const diseaseOverlayActive = layers.diseaseOverlay && percentage > 0 && patientMode !== 'idle';
  const vizState = useMemo(() => computeVisualizationState('VASCULAR_SYSTEM', percentage), [percentage]);

  const vasOpacity = xrayMode
    ? Math.max(0.15, 0.50 * (1 - xrayIntensity * 0.4))
    : diseaseOverlayActive ? 0.72 : 0.40;

  const { clonedScene } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.set(-center.x, 0, -center.z);

    const arterialMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(diseaseOverlayActive ? vizState.hexColor : '#ef4444'),
      roughness: 0.20,
      metalness: 0.05,
      transparent: true,
      opacity: vasOpacity,
      depthWrite: false,
      emissive: new THREE.Color(diseaseOverlayActive ? vizState.emissiveColor : '#000000'),
      emissiveIntensity: diseaseOverlayActive ? vizState.emissiveIntensity * 0.6 : 0
    });

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = arterialMat;
        child.renderOrder = 5;
      }
    });
    return { clonedScene: cloned };
  }, [scene, vasOpacity, diseaseOverlayActive, vizState]);

  if (layers.vessels === false) return null;

  return (
    <group
      onClick={(e) => { e.stopPropagation(); setSelectedAnatomy('VASCULAR_SYSTEM'); }}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredAnatomy('VASCULAR_SYSTEM'); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); if (hoveredAnatomy === 'VASCULAR_SYSTEM') setHoveredAnatomy(null); document.body.style.cursor = 'default'; }}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

// ─── Export ────────────────────────────────────────────────────────────────
export function GLBHumanBody({ isFemale = true }) {
  return (
    <>
      <SkinMesh isFemale={isFemale} />
      <VasculatureMesh isFemale={isFemale} />
    </>
  );
}
