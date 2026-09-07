import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../store/twinStore';
import { ANATOMY_REGISTRY } from '../data/anatomyRegistry';

export default function CameraControls() {
  const controlsRef = useRef();
  const { camera } = useThree();
  
  const cameraAction = useTwinStore((state) => state.cameraAction);
  const selectedAnatomy = useTwinStore((state) => state.selectedAnatomy);

  const targetCamPos = useRef(new THREE.Vector3(0, 0.42, 2.3));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.38, 0));
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (!controlsRef.current) return;
    const { preset } = cameraAction;

    if (preset === 'front') {
      targetCamPos.current.set(0, 0.42, 2.3);
      targetLookAt.current.set(0, 0.38, 0);
      isTransitioning.current = true;
    } else if (preset === 'back') {
      targetCamPos.current.set(0, 0.42, -2.3);
      targetLookAt.current.set(0, 0.38, 0);
      isTransitioning.current = true;
    } else if (preset === 'left') {
      targetCamPos.current.set(-2.3, 0.42, 0);
      targetLookAt.current.set(0, 0.38, 0);
      isTransitioning.current = true;
    } else if (preset === 'right') {
      targetCamPos.current.set(2.3, 0.42, 0);
      targetLookAt.current.set(0, 0.38, 0);
      isTransitioning.current = true;
    } else if (preset === 'top') {
      targetCamPos.current.set(0, 3.0, 0.2);
      targetLookAt.current.set(0, 0.38, 0);
      isTransitioning.current = true;
    } else if (preset === 'reset') {
      targetCamPos.current.set(0, 0.42, 2.3);
      targetLookAt.current.set(0, 0.38, 0);
      isTransitioning.current = true;
    } else if (preset === 'focus' && selectedAnatomy) {
      const anatomy = ANATOMY_REGISTRY[selectedAnatomy];
      if (anatomy && anatomy.position) {
        const [x, y, z] = anatomy.position;
        targetLookAt.current.set(x, y, z);
        targetCamPos.current.set(x * 1.5, y + 0.05, z + 0.9);
        isTransitioning.current = true;
      }
    }
  }, [cameraAction, selectedAnatomy]);

  useFrame(() => {
    if (!isTransitioning.current || !controlsRef.current) return;

    camera.position.lerp(targetCamPos.current, 0.08);
    controlsRef.current.target.lerp(targetLookAt.current, 0.08);
    controlsRef.current.update();

    if (
      camera.position.distanceTo(targetCamPos.current) < 0.02 &&
      controlsRef.current.target.distanceTo(targetLookAt.current) < 0.02
    ) {
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={0.5}
      maxDistance={6.0}
      maxPolarAngle={Math.PI - 0.1}
      minPolarAngle={0.1}
      target={[0, 0.38, 0]}
    />
  );
}
