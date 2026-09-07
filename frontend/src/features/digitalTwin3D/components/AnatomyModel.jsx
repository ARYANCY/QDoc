import React, { Suspense } from 'react';
import { useTwinStore } from '../store/twinStore';
import { GLBHumanBody } from './GLBHumanBody';
import { GLBHeart } from './GLBHeart';
import { GLBLungs } from './GLBLungs';
import {
  LiverStructure,
  PancreasStructure,
  KidneyStructure,
  BreastStructure,
  BrainStructure,
  SkeletonStructure,
  VascularStructure
} from './AnatomicalStructures';
import LesionMarker from './LesionMarker';
import AnatomyLabel from './AnatomyLabel';
import { ANATOMY_REGISTRY } from '../data/anatomyRegistry';

export default function AnatomyModel() {
  const patient = useTwinStore((state) => state.patient);

  const isFemale = patient.sex === 'female';
  const isPediatric = patient.ageGroup === '<18';
  const modelScale = isPediatric ? [0.88, 0.88, 0.88] : [1, 1, 1];

  return (
    <group scale={modelScale} position={[0, 0, 0]}>
      {/* 1. REALISTIC 3D GLB HUMAN BODY (MALE / FEMALE) */}
      <Suspense fallback={null}>
        <GLBHumanBody isFemale={isFemale} isPediatric={isPediatric} />
      </Suspense>

      {/* 2. SKELETAL FRAMEWORK */}
      <SkeletonStructure />

      {/* 3. VASCULAR NETWORK */}
      <VascularStructure />

      {/* 4. BRAIN (Inside Cranial Vault) */}
      <BrainStructure position={ANATOMY_REGISTRY.BRAIN.position} />

      {/* 5. 3D GLB HEART (High-Resolution Anatomic Geometry) */}
      <Suspense fallback={null}>
        <GLBHeart position={ANATOMY_REGISTRY.HEART.position} />
      </Suspense>

      {/* 6. 3D GLB PULMONARY LUNGS (High-Resolution Bilateral Geometry) */}
      <Suspense fallback={null}>
        <GLBLungs position={[0.0, 0.44, 0.0]} />
      </Suspense>

      {/* 7. LIVER */}
      <LiverStructure position={ANATOMY_REGISTRY.LIVER.position} />

      {/* 8. PANCREAS */}
      <PancreasStructure position={ANATOMY_REGISTRY.PANCREAS.position} />

      {/* 9. RENAL KIDNEYS (Left & Right) */}
      <KidneyStructure id="KIDNEY_LEFT" position={ANATOMY_REGISTRY.KIDNEY_LEFT.position} />
      <KidneyStructure id="KIDNEY_RIGHT" position={ANATOMY_REGISTRY.KIDNEY_RIGHT.position} />

      {/* 10. MAMMARY BREAST TISSUE */}
      <BreastStructure id="BREAST_LEFT" isLeft={true} position={ANATOMY_REGISTRY.BREAST_LEFT.position} isFemale={isFemale} />
      <BreastStructure id="BREAST_RIGHT" isLeft={false} position={ANATOMY_REGISTRY.BREAST_RIGHT.position} isFemale={isFemale} />

      {/* 11. 3D LESION MARKER */}
      <LesionMarker />

      {/* 12. FLOATING ANATOMICAL ANNOTATIONS */}
      <AnatomyLabel anatomyId="BRAIN" />
      <AnatomyLabel anatomyId="HEART" />
      <AnatomyLabel anatomyId="LUNG_LEFT" />
      <AnatomyLabel anatomyId="LUNG_RIGHT" />
      <AnatomyLabel anatomyId="LIVER" />
      <AnatomyLabel anatomyId="PANCREAS" />
      <AnatomyLabel anatomyId="KIDNEY_LEFT" />
      <AnatomyLabel anatomyId="KIDNEY_RIGHT" />
      <AnatomyLabel anatomyId="BREAST_LEFT" />
      <AnatomyLabel anatomyId="BREAST_RIGHT" />
    </group>
  );
}
