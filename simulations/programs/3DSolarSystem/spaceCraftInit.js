import * as THREE from "three";
import { createISS, createSatellite } from "./spaceCrafts.js";

/*
This file is RESPONSIBLE ONLY FOR:
- scene graph structure
- frames
- orientation
- camera targets

NO motion
NO updates
NO physics
*/

// NOTE: // BODY FRAME CONVENTION:
// +X = radial
// +Y = orbit normal
// +Z = anti-velocity (antenna direction)



export function instantiateSatelliteSystems({axialFrame, spinFrame, bodyRadius, scale, basePhase, objectMap, LEO_EQ_ORBIT_RADIUS = 4.5, LEO_INCL_ORBIT_RADIUS = 4.5, GEO_ORBIT_RADIUS = 15, INCLINED_SAT_COUNT = 7, EQUATORIAL_SAT_COUNT = 8, GEO_SAT_COUNT = 10, MIN_SEP = THREE.MathUtils.degToRad(10), LEO_EQ_ORBIT_SPEED = 0.25, LEO_INCL_ORBIT_SPEED = 0.25, GEO_ORBIT_SPEED = 0, INCLINE_ORBIT_ANGLE = THREE.MathUtils.degToRad(55)}) {
  //initializeISS({axialFrame, bodyRadius, scale, basePhase, objectMap, orbitRadius: LEO_INCL_ORBIT_RADIUS, orbitSpeed: LEO_INCL_ORBIT_SPEED});
  initializeSatellites({axialFrame, spinFrame, bodyRadius, scale, basePhase, objectMap, LEO_EQ_ORBIT_RADIUS, LEO_INCL_ORBIT_RADIUS, GEO_ORBIT_RADIUS, INCLINED_SAT_COUNT, EQUATORIAL_SAT_COUNT, GEO_SAT_COUNT, MIN_SEP, LEO_EQ_ORBIT_SPEED, LEO_INCL_ORBIT_SPEED, GEO_ORBIT_SPEED, INCLINE_ORBIT_ANGLE});
  initOrbits(axialFrame, spinFrame, bodyRadius, GEO_ORBIT_RADIUS, LEO_EQ_ORBIT_RADIUS,LEO_INCL_ORBIT_RADIUS, INCLINE_ORBIT_ANGLE);
}

// adds the orbits of the satellites around their orbiting body
function initOrbits(parentAxialFrame, parentSpinFrame, bodyRadius, GEO_ORBIT_RADIUS, LEO_EQ_ORBIT_RADIUS, LEO_INCL_ORBIT_RADIUS, INCLINE_ORBIT_ANGLE = THREE.MathUtils.degToRad(55)) {

  // --- Orbit 1: equatorial ---
  const equatorialOrbit = createOrbitRing(
    LEO_EQ_ORBIT_RADIUS + bodyRadius,
    256,
    0x44aaff
  );
  parentAxialFrame.add(equatorialOrbit);

  // --- Orbit 2: inclined ---
  const inclinedOrbit = createOrbitRing(
    LEO_INCL_ORBIT_RADIUS + bodyRadius,
    256,
    0xffaa44
  );
  inclinedOrbit.rotation.x = INCLINE_ORBIT_ANGLE; // inclination
  parentAxialFrame.add(inclinedOrbit);

  // --- GEO ring ---
  const geoOrbit = createOrbitRing(
  GEO_ORBIT_RADIUS + bodyRadius,
  256,
  0xbb66ff
);
parentSpinFrame.add(geoOrbit);

}

function createOrbitRing(radius, segments = 256, color = 0xffffff) {
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        radius * Math.cos(theta),
        0,
        radius * Math.sin(theta)
      )
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.6
  });

  return new THREE.LineLoop(geometry, material);
}


  // ================================
  // CORE SATELLITE SYSTEM CONSTRUCTOR
  // ================================
