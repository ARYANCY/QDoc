import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTwinStore } from '../store/twinStore';
import { computeVisualizationState } from '../visualization/visualizationEngine';

/**
 * Shared Hook for dynamic organ material & disease overlay calculation
 */
function useOrganMaterial(id, defaultColor, defaultOpacity = 0.9, layer = 'organs') {
  const selectedAnatomy = useTwinStore((state) => state.selectedAnatomy);
  const hoveredAnatomy = useTwinStore((state) => state.hoveredAnatomy);
  const involvementMap = useTwinStore((state) => state.involvementMap);
  const xrayMode = useTwinStore((state) => state.xrayMode);
  const layers = useTwinStore((state) => state.layers);

  const isSelected = selectedAnatomy === id;
  const isHovered = hoveredAnatomy === id;
  const percentage = involvementMap[id] || 0;

  const vizState = useMemo(() => {
    return computeVisualizationState(id, percentage);
  }, [id, percentage]);

  const baseColor = useMemo(() => {
    if (percentage > 0 && layers.diseaseOverlay) {
      return vizState.hexColor;
    }
    return defaultColor;
  }, [percentage, layers.diseaseOverlay, vizState.hexColor, defaultColor]);

  const finalOpacity = useMemo(() => {
    if (xrayMode) {
      if (layer === 'skeleton') return 0.3;
      return percentage > 0 ? 0.95 : 0.45;
    }
    return defaultOpacity;
  }, [xrayMode, layer, percentage, defaultOpacity]);

  return {
    isSelected,
    isHovered,
    percentage,
    vizState,
    baseColor,
    finalOpacity,
    xrayMode,
    isLayerVisible: layers[layer] !== false,
    diseaseOverlayActive: layers.diseaseOverlay && percentage > 0
  };
}

