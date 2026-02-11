

// shipAssembly.js
import * as THREE from "three";
import { createRoboticArm } from "./roboticArm.js";


export function createPlayerShip() {
  const shipFrame = new THREE.Group();
  shipFrame.name = "playerShip";

  // ----------------------------
  // Materials
  // ----------------------------
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xe8e8e8,
    metalness: 0.55,
    roughness: 0.35,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x202225,
    metalness: 0.9,
    roughness: 0.25,
  });

  // Tuned cockpit glass (less glitter, stable)
  const glassMatBase = new THREE.MeshPhysicalMaterial({
    color: 0x66d9ff,
    transparent: true,
    opacity: 0.12,
    transmission: 1.0,
    ior: 1.45,
    thickness: 0.2,
    roughness: 0.18,
    metalness: 0.0,
    clearcoat: 0.7,
    clearcoatRoughness: 0.25,
    attenuationColor: new THREE.Color(0x66d9ff),
    attenuationDistance: 6.0,
    depthWrite: false,
    depthTest: true,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x33e6ff,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });

  // ----------------------------
  // 1) Hull (open-ended so cockpit opening is real)
  // ----------------------------
  const hullTubeGeom = new THREE.CylinderGeometry(3.5, 3.5, 12, 24, 1, true); // openEnded = true
  const hullTube = new THREE.Mesh(hullTubeGeom, hullMat);
  hullTube.rotation.x = Math.PI / 2;
  shipFrame.add(hullTube);

    const interiorMat = new THREE.MeshStandardMaterial({
    color: 0x14181e,
    metalness: 0.1,
    roughness: 0.9,
    side: THREE.BackSide, // only show the inside faces
    });

    const innerLinerGeom = new THREE.CylinderGeometry(3.45, 3.45, 11.95, 24, 1, true);
    const innerLiner = new THREE.Mesh(innerLinerGeom, interiorMat);
    innerLiner.rotation.x = Math.PI / 2;
    shipFrame.add(innerLiner);


  // Rear cap only (keep the back sealed)
    const capMat = new THREE.MeshStandardMaterial({
    color: 0xe8e8e8,
    metalness: 0.55,
    roughness: 0.35,
    side: THREE.DoubleSide, // show both sides for the cap
  });
  const rearCapGeom = new THREE.CircleGeometry(3.5, 24);
  const rearCap = new THREE.Mesh(rearCapGeom, capMat);
  rearCap.position.z = -6.0;
  //rearCap.rotation.y = Math.PI; // face toward -Z
  shipFrame.add(rearCap);

  // ----------------------------
  // 2) Cockpit assembly (glass dome + outer ring only)
  // ----------------------------
  const cockpitGroup = new THREE.Group();
  cockpitGroup.position.set(0, 0, 6.0);
  shipFrame.add(cockpitGroup);

  // Canopy base ring (simple, no internal posts)
  const canopyRing = new THREE.Mesh(new THREE.TorusGeometry(3.35, .15, 10, 40), trimMat);
  canopyRing.position.z = 0.05;
  cockpitGroup.add(canopyRing);

  // Glass dome geometry (hemisphere)
  const domeGeom = new THREE.SphereGeometry(
    3.35,
    28,
    18,
    0, Math.PI * 2,
    0, Math.PI / 2
  );

  // Two-shell canopy avoids inside-glass artifacts
  const glassOuterMat = glassMatBase.clone();
  glassOuterMat.side = THREE.FrontSide;
  glassOuterMat.polygonOffset = true;
  glassOuterMat.polygonOffsetFactor = -1;
  glassOuterMat.polygonOffsetUnits = -1;

  const domeOuter = new THREE.Mesh(domeGeom, glassOuterMat);
  domeOuter.position.z = 0.75;
  domeOuter.renderOrder = 10;
  cockpitGroup.add(domeOuter);

  const glassInnerMat = glassMatBase.clone();
  glassInnerMat.side = THREE.BackSide;
  glassInnerMat.polygonOffset = true;
  glassInnerMat.polygonOffsetFactor = -2;
  glassInnerMat.polygonOffsetUnits = -2;

  const domeInnerGeom = domeGeom.clone();
  domeInnerGeom.scale(0.997, 0.997, 0.997); // tiny shrink to prevent z-fighting

  const domeInner = new THREE.Mesh(domeInnerGeom, glassInnerMat);
  domeInner.position.z = 0.75;
  domeInner.renderOrder = 11;
  cockpitGroup.add(domeInner);

  // ----------------------------
  // 3) Camera mount (inside cockpit looking forward)
  // ----------------------------
  const cameraMount = new THREE.Object3D();
  cameraMount.position.set(0, 0.2, 2); // inside hull looking out
  cameraMount.rotation.y = Math.PI;       // camera looks down -Z, ship forward is +Z. Since camera default forward is -Z
  shipFrame.add(cameraMount);
  shipFrame.userData.cameraMount = cameraMount;

  // ----------------------------
  // 4) Wings + side hardpoints
  // ----------------------------
  const wingGeom = new THREE.BoxGeometry(6.4, 0.18, 3.2);
  const wingL = new THREE.Mesh(wingGeom, hullMat);
  wingL.position.set(3.9, -0.35, -1.6);
  shipFrame.add(wingL);

  const wingR = wingL.clone();
  wingR.position.x *= -1;
  shipFrame.add(wingR);

  // Wing struts
  const strut2Geom = new THREE.BoxGeometry(0.25, 0.25, 2.4);
  const makeStrut = (x) => {
    const s = new THREE.Mesh(strut2Geom, trimMat);
    s.position.set(x, -0.2, -0.7);
    s.rotation.x = 0.35;
    return s;
  };
  shipFrame.add(makeStrut(2.2));
  shipFrame.add(makeStrut(-2.2));

  // ----------------------------
  // 5) Thrusters (nozzles + inner glow)
  // ----------------------------
  function createThruster(x, y) {
    const g = new THREE.Group();

    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.65, 1.7, 16), trimMat);
    nozzle.rotation.x = Math.PI / 2;
    g.add(nozzle);

    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 0.6, 16), glowMat);
    inner.rotation.x = Math.PI / 2;
    inner.position.z = -0.45;
    g.add(inner);

    const flare = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), glowMat);
    flare.scale.z = 2.2;
    flare.position.z = -1.2;
    g.add(flare);

    g.position.set(x, y, -6.55);
    return g;
  }

  shipFrame.add(createThruster(1.15, 1.15));
  shipFrame.add(createThruster(-1.15, 1.15));
  shipFrame.add(createThruster(1.15, -1.15));
  shipFrame.add(createThruster(-1.15, -1.15));

  // ----------------------------
  // 6) Robot arm mount placeholder (bottom-front)
  // ----------------------------
  const armMount = new THREE.Object3D();
  armMount.name = "armMount";
  armMount.position.set(0, -3, 4.4);
  shipFrame.add(armMount);
  shipFrame.userData.armMount = armMount;

  // A visible mounting plate so you know where it attaches
  const mountPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.18, 18), trimMat);
  mountPlate.rotation.x = Math.PI / 2;
  mountPlate.position.copy(armMount.position);
  shipFrame.add(mountPlate);

  // ----------------------------
  // 7) Nav lights
  // ----------------------------
  const navL = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xff3344 })
  );
  navL.position.set(2.7, 0.2, 2.0);
  shipFrame.add(navL);

  const navR = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0x33ff66 })
  );
  navR.position.set(-2.7, 0.2, 2.0);
  shipFrame.add(navR);


  // ----------------------------
  // Robotic arm attachment
  // ----------------------------
  const arm = createRoboticArm();
  arm.position.set(0, -3.0, 4.4); // same as armMount
  shipFrame.add(arm);

  shipFrame.userData.roboticArm = arm;


  return shipFrame;
}