function createSatelliteSystem({
    parentFrame,
    mesh,
    orbitRadius,
    orbitSpeed,
    inclination = 0,
    initialPhase = 0, 
  }) {
    // orbital motion frame. think of a fixed ring tilted by inclination around earth's tilted axis
    // each satellite in this frame is then positioned and rotated along this ring
    // this makes each satellite move the same amount as each other satellite in the ring
    const orbitFrame = new THREE.Group();
    orbitFrame.rotation.x = inclination;
    parentFrame.add(orbitFrame);

    // radial distance
    const positionFrame = new THREE.Group();
    positionFrame.position.set(orbitRadius, 0, 0);
    orbitFrame.add(positionFrame);

    // spacecraft body frame. local rotations go here, relative to the orbit ring defined by orbitFrame
    const bodyFrame = new THREE.Group();
    positionFrame.add(bodyFrame);
    bodyFrame.add(mesh);

    const onboardCamFrame = new THREE.Group();

    // In spaceCraftInit.js -> createSatelliteSystem()

    // 1. Position: Slightly forward of the antenna (+Z) and slightly "Up" (+Y)
    // Since the bus is 0.45 long, Z: 0.3 puts cam at the front edge.
    onboardCamFrame.position.set(0, 0.05, -0.03); 

    // 2. Look: Point straight ahead toward Earth (+Z)
    onboardCamFrame.lookAt(new THREE.Vector3(0, 0.1, -1.0));
    bodyFrame.add(onboardCamFrame);

    //orbitFrame.add(new THREE.AxesHelper(0.6));      // cage
    //positionFrame.add(new THREE.AxesHelper(0.4));   // radial frame
    //bodyFrame.add(new THREE.AxesHelper(0.3));       // spacecraft body

    

    // Point +Z_body toward Earth at spawn
    const toEarth = new THREE.Vector3()
      .subVectors(
        parentFrame.getWorldPosition(new THREE.Vector3()),
        bodyFrame.getWorldPosition(new THREE.Vector3())
      )
      .normalize();

    const q0 = new THREE.Quaternion()
      .setFromUnitVectors(new THREE.Vector3(0, 0, 1), toEarth);

    bodyFrame.quaternion.copy(q0);



    if (mesh.adcs) {
      bodyFrame.adcs = mesh.adcs;
      bodyFrame.adcs._bodyFrame = bodyFrame;
      delete mesh.adcs; // switch adcs system to body frame instead of mesh (best practice)
    }
    if (mesh.bodyAxes){
      bodyFrame.bodyAxes = mesh.bodyAxes;
      delete mesh.bodyAxes;
    }

    // initial placement along orbit
    orbitFrame.rotation.y = initialPhase;

    orbitFrame.userData.isSatelliteOrbit = true;
    orbitFrame.userData.bodyFrame = bodyFrame;
    orbitFrame.userData.orbitSpeed = orbitSpeed;

    return {
      orbitFrame,
      bodyFrame,
      onboardCamFrame
    };
  }




