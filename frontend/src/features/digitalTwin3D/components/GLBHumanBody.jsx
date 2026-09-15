import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../store/twinStore';
import { computeVisualizationState } from '../visualization/visualizationEngine';

/**
 * GLBHumanBody
 * Renders the sex-specific full-body skin mesh (skin_male.glb / skin_female.glb).
 * Also renders sex-specific vasculature overlay.
 * Uses high-clarity translucent glass-skin material so internal organs show through clearly.
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
    ? Math.max(0.02, 0.08 * (1 - xrayIntensity * 0.8))
    : 0.16;

  const { clonedScene } = useMemo(() => {
    const cloned = scene.clone(true);
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(
        isHovered ? '#60a5fa' : isSelected ? '#38bdf8' : '#94a3b8'
      ),
      transparent: true,
      opacity: skinOpacity,
      roughness: 0.12,
      metalness: 0.04,
      transmission: 0.75,
      thickness: 0.4,
      ior: 1.33,
      depthWrite: false,
      side: THREE.FrontSide,
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

  const selectedAnatomy = useTwinStore((s) => s.selectedAnatomy);
  const hoveredAnatomy  = useTwinStore((s) => s.hoveredAnatomy);
  const xrayMode        = useTwinStore((s) => s.xrayMode);
  const layers          = useTwinStore((s) => s.layers);
  const setSelectedAnatomy = useTwinStore((s) => s.setSelectedAnatomy);
  const setHoveredAnatomy  = useTwinStore((s) => s.setHoveredAnatomy);

  const isSelected = selectedAnatomy === 'VASCULAR_SYSTEM';
  const isHovered  = hoveredAnatomy  === 'VASCULAR_SYSTEM';

  const { clonedScene } = useMemo(() => {
    const cloned = scene.clone(true);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(isHovered ? '#38bdf8' : isSelected ? '#0ea5e9' : '#e11d48'),
      roughness: 0.35,
      metalness: 0.15,
      transparent: true,
      opacity: xrayMode ? 0.35 : 0.70,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(isHovered ? '#38bdf8' : isSelected ? '#0ea5e9' : '#450a0a'),
      emissiveIntensity: isHovered ? 0.40 : isSelected ? 0.25 : 0.1
    });

    // Auto-center to match body
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.set(-center.x, 0, -center.z);

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return { clonedScene: cloned };
  }, [scene, xrayMode, isHovered, isSelected]);

  if (layers.vessels === false) return null;

  return (
    <group
      onClick={(e) => { e.stopPropagation(); setSelectedAnatomy('VASCULAR_SYSTEM'); }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredAnatomy('VASCULAR_SYSTEM');
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (hoveredAnatomy === 'VASCULAR_SYSTEM') setHoveredAnatomy(null);
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────
export function GLBHumanBody({ isFemale = false }) {
  return (
    <group>
      <SkinMesh isFemale={isFemale} />
      <VasculatureMesh isFemale={isFemale} />
    </group>
  );
}
