// spaceCrafts.js

import * as THREE from 'three';

// STATELESS FILE
// contains functions to create space station and satellite meshes
// and functions to initialize them in the scene
// but does not maintaini state variables.
// Can only access them through parameters.

// Now we assemble it here as well, and return the mesh.
// In main.js we can have a simple function to add these to the 
// appropriate scene or parent object. 



/// ADCS State Creation For each satellite or ISS ///
function createADCSState(target = "earth") {
  return {
    target,
    battery: 0.7,
    charging: true,
    attitudeError: 0.05,
    controlEffort: 0.2,
    omega: new THREE.Vector3(
      0.02 * (Math.random() - 0.5),
      0.02 * (Math.random() - 0.5),
      0.02 * (Math.random() - 0.5)
    ),
    errorHistory: [],
    effortHistory: []
  };
}
///// end of ADCS state creation function /////



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
function createISS() {
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
function createSatelliteMesh() {
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
  sat.add(antenna);
  

  return sat;
}

///////////// END OF ISS ASSEMBLY FUNCTION (NO STATE) //////////////


// GEO satellite spawning (no phase update)
function spawnGEOSatellite({ parent, longitude, name }, objectMap, satellites, ISS_SCALE, GEO_ORBIT_RADIUS) {
  const sat = createSatelliteMesh();
  const SAT_SCALE_GEO = 4;
  sat.scale.setScalar(SAT_SCALE_GEO*ISS_SCALE);

  // Place in equatorial plane
  sat.position.set(
    GEO_ORBIT_RADIUS * Math.cos(longitude),
    0,
    GEO_ORBIT_RADIUS * Math.sin(longitude)
  );

  parent.add(sat);

  // Register for camera tracking
  objectMap.set(name, [sat, new THREE.Vector3(3, 3, 3)]);

  satellites.push({
    mesh: sat,
    geo: true, // flag: no phase update
    name,
    adcs: createADCSState("earth")
  });
}



// This is not an update function, just initial spawning
function spawnSatelliteOnOrbit({
  parent,
  radius,
  phase,
  speed,
  inclination = 0,
  name
}, objectMap, satellites, ISS_SCALE) {

    if (ISS_SCALE == null) {
        throw new Error("ISS_SCALE is undefined");
    }

    const mesh = createSatelliteMesh();
    mesh.name = name;
    const SAT_SCALE_LEO = 3;
    mesh.scale.setScalar(SAT_SCALE_LEO*ISS_SCALE);

    // orbit plane group (important for inclination)
    const orbitFrame = new THREE.Group();
    orbitFrame.rotation.z = inclination;

    parent.add(orbitFrame);
    orbitFrame.add(mesh);

    // initial placement
    mesh.position.set(
        radius * Math.cos(phase),
        0,
        radius * Math.sin(phase)
    );
    const pick = Math.random();
    let target;
    if(pick < 0.2){
        target = "moon";
    }
    else if (pick < 0.5){
        target = "sun";
    }
    else{
        target = "earth";
    }

    satellites.push({
        mesh,
        orbitFrame,
        radius,
        phase,
        speed,
        name,
        adcs: createADCSState(target)
    });

    objectMap.set(name, [mesh, new THREE.Vector3(0.5, 0.5, 0.5)]);

}

///////////// ISS AND SATELLITE INITIALIZATION FUNCTIONS (STATE AND CONSTANTS NEEDED) //////////////
//////////// EXPOSED FUNCTION TO main.js ////////////

export function initSpaceStation(ISS_SCALE, issCameraOffset, objectMap, earth) // Needs two inputs now
{
  let iss = createISS();
  iss.adcs = createADCSState("sun");

  // setISSOnOrbit(); // position handled in main.js now

  iss.scale.setScalar(ISS_SCALE);
  iss.rotation.y = Math.PI / 4;

  earth.add(iss);
  objectMap.set("iss", [iss, issCameraOffset]);
  return iss;
}

export function initSatellites(earth, earthRadius, INCLINED_SAT_COUNT, EQUATORIAL_SAT_COUNT, GEO_SAT_COUNT, GEO_ORBIT_RADIUS, issPhase, objectMap, satellites, ISS_SCALE, MIN_SEP) {
  // const earthRadius = 8;
  const planetSelect = document.getElementById("planetView");


  // ----- Equatorial ring -----
  for (let i = 0; i < EQUATORIAL_SAT_COUNT; i++) {
    const name = `sat_eq_${i+1}`;

    spawnSatelliteOnOrbit({
        parent: earth,
        radius: earthRadius + 3,
        phase: (i / EQUATORIAL_SAT_COUNT) * Math.PI * 2,
        speed: 0.2,
        inclination: 0,
        name
    }, objectMap, satellites, ISS_SCALE);

    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `Equatorial Leo Sattelite ${i + 1}`;
    planetSelect.appendChild(opt);
    }


  // ----- ISS-like inclined ring -----
    const N = INCLINED_SAT_COUNT;

  for (let i = 0; i < N; i++) {
    const phase =
      issPhase + MIN_SEP + (i / N) * (2 * Math.PI - 2 * MIN_SEP);
      const name = `sat_incl_${i+1}`;

    spawnSatelliteOnOrbit({
      parent: earth,
      radius: earthRadius + 4.5,
      phase,
      speed: 0.18,
      inclination: THREE.MathUtils.degToRad(55),
      name
    }, objectMap, satellites, ISS_SCALE);
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `Inclined Leo Satellite ${i + 1}`;
    planetSelect.appendChild(opt);
  }



    // ----- GEO satellites -----

    for (let i = 0; i < GEO_SAT_COUNT; i++) {
    const lon = (i / GEO_SAT_COUNT) * Math.PI * 2;
    const name = `geo_sat_${i+1}`;

    spawnGEOSatellite({
        parent: earth,
        longitude: lon,
        name
    }, objectMap, satellites, ISS_SCALE, GEO_ORBIT_RADIUS);

    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `Equatorial GEO Satellite ${i + 1}`;
    planetSelect.appendChild(opt);
    }
}