// ================================
// INITIALIZE ALL OTHER SATELLITES
// ================================
function initializeSatellites({
  axialFrame,
  spinFrame,
  bodyRadius,
  INCLINED_SAT_COUNT,
  EQUATORIAL_SAT_COUNT,
  GEO_SAT_COUNT,
  GEO_ORBIT_RADIUS,
  scale,
  MIN_SEP,
  basePhase,
  objectMap, 
  LEO_EQ_ORBIT_RADIUS,
  LEO_INCL_ORBIT_RADIUS,
  LEO_EQ_ORBIT_SPEED,
  LEO_INCL_ORBIT_SPEED,
  GEO_ORBIT_SPEED,
  INCLINE_ORBIT_ANGLE
}) {
  const planetSelect = document.getElementById("planetView");

  const SAT_SCALE_LEO = 3;
  const SAT_SCALE_GEO = 4;

  // ----------------
  // EQUATORIAL LEO
  // ----------------
  for (let i = 0; i < EQUATORIAL_SAT_COUNT; i++) {
    const mesh = createSatellite({ target: "earth"});
    mesh.scale.setScalar(SAT_SCALE_LEO * scale);

    const phase = (i / EQUATORIAL_SAT_COUNT) * Math.PI * 2;

    const sat = createSatelliteSystem({
      parentFrame: axialFrame,
      mesh,
      orbitRadius: bodyRadius + LEO_EQ_ORBIT_RADIUS,
      orbitSpeed: LEO_EQ_ORBIT_SPEED,
      inclination: 0,
      initialPhase: basePhase + phase
    });


    const name = `sat_eq_${i + 1}`;
    objectMap.set(name, {
        body: {
          frame: sat.bodyFrame.parent,
          physics: sat.bodyFrame,
          offset: new THREE.Vector3(1.15, 1.15, 1.15)
        },

        onboard: {
          frame: sat.onboardCamFrame,
          offset: new THREE.Vector3(0, 0, 0) // camera sits exactly here
        },

        spin: {
          frame: sat.bodyFrame.parent,
          offset: new THREE.Vector3(1, 1, 1)
        },

        fixed: {
          frame: sat.bodyFrame.parent,
          offset: new THREE.Vector3(1, 1, 1)
        }
      });


    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `Equatorial LEO Satellite ${i + 1}`;

    if (i === 0){
      planetSelect.insertBefore(opt, planetSelect.firstChild);
      planetSelect.value = name;
    }
    else{
    planetSelect.appendChild(opt);
    }
  }

  // ----------------
  // INCLINED LEO
  // ----------------
  for (let i = 0; i < INCLINED_SAT_COUNT; i++) {
    const mesh = createSatellite();
    mesh.scale.setScalar(SAT_SCALE_LEO * scale);

    const phase =
      basePhase + MIN_SEP +
      (i / INCLINED_SAT_COUNT) * (2 * Math.PI - 2 * MIN_SEP);

    const sat = createSatelliteSystem({
      parentFrame: axialFrame,
      mesh,
      orbitRadius: bodyRadius + LEO_INCL_ORBIT_RADIUS,
      orbitSpeed: LEO_INCL_ORBIT_SPEED,
      inclination: INCLINE_ORBIT_ANGLE, // now means X-tilt
      initialPhase: phase
    });


    const name = `sat_incl_${i + 1}`;
    objectMap.set(name, {
        body: {
          frame: sat.bodyFrame.parent,
          physics: sat.bodyFrame,
          offset: new THREE.Vector3(1.15, 1.15, 1.15)
        },

        onboard: {
          frame: sat.onboardCamFrame,
          offset: new THREE.Vector3(0, 0, 0) // camera sits exactly here
        },

        spin: {
          frame: sat.bodyFrame.parent,
          offset: new THREE.Vector3(1, 1, 1)
        },

        fixed: {
          frame: sat.bodyFrame.parent,
          offset: new THREE.Vector3(1, 1, 1)
        }
      });


    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `Inclined LEO Satellite ${i + 1}`;
    planetSelect.appendChild(opt);
  }

  // ----------------
  // GEO RING
  // ----------------
  for (let i = 0; i < GEO_SAT_COUNT; i++) {
    const mesh = createSatellite();
    mesh.scale.setScalar(SAT_SCALE_GEO * scale);

    const phase = (i / GEO_SAT_COUNT) * Math.PI * 2;

    const sat = createSatelliteSystem({
      parentFrame: spinFrame,
      mesh,
      orbitRadius: bodyRadius + GEO_ORBIT_RADIUS,
      orbitSpeed: GEO_ORBIT_SPEED,
      inclination: 0,
      initialPhase: basePhase + phase
    });



    const name = `geo_sat_${i + 1}`;
    objectMap.set(name, {
        body: {
          frame: sat.bodyFrame.parent,
          physics: sat.bodyFrame,
          offset: new THREE.Vector3(1.15, 1.15, 1.15)
        },

        onboard: {
          frame: sat.onboardCamFrame,
          offset: new THREE.Vector3(0, 0, 0) // camera sits exactly here
        },

        spin: {
          frame: sat.bodyFrame.parent,
          offset: new THREE.Vector3(1, 1, 1)
        },

        fixed: {
          frame: sat.bodyFrame.parent,
          offset: new THREE.Vector3(1, 1, 1)
        }
      });

    console.log(sat.onboardCamFrame);
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `GEO Satellite ${i + 1}`;
    planetSelect.appendChild(opt);
  }
}


// ================================
// INITIALIZE ISS (NOT SPECIAL)
// ================================
function initializeISS({
  axialFrame,
  bodyRadius,
  scale,
  basePhase,
  objectMap,
  orbitRadius,
  orbitSpeed,
}) {
  const issMesh = createISS();
  issMesh.scale.setScalar(scale);

  const iss = createSatelliteSystem({
    parentFrame: axialFrame,
    mesh: issMesh,
    orbitRadius: bodyRadius + orbitRadius,
    orbitSpeed: orbitSpeed,
    inclination:   THREE.MathUtils.degToRad(51.6),
    initialPhase: basePhase
  });

  registerAntennaDirection(iss.bodyFrame);

  // need to define the actual offset body frame
  objectMap.set("iss", [
    iss.bodyFrame,
    new THREE.Vector3(2, 2, 4)
  ]);

  return iss;
}