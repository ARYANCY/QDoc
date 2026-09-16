import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../store/twinStore';

const normalizeBodyScene = (source) => {
  const cloned = source.clone(true);
  const box = new THREE.Box3().setFromObject(cloned);
  const center = box.getCenter(new THREE.Vector3());
  cloned.position.set(-center.x, 0, -center.z);
  return cloned;
};

useGLTF.preload('/models/skin_male.glb');
useGLTF.preload('/models/skin_female.glb');
useGLTF.preload('/models/vasculature_male.glb');
useGLTF.preload('/models/vasculature_female.glb');

function SkinMesh({ isFemale }) {
  const modelPath = isFemale ? '/models/skin_female.glb' : '/models/skin_male.glb';
  const { scene } = useGLTF(modelPath);

  const selectedAnatomy = useTwinStore((s) => s.selectedAnatomy);
  const hoveredAnatomy = useTwinStore((s) => s.hoveredAnatomy);
  const xrayMode = useTwinStore((s) => s.xrayMode);
  const xrayIntensity = useTwinStore((s) => s.xrayIntensity);
  const layers = useTwinStore((s) => s.layers);
  const setSelectedAnatomy = useTwinStore((s) => s.setSelectedAnatomy);
  const setHoveredAnatomy = useTwinStore((s) => s.setHoveredAnatomy);

  const isSelected = selectedAnatomy === 'SKIN';
  const isHovered = hoveredAnatomy === 'SKIN';
  const skinOpacity = xrayMode ? Math.max(0.06, 0.10 * (1 - xrayIntensity * 0.7)) : 0.18;

  const { clonedScene } = useMemo(() => {
    const cloned = normalizeBodyScene(scene);
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(isHovered ? '#60a5fa' : isSelected ? '#38bdf8' : '#a5b4cf'),
      transparent: true,
      opacity: skinOpacity,
      roughness: 0.14,
      metalness: 0.05,
      transmission: 0.7,
      thickness: 0.35,
      ior: 1.3,
      depthWrite: false,
      side: THREE.FrontSide,
      emissive: new THREE.Color(isHovered ? '#38bdf8' : isSelected ? '#0ea5e9' : '#000000'),
      emissiveIntensity: isHovered ? 0.18 : isSelected ? 0.11 : 0,
      clearcoat: 0.4,
      clearcoatRoughness: 0.5
    });

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

function VasculatureMesh({ isFemale }) {
  const modelPath = isFemale ? '/models/vasculature_female.glb' : '/models/vasculature_male.glb';
  const { scene } = useGLTF(modelPath);

  const selectedAnatomy = useTwinStore((s) => s.selectedAnatomy);
  const hoveredAnatomy = useTwinStore((s) => s.hoveredAnatomy);
  const xrayMode = useTwinStore((s) => s.xrayMode);
  const layers = useTwinStore((s) => s.layers);
  const setSelectedAnatomy = useTwinStore((s) => s.setSelectedAnatomy);
  const setHoveredAnatomy = useTwinStore((s) => s.setHoveredAnatomy);

  const isSelected = selectedAnatomy === 'VASCULAR_SYSTEM';
  const isHovered = hoveredAnatomy === 'VASCULAR_SYSTEM';

  const { clonedScene } = useMemo(() => {
    const cloned = normalizeBodyScene(scene);
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(isHovered ? '#38bdf8' : isSelected ? '#0ea5e9' : '#e11d48'),
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: xrayMode ? 0.4 : 0.72,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(isHovered ? '#38bdf8' : isSelected ? '#0ea5e9' : '#450a0a'),
      emissiveIntensity: isHovered ? 0.38 : isSelected ? 0.22 : 0.12,
      clearcoat: 0.3,
      clearcoatRoughness: 0.5
    });

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

export function GLBHumanBody({ isFemale = false }) {
  return (
    <group>
      <SkinMesh isFemale={isFemale} />
      <VasculatureMesh isFemale={isFemale} />
    </group>
  );
}
