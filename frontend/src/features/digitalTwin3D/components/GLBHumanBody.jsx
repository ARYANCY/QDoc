import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../store/twinStore';

// Preload the GLB assets
useGLTF.preload('/models/female.glb');
useGLTF.preload('/models/male.glb');

export function GLBHumanBody({ isFemale = true, isPediatric = false }) {
  const modelPath = isFemale ? '/models/female.glb' : '/models/male.glb';
  const { scene } = useGLTF(modelPath);

  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const setHoveredAnatomy = useTwinStore((state) => state.setHoveredAnatomy);
  const layers = useTwinStore((state) => state.layers);
  const xrayMode = useTwinStore((state) => state.xrayMode);
  const xrayIntensity = useTwinStore((state) => state.xrayIntensity);
  const selectedAnatomy = useTwinStore((state) => state.selectedAnatomy);
  const hoveredAnatomy = useTwinStore((state) => state.hoveredAnatomy);

  const isSelected = selectedAnatomy === 'SKIN';
  const isHovered = hoveredAnatomy === 'SKIN';

  // Compute translucent frosted-crystal / medical glass material for light theme
  const skinOpacity = xrayMode ? Math.max(0.03, 0.16 * (1 - xrayIntensity)) : 0.18;

  const skinMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(isHovered ? '#0284c7' : isSelected ? '#0369a1' : '#64748b'),
      transparent: true,
      opacity: skinOpacity,
      roughness: 0.22,
      metalness: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(isHovered ? '#0284c7' : isSelected ? '#0369a1' : '#cbd5e1'),
      emissiveIntensity: isHovered ? 0.35 : isSelected ? 0.22 : 0.04,
    });
  }, [skinOpacity, isHovered, isSelected]);

  // Clone scene and auto-center to [0, 0, 0]
  const { clonedScene, offset } = useMemo(() => {
    const cloned = scene.clone(true);
    
    // Apply skin material to all meshes
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = skinMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());

    return {
      clonedScene: cloned,
      offset: [-center.x, 0, -center.z]
    };
  }, [scene, skinMaterial]);

  if (layers.skin === false) return null;

  return (
    <group
      position={offset}
      renderOrder={10}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedAnatomy('SKIN');
      }}
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
