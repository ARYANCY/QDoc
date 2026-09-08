import React, { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTwinStore } from '../store/twinStore';
import { computeVisualizationState } from '../visualization/visualizationEngine';

/**
 * GLBOrgan — Universal reusable GLB organ component.
 *
 * Replaces ALL hand-built primitive geometry from AnatomicalStructures.jsx.
 * Handles: disease overlay coloring, x-ray transparency, hover/select glow,
 * emissive pulse animation, and layer visibility.
 */
export function GLBOrgan({
  organId,
  glbPath,
  position,
  scale,
  rotation = [0, 0, 0],
  layer = 'organs',
  defaultColor = '#94a3b8',
  defaultOpacity = 0.90,
  pulseOnDisease = true,
  selectionOutlineScale = 1.18
}) {
  const groupRef = useRef();

  // Preload happens at the AnatomyModel level via useGLTF.preload
  const { scene } = useGLTF(glbPath);

  const selectedAnatomy = useTwinStore((s) => s.selectedAnatomy);
  const hoveredAnatomy  = useTwinStore((s) => s.hoveredAnatomy);
  const involvementMap  = useTwinStore((s) => s.involvementMap);
  const xrayMode        = useTwinStore((s) => s.xrayMode);
  const xrayIntensity   = useTwinStore((s) => s.xrayIntensity);
  const layers          = useTwinStore((s) => s.layers);
  const patientMode     = useTwinStore((s) => s.patientMode);
  const setSelectedAnatomy = useTwinStore((s) => s.setSelectedAnatomy);
  const setHoveredAnatomy  = useTwinStore((s) => s.setHoveredAnatomy);

  const isSelected = selectedAnatomy === organId;
  const isHovered  = hoveredAnatomy  === organId;
  const percentage = involvementMap[organId] || 0;
  const isLayerVisible = layers[layer] !== false;
  const diseaseOverlayActive = layers.diseaseOverlay && percentage > 0 && patientMode !== 'idle';

  // Visualization state for disease coloring
  const vizState = useMemo(() =>
    computeVisualizationState(organId, percentage),
  [organId, percentage]);

  // Resolve final color
  const baseColor = useMemo(() => {
    if (diseaseOverlayActive) return vizState.hexColor;
    return defaultColor;
  }, [diseaseOverlayActive, vizState.hexColor, defaultColor]);

  // Resolve final opacity
  const finalOpacity = useMemo(() => {
    if (xrayMode) {
      const xrayBase = layer === 'skeleton' ? 0.25 : 0.40;
      return diseaseOverlayActive ? 0.90 : xrayBase * (1 - xrayIntensity * 0.5);
    }
    return defaultOpacity;
  }, [xrayMode, xrayIntensity, layer, diseaseOverlayActive, defaultOpacity]);

  // Build material — preserves original GLB maps (normal, roughness, etc.)
  const { clonedScene, material } = useMemo(() => {
    const cloned = scene.clone(true);
    let origMat = null;
    cloned.traverse((child) => {
      if (child.isMesh && child.material && !origMat) origMat = child.material;
    });

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor),
      map:          origMat?.map          || null,
      normalMap:    origMat?.normalMap    || null,
      roughnessMap: origMat?.roughnessMap || null,
      roughness: layer === 'skeleton' ? 0.25 : 0.38,
      metalness: layer === 'skeleton' ? 0.12 : 0.08,
      transparent: xrayMode || finalOpacity < 1.0,
      opacity: finalOpacity,
      side: THREE.DoubleSide,
      depthWrite: finalOpacity >= 0.5
    });

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return { clonedScene: cloned, material: mat };
  }, [scene, baseColor, finalOpacity, xrayMode, layer]);

  // Emissive animation (per-frame)
  useFrame((state) => {
    if (!material) return;
    const time = state.clock.getElapsedTime();

    if (diseaseOverlayActive && pulseOnDisease) {
      const glow = Math.sin(time * vizState.pulseSpeed) * 0.3 + 0.7;
      material.emissive.set(vizState.emissiveColor);
      material.emissiveIntensity = vizState.emissiveIntensity * glow;
    } else if (isHovered) {
      material.emissive.set('#38bdf8');
      material.emissiveIntensity = 0.40;
    } else if (isSelected) {
      material.emissive.set('#0ea5e9');
      material.emissiveIntensity = 0.28;
    } else {
      material.emissive.set('#000000');
      material.emissiveIntensity = 0;
    }

    // Keep material transparency in sync
    material.opacity = finalOpacity;
    material.transparent = xrayMode || finalOpacity < 1.0;
    material.needsUpdate = true;
  });

  if (!isLayerVisible) return null;

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedAnatomy(organId);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredAnatomy(organId);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (hoveredAnatomy === organId) setHoveredAnatomy(null);
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={clonedScene} />

      {/* Selection outline wireframe */}
      {isSelected && (
        <mesh scale={selectionOutlineScale}>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.45} />
        </mesh>
      )}
    </group>
  );
}
