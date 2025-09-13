import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function Eye({ radius = 1 }) {
  const group = useRef();
  const irisGroup = useRef();
  const forward = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const tmpDir = useMemo(() => new THREE.Vector3(), []);
  const targetQuat = useMemo(() => new THREE.Quaternion(), []);
  const eyeQuat = useMemo(() => new THREE.Quaternion(), []);

  const scleraMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.0,
  }), []);

  const irisMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x2a77ff,
    roughness: 0.4,
    metalness: 0.0,
  }), []);

  const pupilMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.6,
    metalness: 0.0,
  }), []);

  const corneaMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.25,
    roughness: 0.0,
    transmission: 1.0,
    thickness: 0.2,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  }), []);

  useFrame((state, dt) => {
    const { x, y } = state.pointer;

    tmpDir.set(x, -y, 0.5).unproject(state.camera).sub(state.camera.position).normalize();

    targetQuat.setFromUnitVectors(forward, tmpDir);

    if (group.current) {
      eyeQuat.copy(group.current.quaternion).slerp(targetQuat, Math.min(1, dt * 4));
      group.current.quaternion.copy(eyeQuat);
    }

    if (irisGroup.current) {
      const irisDepth = radius * 0.995;
      const maxAngularOffset = 0.45;

      const inv = new THREE.Matrix4();
      if (group.current) inv.copy(group.current.matrixWorld).invert();
      const localDir = tmpDir.clone().applyMatrix4(inv).normalize();

      const angle = Math.acos(THREE.MathUtils.clamp(localDir.dot(forward), -1, 1));
      if (angle > maxAngularOffset) {
        const axis = new THREE.Vector3().crossVectors(forward, localDir).normalize();
        const constrained = forward.clone().applyAxisAngle(axis, maxAngularOffset).normalize();
        localDir.copy(constrained);
      }

      const irisPos = localDir.clone().multiplyScalar(irisDepth);
      irisGroup.current.position.copy(irisPos);

      const lookAt = localDir.clone().multiplyScalar(radius * 2);
      irisGroup.current.lookAt(lookAt);

      const offCenter = 1 - THREE.MathUtils.clamp(localDir.dot(forward), 0, 1);
      const pupilScale = THREE.MathUtils.lerp(1.0, 0.7, offCenter);
      irisGroup.current.children.forEach((child) => {
        if (child.name === "pupil") child.scale.setScalar(pupilScale);
      });
    }
  });

  return (
    <group ref={group}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <primitive object={scleraMat} attach="material" />
      </mesh>

      <mesh position={[0, 0, radius * 0.15]}>
        <sphereGeometry args={[radius * 0.9, 64, 64]} />
        <primitive object={corneaMat} attach="material" />
      </mesh>

      <group ref={irisGroup}>
        <mesh>
          <circleGeometry args={[radius * 0.35, 48]} />
          <primitive object={irisMat} attach="material" />
        </mesh>
        <mesh name="pupil" position={[0, 0, 0.001]}>
          <circleGeometry args={[radius * 0.15, 48]} />
          <primitive object={pupilMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

export default Eye;