// ------------------------------------------------------------------
// 1. REALISTIC HEPATIC LIVER
// ------------------------------------------------------------------
export function LiverStructure({ position = [-0.06, 0.28, 0.02] }) {
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const setHoveredAnatomy = useTwinStore((state) => state.setHoveredAnatomy);

  const { isSelected, isHovered, vizState, baseColor, finalOpacity, xrayMode, isLayerVisible, diseaseOverlayActive } =
    useOrganMaterial('LIVER', '#854d0e', 0.9, 'organs');

  if (!isLayerVisible) return null;

  return (
    <group
      position={position}
      scale={[0.18, 0.13, 0.16]}
      rotation={[0.1, 0.0, -0.1]}
      onClick={(e) => { e.stopPropagation(); setSelectedAnatomy('LIVER'); }}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredAnatomy('LIVER'); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHoveredAnatomy(null); document.body.style.cursor = 'default'; }}
    >
      {/* Right Massive Hepatic Lobe */}
      <mesh position={[-0.08, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.34, 32, 24]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.35}
          emissive={diseaseOverlayActive ? vizState.emissiveColor : isHovered ? '#38bdf8' : '#000'}
          emissiveIntensity={diseaseOverlayActive ? vizState.emissiveIntensity : isHovered ? 0.4 : 0}
          transparent={xrayMode}
          opacity={finalOpacity}
        />
      </mesh>

      {/* Left Hepatic Tapering Lobe */}
      <mesh position={[0.22, 0.05, 0.02]} scale={[1.1, 0.65, 0.7]} castShadow receiveShadow>
        <sphereGeometry args={[0.24, 24, 20]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.35}
          emissive={diseaseOverlayActive ? vizState.emissiveColor : isHovered ? '#38bdf8' : '#000'}
          emissiveIntensity={diseaseOverlayActive ? vizState.emissiveIntensity : isHovered ? 0.4 : 0}
          transparent={xrayMode}
          opacity={finalOpacity}
        />
      </mesh>

      {/* Gallbladder Nestled Underneath */}
      <mesh position={[-0.05, -0.18, 0.12]} rotation={[0.4, 0, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#15803d" roughness={0.3} />
      </mesh>

      {/* Selection Wireframe */}
      {isSelected && (
        <mesh scale={1.18}>
          <sphereGeometry args={[0.38, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ------------------------------------------------------------------
// 2. REALISTIC PANCREAS
// ------------------------------------------------------------------
export function PancreasStructure({ position = [0.01, 0.25, 0.00] }) {
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const setHoveredAnatomy = useTwinStore((state) => state.setHoveredAnatomy);

  const { isSelected, isHovered, vizState, baseColor, finalOpacity, xrayMode, isLayerVisible, diseaseOverlayActive } =
    useOrganMaterial('PANCREAS', '#eab308', 0.9, 'organs');

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.25, -0.05, -0.02),
      new THREE.Vector3(-0.1, 0.04, 0.03),
      new THREE.Vector3(0.08, 0.02, 0.04),
      new THREE.Vector3(0.25, -0.03, 0.01)
    ]);
  }, []);

  if (!isLayerVisible) return null;

  return (
    <group
      position={position}
      scale={[0.18, 0.18, 0.18]}
      onClick={(e) => { e.stopPropagation(); setSelectedAnatomy('PANCREAS'); }}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredAnatomy('PANCREAS'); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHoveredAnatomy(null); document.body.style.cursor = 'default'; }}
    >
      {/* Pancreatic Head, Body & Tail */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[curve, 32, 0.065, 16, false]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.4}
          emissive={diseaseOverlayActive ? vizState.emissiveColor : isHovered ? '#38bdf8' : '#000'}
          emissiveIntensity={diseaseOverlayActive ? vizState.emissiveIntensity : isHovered ? 0.4 : 0}
          transparent={xrayMode}
          opacity={finalOpacity}
        />
      </mesh>

      {isSelected && (
        <mesh scale={1.2}>
          <tubeGeometry args={[curve, 16, 0.08, 12, false]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ------------------------------------------------------------------
// 3. REALISTIC RENAL KIDNEYS (Left & Right)
// ------------------------------------------------------------------
export function KidneyStructure({ id = 'KIDNEY_LEFT', position }) {
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const setHoveredAnatomy = useTwinStore((state) => state.setHoveredAnatomy);

  const { isSelected, isHovered, vizState, baseColor, finalOpacity, xrayMode, isLayerVisible, diseaseOverlayActive } =
    useOrganMaterial(id, '#7e22ce', 0.9, 'organs');

  if (!isLayerVisible) return null;

  return (
    <group
      position={position}
      scale={[0.17, 0.17, 0.17]}
      onClick={(e) => { e.stopPropagation(); setSelectedAnatomy(id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredAnatomy(id); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHoveredAnatomy(null); document.body.style.cursor = 'default'; }}
    >
      {/* Kidney Reniform Body */}
      <mesh castShadow receiveShadow scale={[0.7, 1.15, 0.8]}>
        <sphereGeometry args={[0.19, 28, 22]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.35}
          emissive={diseaseOverlayActive ? vizState.emissiveColor : isHovered ? '#38bdf8' : '#000'}
          emissiveIntensity={diseaseOverlayActive ? vizState.emissiveIntensity : isHovered ? 0.4 : 0}
          transparent={xrayMode}
          opacity={finalOpacity}
        />
      </mesh>

      {/* Adrenal Gland (Suprarenal Cap) */}
      <mesh position={[0, 0.2, 0]} scale={[0.8, 0.4, 0.6]}>
        <coneGeometry args={[0.08, 0.12, 16]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.4} />
      </mesh>

      {/* Ureter Tube descending towards bladder */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.45, 12]} />
        <meshStandardMaterial color="#e2e8f0" opacity={0.7} transparent />
      </mesh>

      {isSelected && (
        <mesh scale={1.2}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ------------------------------------------------------------------
// 4. REALISTIC MAMMARY BREAST TISSUE (Left & Right)
// ------------------------------------------------------------------
export function BreastStructure({ id = 'BREAST_LEFT', isLeft = true, position, isFemale = true }) {
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const setHoveredAnatomy = useTwinStore((state) => state.setHoveredAnatomy);

  const { isSelected, isHovered, vizState, baseColor, finalOpacity, xrayMode, isLayerVisible, diseaseOverlayActive } =
    useOrganMaterial(id, '#f472b6', 0.8, 'organs');

  if (!isLayerVisible) return null;

  const scaleFactor = isFemale ? [0.20, 0.20, 0.16] : [0.12, 0.12, 0.08];

  return (
    <group
      position={position}
      scale={scaleFactor}
      rotation={[Math.PI * 0.5, 0, 0]}
      onClick={(e) => { e.stopPropagation(); setSelectedAnatomy(id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredAnatomy(id); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHoveredAnatomy(null); document.body.style.cursor = 'default'; }}
    >
      {/* Mammary Parenchymal Hemisphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.23, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.35}
          emissive={diseaseOverlayActive ? vizState.emissiveColor : isHovered ? '#38bdf8' : '#000'}
          emissiveIntensity={diseaseOverlayActive ? vizState.emissiveIntensity : isHovered ? 0.4 : 0}
          transparent={xrayMode}
          opacity={finalOpacity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Areola & Nipple Apex */}
      {isFemale && (
        <mesh position={[0, 0, 0.22]}>
          <circleGeometry args={[0.045, 24]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.5} />
        </mesh>
      )}

      {isSelected && (
        <mesh scale={1.12}>
          <sphereGeometry args={[0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ------------------------------------------------------------------
// 5. REALISTIC BRAIN (Inside Cranial Skull Vault)
// ------------------------------------------------------------------
export function BrainStructure({ position = [0.00, 0.72, -0.015] }) {
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const setHoveredAnatomy = useTwinStore((state) => state.setHoveredAnatomy);

  const { isSelected, isHovered, vizState, baseColor, finalOpacity, xrayMode, isLayerVisible, diseaseOverlayActive } =
    useOrganMaterial('BRAIN', '#e5989b', 0.92, 'organs');

  if (!isLayerVisible) return null;

  return (
    <group
      position={position}
      scale={[0.22, 0.22, 0.22]}
      onClick={(e) => { e.stopPropagation(); setSelectedAnatomy('BRAIN'); }}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredAnatomy('BRAIN'); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHoveredAnatomy(null); document.body.style.cursor = 'default'; }}
    >
      {/* Left Hemisphere */}
      <mesh position={[0.11, 0, 0]} scale={[0.75, 0.95, 1.15]} castShadow receiveShadow>
        <sphereGeometry args={[0.24, 28, 22]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.45}
          emissive={diseaseOverlayActive ? vizState.emissiveColor : isHovered ? '#38bdf8' : '#000'}
          emissiveIntensity={diseaseOverlayActive ? vizState.emissiveIntensity : isHovered ? 0.4 : 0}
          transparent={xrayMode}
          opacity={finalOpacity}
        />
      </mesh>

      {/* Right Hemisphere */}
      <mesh position={[-0.11, 0, 0]} scale={[0.75, 0.95, 1.15]} castShadow receiveShadow>
        <sphereGeometry args={[0.24, 28, 22]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.45}
          emissive={diseaseOverlayActive ? vizState.emissiveColor : isHovered ? '#38bdf8' : '#000'}
          emissiveIntensity={diseaseOverlayActive ? vizState.emissiveIntensity : isHovered ? 0.4 : 0}
          transparent={xrayMode}
          opacity={finalOpacity}
        />
      </mesh>

      {/* Cerebellum */}
      <mesh position={[0, -0.16, -0.1]} scale={[1.2, 0.7, 0.8]}>
        <sphereGeometry args={[0.14, 20, 18]} />
        <meshStandardMaterial color="#d4a373" roughness={0.5} />
      </mesh>

      {/* Brainstem */}
      <mesh position={[0, -0.28, -0.04]}>
        <cylinderGeometry args={[0.045, 0.055, 0.22, 16]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.5} />
      </mesh>

      {isSelected && (
        <mesh scale={1.2}>
          <sphereGeometry args={[0.34, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ------------------------------------------------------------------
// 6. REALISTIC SKELETON (Thoracic Ribcage, Spine, Sternum, Pelvis)
// ------------------------------------------------------------------
export function SkeletonStructure() {
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const setHoveredAnatomy = useTwinStore((state) => state.setHoveredAnatomy);

  const { finalOpacity, xrayMode, isLayerVisible } =
    useOrganMaterial('SKELETON', '#eae6df', 0.35, 'skeleton');

  if (!isLayerVisible) return null;

  return (
    <group
      onClick={(e) => { e.stopPropagation(); setSelectedAnatomy('SKELETON'); }}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredAnatomy('SKELETON'); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHoveredAnatomy(null); document.body.style.cursor = 'default'; }}
    >
      {/* 7 Rib Pairs in Thoracic Cage surrounding lungs/heart */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const y = 0.28 + i * 0.040;
        const radius = 0.15 - Math.abs(i - 3) * 0.009;
        return (
          <mesh key={i} position={[0, y, -0.01]} rotation={[Math.PI * 0.5, Math.PI * 0.15, 0]} scale={[1.02, 0.72, 1.0]}>
            <torusGeometry args={[radius, 0.0065, 12, 32, Math.PI * 1.65]} />
            <meshStandardMaterial color="#eae6df" roughness={0.3} metalness={0.1} transparent opacity={finalOpacity} wireframe={xrayMode} />
          </mesh>
        );
      })}

      {/* Sternum (Chest Plate) */}
      <mesh position={[0, 0.40, 0.08]}>
        <boxGeometry args={[0.020, 0.18, 0.01]} />
        <meshStandardMaterial color="#eae6df" roughness={0.3} transparent opacity={finalOpacity} />
      </mesh>

      {/* Spinal Column */}
      <mesh position={[0, 0.38, -0.05]}>
        <cylinderGeometry args={[0.012, 0.015, 0.75, 16]} />
        <meshStandardMaterial color="#eae6df" roughness={0.3} transparent opacity={finalOpacity} />
      </mesh>

      {/* Pelvic Girdle */}
      <mesh position={[0, 0.06, -0.05]} rotation={[Math.PI * 0.45, 0, 0]} scale={[1.05, 0.7, 1.0]}>
        <torusGeometry args={[0.13, 0.016, 12, 32]} />
        <meshStandardMaterial color="#eae6df" roughness={0.3} transparent opacity={finalOpacity} />
      </mesh>
    </group>
  );
}

// ------------------------------------------------------------------
// 7. VASCULAR NETWORK (Systemic Aorta & Vena Cava)
// ------------------------------------------------------------------
export function VascularStructure() {
  const setSelectedAnatomy = useTwinStore((state) => state.setSelectedAnatomy);
  const setHoveredAnatomy = useTwinStore((state) => state.setHoveredAnatomy);

  const { finalOpacity, isLayerVisible } =
    useOrganMaterial('VASCULAR_SYSTEM', '#ef4444', 0.75, 'vessels');

  const aortaCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 0.45, 0.02),
      new THREE.Vector3(-0.01, 0.50, 0.00),
      new THREE.Vector3(0.01, 0.48, -0.03),
      new THREE.Vector3(0.01, 0.28, -0.04),
      new THREE.Vector3(-0.03, 0.18, -0.04)
    ]);
  }, []);

  const venaCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.51, 0.00),
      new THREE.Vector3(0.02, 0.42, 0.02),
      new THREE.Vector3(0.02, 0.28, -0.03),
      new THREE.Vector3(0.03, 0.18, -0.04)
    ]);
  }, []);

  if (!isLayerVisible) return null;

  return (
    <group
      onClick={(e) => { e.stopPropagation(); setSelectedAnatomy('VASCULAR_SYSTEM'); }}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredAnatomy('VASCULAR_SYSTEM'); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHoveredAnatomy(null); document.body.style.cursor = 'default'; }}
    >
      {/* Systemic Arterial Aorta */}
      <mesh>
        <tubeGeometry args={[aortaCurve, 40, 0.008, 12, false]} />
        <meshStandardMaterial color="#ef4444" roughness={0.25} transparent opacity={finalOpacity} />
      </mesh>

      {/* Systemic Vena Cava */}
      <mesh>
        <tubeGeometry args={[venaCurve, 40, 0.008, 12, false]} />
        <meshStandardMaterial color="#0284c7" roughness={0.25} transparent opacity={finalOpacity} />
      </mesh>
    </group>
  );
}
