// spaceCrafts.js

import * as THREE from 'three';

// STATELESS FILE
// contains functions to create space station and satellite meshes
// and functions to initialize them in the scene
// but does not maintaini state variables.
// Can only access them through parameters.

// Assembly is now done in spaceCraftInit.js
// Here we can design new satellites, etc. and export the functions.

// This defines the axis along which the antenna (or future the solar panels) point with respect to the 
// body frame of the satellite
// currently it's the +Z axis
export const SATELLITE_BODY_AXES = {
  ANTENNA: new THREE.Vector3(0, 0, 1),
  // optional future axes
  // SOLAR_NORMAL: new THREE.Vector3(1, 0, 0),
  // CAMERA: new THREE.Vector3(0, 1, 0),
};



// Exposed assembly functions that return meshes //
export function createISS({ withADCS = true, target = "earth" } = {}) {
  const iss = ISSAssembly();

  if (withADCS) {
    iss.adcs = createADCSState(target);
  }

  iss.bodyAxes = SATELLITE_BODY_AXES;

  return iss;
}


export function createSatellite({ withADCS = true, target = "earth" } = {}) {
  const mesh = satelliteAssembly();
  mesh.bodyAxes = SATELLITE_BODY_AXES;
  if (withADCS) {
    mesh.adcs = createADCSState(target);
  }
  return mesh;
}


/// ADCS State Creation For each satellite or ISS ///
// ADCS state creation ties directly to spacecraft objects
function createADCSState(target = "earth") {
  return {
    target,

    battery: 0.7,
    charging: true,

    attitudeError: 0.05,
    controlEffort: 0.2,

    omega: new THREE.Vector3(
      10 * (Math.random() - 0.5),
      10 * (Math.random() - 0.5),
      10 * (Math.random() - 0.5)
    ),

    powerState: "ACTIVE",
    enabled: true,
    attitudeLocked: false,

    // === single source of truth for messages ===
    _lastPowerState: "ACTIVE",

    errorHistory: [],
    effortHistory: []
  };
}



///// end of ADCS state creation function /////



// Purely geometric meshes and modules for satellites and ISS //
// To create these, you call the functions above which call the assembly
// functions below
///// ISS and satellite module creation functions (NO ASSEMBLY OR STATE) /////
function createModule(length = 1.2, radius = 0.4) {
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, 32),
    new THREE.MeshStandardMaterial({
      color: 0xb8b8b8,
      roughness: 0.6,
      metalness: 0.3
    })
  );

  body.rotation.z = Math.PI / 2;
  return body;
}


function createTruss(length = 6) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(length, 0.015, 0.015),
    new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.7,
      metalness: 0.4
    })
  );
}

function createConnector(length = 0.8) {
  const connector = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, length, 16),
    new THREE.MeshStandardMaterial({
      color: 0x9a9a9a,
      roughness: 0.6,
      metalness: 0.25
    })
  );

  connector.rotation.z = Math.PI / 2; // align along X
  return connector;
}



function createSolarWing() {
  const wing = new THREE.Group();

  const mast = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 2.8, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x666666 })
  );
  wing.add(mast);

  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1e88e5,
    roughness: 0.3,
    metalness: 0.1
  });

  const panelHeight = 0.9;
  const panelGap = 0.08;
  const panelDepth = 1.0;

  const panelGeom = new THREE.BoxGeometry(0.05, panelHeight, panelDepth);

  for (let side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const panel = new THREE.Mesh(panelGeom, panelMat);
      panel.position.y = side * (0.6 + i * (panelHeight + panelGap));
      wing.add(panel);
    }
  }

  return wing;
}

function createAnchor(name, position) {
  const anchor = new THREE.Group();
  anchor.name = name;
  anchor.position.copy(position);
  return anchor;
}

function createDockingPort() {
  const group = new THREE.Group();

  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.1, 32),
    new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.6,
      metalness: 0.4
    })
  );
  ring.rotation.z = Math.PI / 2;
  group.add(ring);

  const hatch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.05, 32),
    new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8
    })
  );
  hatch.position.x = 0.08;
  hatch.rotation.z = Math.PI / 2;
  group.add(hatch);

  return group;
}

function createAntenna() {
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mast.rotation.z = Math.PI / 2;
  return mast;
}

function createSupportStrut(height = 0.35) {
  const strut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, height, 12),
    new THREE.MeshStandardMaterial({
      color: 0x777777,
      roughness: 0.7,
      metalness: 0.35
    })
  );
  return strut;
}

function createRadiatorAssembly() {
  const radiator = new THREE.Group();

  // --- hinge / base ---
  const hinge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16),
    new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.6,
      metalness: 0.4
    })
  );
  hinge.rotation.z = Math.PI / 2;
  radiator.add(hinge);

  // --- support boom ---
  const boom = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.04, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0x777777,
      roughness: 0.7,
      metalness: 0.35
    })
  );
  boom.position.x = 0.35;
  radiator.add(boom);

  // --- radiator panel group ---
  const panelGroup = new THREE.Group();
  panelGroup.position.x = 0.7;
  radiator.add(panelGroup);

  // ribbed radiator surface
  const ribCount = 6;
  const ribHeight = 0.12;
  const ribGap = 0.03;
  const ribDepth = 0.35;

  const ribGeom = new THREE.BoxGeometry(0.01, ribHeight, ribDepth);
  const ribMat = new THREE.MeshStandardMaterial({
    color: 0xf2f2f2,
    roughness: 0.95,
    metalness: 0.05
  });

  for (let i = 0; i < ribCount; i++) {
    const rib = new THREE.Mesh(ribGeom, ribMat);
    rib.position.y =
      (i - (ribCount - 1) / 2) * (ribHeight + ribGap);
    panelGroup.add(rib);
  }

  return radiator;
}


