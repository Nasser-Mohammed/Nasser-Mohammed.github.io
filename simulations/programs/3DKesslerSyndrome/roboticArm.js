import * as THREE from "three";

export function createRoboticArm() {

  const arm = new THREE.Group();
  arm.name = "roboticArm";

  // ----------------------------
  // Materials
  // ----------------------------
  const linkMat = new THREE.MeshStandardMaterial({
    color: 0xb0b4bb,
    metalness: 0.6,
    roughness: 0.35
  });

  const jointMat = new THREE.MeshStandardMaterial({
    color: 0x202225,
    metalness: 0.9,
    roughness: 0.25
  });

  const eeMat = new THREE.MeshStandardMaterial({
    color: 0x33ff99,
    emissive: 0x113322,
    emissiveIntensity: 0.6
  });

  // ----------------------------
  // Base joint (yaw)
  // ----------------------------
  const baseYaw = new THREE.Group();
  arm.add(baseYaw);

  const baseJoint = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.3, 16),
    jointMat
  );
  baseJoint.rotation.x = Math.PI / 2;
  baseYaw.add(baseJoint);

  // ----------------------------
  // Link 1
  // ----------------------------
  const link1Length = 8.2
  const link1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, link1Length, 12),
    linkMat
  );
  link1.rotation.x = Math.PI / 2;
  link1.position.z = link1Length / 2;
  baseYaw.add(link1);

  // ----------------------------
  // Elbow joint (pitch)
  // ----------------------------
  const elbowPitch = new THREE.Group();
  elbowPitch.position.z = link1Length;
  baseYaw.add(elbowPitch);

  const elbowJoint = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 14, 14),
    jointMat
  );
  elbowPitch.add(elbowJoint);

  // ----------------------------
  // Link 2
  // ----------------------------
  const link2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 2.6, 12),
    linkMat
  );
  link2.rotation.x = Math.PI / 2;
  link2.position.z = 1.3;
  elbowPitch.add(link2);

  // ----------------------------
  // Wrist joint (pitch)
  // ----------------------------
  const wristPitch = new THREE.Group();
  wristPitch.position.z = 2.6;
  elbowPitch.add(wristPitch);

  const wristJoint = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    jointMat
  );
  wristPitch.add(wristJoint);

  // ----------------------------
  // End effector
  // ----------------------------
  const endEffector = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 16, 16),
    eeMat
  );
  endEffector.position.z = 0.6;
  wristPitch.add(endEffector);

  // ----------------------------
  // Expose references
  // ----------------------------
  arm.userData = {
    baseYaw,
    elbowPitch,
    wristPitch,
    endEffector,

    joints: {
      baseYaw:  { min: -Math.PI,     max:  Math.PI },
      elbow:    { min: -Math.PI * 0.5, max:  Math.PI * 0.7 },
      wrist:    { min: -Math.PI * 0.6, max:  Math.PI * 0.6 }
    }
  };

  return arm;
}