///// end of ISS and satellite module creation function /////




///// ISS ASSEMBLY (NO STATE NEEDED, PURELY GEOMETRIC MESH) /////
function ISSAssembly() {
    const iss = new THREE.Group();

    // backbone
    const truss = createTruss(6);
    iss.add(truss);

    // modules
    const core = createModule(1.6, 0.45);
    iss.add(core);

    const leftModule = createModule();
    leftModule.position.x = -1.8;
    iss.add(leftModule);

    const rightModule = createModule();
    rightModule.position.x = 1.8;
    iss.add(rightModule);


    // center module connectors (left + right)
    const coreConnL = createConnector(0.9);
    coreConnL.position.x = -0.8;
    iss.add(coreConnL);

    const coreConnR = createConnector(0.9);
    coreConnR.position.x = 0.8;
    iss.add(coreConnR);


    // left connector
    const leftConn = createConnector(0.5);
    leftConn.rotation.z = Math.PI / 2;
    leftConn.position.x = -1.2;
    iss.add(leftConn);

    // right connector
    const rightConn = createConnector(0.5);
    rightConn.rotation.z = Math.PI / 2;
    rightConn.position.x = 1.2;
    iss.add(rightConn);


    // solar wings
    const wingLeft = createSolarWing();
    wingLeft.position.x = -3;
    wingLeft.rotation.y = Math.PI / 2;
    iss.add(wingLeft);

    const wingRight = createSolarWing();
    wingRight.position.x = 3;
    wingRight.rotation.y = Math.PI / 2;
    iss.add(wingRight);


    const wingLeft2 = createSolarWing();
    wingLeft2.position.x = -3-1.1;
    wingLeft2.rotation.y = Math.PI / 2;
    iss.add(wingLeft2);

    const wingRight2 = createSolarWing();
    wingRight2.position.x = 3+1.1;
    wingRight2.rotation.y = Math.PI / 2;
    iss.add(wingRight2);

    const wingLeft3 = createSolarWing();
    wingLeft3.position.x = -3-1.1*2;
    wingLeft3.rotation.y = Math.PI / 2;
    iss.add(wingLeft3);

    const wingRight3 = createSolarWing();
    wingRight3.position.x = 3+1.1*2;
    wingRight3.rotation.y = Math.PI / 2;
    iss.add(wingRight3);

      // ===== ANCHORS =====

    // Docking ports on center module
    const dockForward = createAnchor("dock_forward", new THREE.Vector3(0.9, 0, 0));
    const dockAft = createAnchor("dock_aft",     new THREE.Vector3(-0.9, 0, 0));

    iss.add(dockForward);
    iss.add(dockAft);

    // Zenith / nadir ports
    const dockZenith = createAnchor("dock_zenith", new THREE.Vector3(0, 0.6, 0));
    const dockNadir  = createAnchor("dock_nadir",  new THREE.Vector3(0, -0.6, 0));

    iss.add(dockZenith);
    iss.add(dockNadir);

    // Truss attachment points
    // ===== TRUSS ATTACHMENT POINTS =====
    const trussLeft  = createAnchor("truss_left",  new THREE.Vector3(-2.0, 0.6, 0));
    const trussRight = createAnchor("truss_right", new THREE.Vector3( 2.0, 0.6, 0));

    iss.add(trussLeft);
    iss.add(trussRight);

    // ===== LEFT RADIATOR =====
    const radL = createRadiatorAssembly();
    radL.rotation.y = Math.PI / 2;
    radL.position.y = -0.25;          // drop down to meet truss
    trussLeft.add(radL);

    const strutL = createSupportStrut(0.5);
    strutL.position.y = -0.25;
    trussLeft.add(strutL);

    // ===== RIGHT RADIATOR =====
    const radR = createRadiatorAssembly();
    radR.rotation.y = Math.PI / 2;     // SAME orientation
    radR.position.y = -0.25;
    radR.scale.z = -1;                // mirror, don’t rotate
    trussRight.add(radR);

    const strutR = createSupportStrut(0.5);
    strutR.position.y = -0.25;
    trussRight.add(strutR);


    // ===== HARDWARE ATTACHMENT =====

    dockForward.add(createDockingPort());
    dockAft.add(createDockingPort());

    dockZenith.add(createDockingPort());
    dockNadir.add(createDockingPort());

    dockZenith.add(createAntenna());

  return iss;
}

// Satellite mesh creation
function satelliteAssembly() {
  const sat = new THREE.Group();

  // Cylindrical bus
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24),
    new THREE.MeshStandardMaterial({
      color: 0xb0b0b0,
      roughness: 0.6,
      metalness: 0.35
    })
  );
  body.rotation.z = Math.PI / 2;
  sat.add(body);

  // Solar panels
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1e88e5,
    roughness: 0.3,
    metalness: 0.1
  });

  const panelGeom = new THREE.BoxGeometry(0.015, 0.22, 0.9);

  const leftPanel = new THREE.Mesh(panelGeom, panelMat);
  leftPanel.position.x = -0.32;
  sat.add(leftPanel);

  const rightPanel = leftPanel.clone();
  rightPanel.position.x = 0.32;
  sat.add(rightPanel);

  // Antenna
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.25, 8),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  antenna.position.z = 0.25;
  antenna.rotation.x = Math.PI / 2;
  antenna.name = "antenna";
  sat.add(antenna);
  

  return sat;
}

///////////// END OF ISS ASSEMBLY FUNCTION (NO STATE) //////////////

