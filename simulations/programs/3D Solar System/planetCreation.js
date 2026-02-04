
// planetCreation.js
// Functions to create the planets, earth, jupiter's bands, 
// neptune's and jupiter's stormos, saturn's rings, uranus' ring, 
// orbits, and moons to declutter main.js.

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

const sunRadius = 300;
const earthRadius = 8;
const moonRadius = 1.5;

const mercuryRadius = 2.5;
const venusRadius = 6;
const marsRadius = 4;
const jupiterRadius = 55;
const saturnRadius = 42;
const uranusRadius = 33;
const neptuneRadius = 26;


const mercuryColor = 0x8c8c8c;  // gray
const venusColor   = 0xe6c27a;  // pale yellow
const marsColor    = 0xb5533c;  // reddish
const jupiterColor = 0xd8c4a0;  // tan
const saturnColor  = 0xc9b38c;  // pale gold
const uranusColor  = 0x7ad0d6;  // cyan
const neptuneColor = 0x2b4cff;  // deep blue


// Real world coordinates
// Sun at origin
let sunPos = { x: 0, y: 0, z: 0 };

const initialCam = { x: 100, y: 150, z: 750 };

// Inner planets (tighter, but ordered correctly)
let mercuryPos = { x: 480, y: 0, z: 0 };
let venusPos   = { x: 575, y: 0, z: 0 };
let earthPos   = { x: 750, y: 0, z: 0 };
let marsPos    = { x: 1000, y: 0, z: 0 };

// Outer planets (compressed but proportional)
let jupiterPos = { x: 1700, y: 0, z: 0 };
let saturnPos  = { x: 2250, y: 0, z: 0 };
let uranusPos  = { x: 2800, y: 0, z: 0 };
let neptunePos = { x: 3700, y: 0, z: 0 };

// Moon (relative to Earth)
let moonPos = { x: 75, y: 0, z: 0 };
const moonOrbitRadius = moonPos.x;

const earthCameraOffset = new THREE.Vector3(15, 15, 15);
const sunCameraOffset = new THREE.Vector3(800, 800, 800);
const mercuryCameraOffset = new THREE.Vector3(20, 15, 20);
const venusCameraOffset = new THREE.Vector3(35, 20, 25);
const marsCameraOffset = new THREE.Vector3(30, 10, 25);
const jupiterCameraOffset = new THREE.Vector3(190, 60, 190);
const saturnCameraOffset = new THREE.Vector3(110, 70, 110);
const uranusCameraOffset = new THREE.Vector3(95, 50, 95);
const neptuneCameraOffset = new THREE.Vector3(85, 45, 85);
const moonCameraOffset = new THREE.Vector3(10, 10, 15);


// Axial tilts (obliquity) in radians
export const PLANET_TILTS = {
  mercury:  0.034,              // ~2.0°
  venus:    3.095,              // ~177.4° (retrograde)
  earth:    0.409105,           // 23.44°
  mars:     0.439648,           // 25.19°
  jupiter:  0.054628,           // 3.13°
  saturn:   0.466526,           // 26.73°
  uranus:   1.706932,           // 97.77° (on its side)
  neptune:  0.494277            // 28.32°
};

const PLANET_ORBIT_SPEEDS = {
  mercury: 0.020,
  venus:   0.015,
  earth:   0.010,
  mars:    0.008,
  jupiter: 0.004,
  saturn:  0.003,
  uranus:  0.002,
  neptune: 0.001
};

// =========================
// Planet spin rates
// radians per second
// =========================

export const PLANET_SPIN_RATES = {
  mercury: 2 * Math.PI / (58.646 * 86400),   // very slow
  venus:   2 * Math.PI / (243.025 * 86400),  // retrograde (invert sign when used)
  earth:   2 * Math.PI / (0.99726968 * 86400),
  mars:    2 * Math.PI / (1.025957 * 86400),

  jupiter: 2 * Math.PI / (0.41354 * 86400),  // very fast
  saturn:  2 * Math.PI / (0.44401 * 86400),
  uranus:  2 * Math.PI / (0.71833 * 86400),
  neptune: 2 * Math.PI / (0.67125 * 86400)
};



export const MOON_INCLINATIONS = {
  // =========================
  // Earth
  // =========================
  moon: 5.145 * Math.PI / 180,

  // =========================
  // Mars
  // =========================
  phobos: 1.093 * Math.PI / 180,
  deimos: 1.793 * Math.PI / 180,

  // =========================
  // Jupiter (Galilean moons)
  // =========================
  io:       0.036 * Math.PI / 180,
  europa:   0.466 * Math.PI / 180,
  ganymede: 0.177 * Math.PI / 180,
  callisto: 0.192 * Math.PI / 180,

  // =========================
  // Saturn (major moons)
  // =========================
  mimas:    1.574 * Math.PI / 180,
  enceladus:0.009 * Math.PI / 180,
  tethys:   1.091 * Math.PI / 180,
  dione:    0.028 * Math.PI / 180,
  rhea:     0.345 * Math.PI / 180,
  titan:    0.348 * Math.PI / 180,
  iapetus:  15.47 * Math.PI / 180,   // big outlier, very noticeable

  // =========================
  // Uranus (major moons)
  // =========================
  miranda:  4.232 * Math.PI / 180,
  ariel:    0.041 * Math.PI / 180,
  umbriel:  0.128 * Math.PI / 180,
  titania:  0.079 * Math.PI / 180,
  oberon:   0.068 * Math.PI / 180,

  // =========================
  // Neptune
  // =========================
  triton:   156.865 * Math.PI / 180  // retrograde, VERY important
};

export const MOON_ORBIT_SPEEDS = {
  // =========================
  // Earth
  // =========================
  moon: 2 * Math.PI / (27.321661 * 86400),

  // =========================
  // Mars
  // =========================
  phobos: 2 * Math.PI / (0.31891 * 86400),
  deimos: 2 * Math.PI / (1.26244 * 86400),

  // =========================
  // Jupiter (Galilean moons)
  // =========================
  io:       2 * Math.PI / (1.769137786 * 86400),
  europa:   2 * Math.PI / (3.551181 * 86400),
  ganymede: 2 * Math.PI / (7.154553 * 86400),
  callisto: 2 * Math.PI / (16.689018 * 86400),

  // =========================
  // Saturn
  // =========================
  mimas:     2 * Math.PI / (0.942422 * 86400),
  enceladus: 2 * Math.PI / (1.370218 * 86400),
  tethys:    2 * Math.PI / (1.887802 * 86400),
  dione:     2 * Math.PI / (2.736915 * 86400),
  rhea:      2 * Math.PI / (4.517500 * 86400),
  titan:     2 * Math.PI / (15.945421 * 86400),
  iapetus:   2 * Math.PI / (79.3215 * 86400),

  // =========================
  // Uranus
  // =========================
  miranda: 2 * Math.PI / (1.413479 * 86400),
  ariel:   2 * Math.PI / (2.520379 * 86400),
  umbriel: 2 * Math.PI / (4.144177 * 86400),
  titania: 2 * Math.PI / (8.705872 * 86400),
  oberon:  2 * Math.PI / (13.463234 * 86400),

  // =========================
  // Neptune
  // =========================
  triton: 2* Math.PI / (5.876854 * 86400) // retrograde handled by sign
};

export const MOON_ORBIT_RADII = {
  // =========================
  // Earth
  // =========================
  moon: 75,

  // =========================
  // Mars
  // =========================
  phobos: 18,
  deimos: 28,

  // =========================
  // Jupiter (planet radius ~30)
  // =========================
  io:       90,
  europa:   115,
  ganymede: 145,
  callisto: 185,

  // =========================
  // Saturn (planet radius ~26)
  // =========================
  mimas:     80,
  enceladus: 95,
  tethys:    115,
  dione:     135,
  rhea:      165,
  titan:     200,
  iapetus:   235,

  // =========================
  // Uranus
  // =========================
  miranda:  65,
  ariel:    85,
  umbriel:  105,
  titania:  135,
  oberon:   165,

  // =========================
  // Neptune
  // =========================
  triton: 135
};


export const MOON_COLORS = {
  // =========================
  // Earth
  // =========================
  moon: 0xcccccc,

  // =========================
  // Mars
  // =========================
  phobos: 0x888888,
  deimos: 0x999999,

  // =========================
  // Jupiter
  // =========================
  io:       0xffcc66, // sulfur yellow
  europa:   0xe6d8b5, // icy beige
  ganymede: 0x999999, // darker gray
  callisto: 0x666666, // very dark

  // =========================
  // Saturn
  // =========================
  mimas:      0xdddddd,
  enceladus:  0xffffff, // bright ice
  tethys:     0xeaeaea,
  dione:      0xd0d0d0,
  rhea:       0xbfbfbf,
  titan:      0xcc9966, // orange haze
  iapetus:    0x4f4f4f, // dark leading hemisphere

  // =========================
  // Uranus
  // =========================
  miranda:  0xb0b0b0,
  ariel:    0xc8c8c8,
  umbriel:  0x6f6f6f,
  titania:  0xaaaaaa,
  oberon:   0x999999,

  // =========================
  // Neptune
  // =========================
  triton: 0xd6f0ff // icy blue-white
};

export const MOON_RADII = {
  // =========================
  // Earth
  // =========================
  moon: 1.5,

  // =========================
  // Mars
  // =========================
  phobos: 0.6,
  deimos: 0.4,

  // =========================
  // Jupiter
  // =========================
  io:       2.2,
  europa:   2.1,
  ganymede: 2.8, // largest moon in the system
  callisto: 2.5,

  // =========================
  // Saturn
  // =========================
  mimas:      0.9,
  enceladus:  1.0,
  tethys:     1.4,
  dione:      1.5,
  rhea:       1.8,
  titan:      2.6, // big but still < Earth visually
  iapetus:    1.6,

  // =========================
  // Uranus
  // =========================
  miranda:  0.9,
  ariel:    1.4,
  umbriel:  1.3,
  titania:  2.0,
  oberon:   1.9,

  // =========================
  // Neptune
  // =========================
  triton: 2.1
};


export function setEarthMoonCamInfo(){

    return [initialCam, earthPos, earthRadius];
}


function getSunDirection(planetPosition, sun) {
  return new THREE.Vector3(
    sun.position.x - planetPosition.x,
    sun.position.y - planetPosition.y,
    sun.position.z - planetPosition.z
  ).normalize();
}

function createOrbit(radius, color) {
  const points = [];
  const N = 256;

  for (let i = 0; i <= N; i++) {
    const theta = (i / N) * Math.PI * 2;
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
    opacity: 0.4
  });

  return new THREE.LineLoop(geometry, material);
}


function createPlanet(radius, color, frame) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 48),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.0
    })
  );

  mesh.position.set(0, 0, 0);
  frame.add(mesh);
  return mesh;
}

function createMoon(radius, color, orbitRadius, orbitSpeed, inclination = 0) {
  // orbital frame
  const moonFrame = new THREE.Group();

  // set orbital plane
  moonFrame.rotation.z = inclination;

  // moon mesh
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      metalness: 0.0
    })
  );

  // place moon statically on +X
  mesh.position.set(orbitRadius, 0, 0);
  moonFrame.add(mesh);

  return {
    moonFrame,     // THIS is what rotates
    orbitSpeed     // angular speed (rad / sec, scaled later)
  };
}



function createEarthMesh(radius) {
  const geometry = new THREE.SphereGeometry(radius, 128, 128);

  const colors = [];
  const pos = geometry.attributes.position;

  const ocean = new THREE.Color(0x1e5cb3);
  const land  = new THREE.Color(0x2e7d32);
  const sand  = new THREE.Color(0x8d6e3f);
  const ice   = new THREE.Color(0xffffff);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const lat = y / radius; // -1 (south) to +1 (north)

    let color;

    // Antarctica (south polar cap)
    if (lat < -0.85) {
      color = ice;
    }
    // Arctic ice (lighter)
    // else if (lat > 0.8) {
    //   color = ocean.clone().lerp(ice, 0.4);
    // }
    // Mid-latitudes: land vs ocean
    else {
      // pseudo-noise from position (cheap and stable)
      const noise =
        Math.sin(x * 3.1) +
        Math.sin(z * 2.7) +
        Math.sin(y * 1.9);

      if (noise > 0.6) {
        color = land;
      } else if (noise > 0.2) {
        color = land.clone().lerp(sand, 0.4);
      } else {
        color = ocean;
      }
    }

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.7,
    metalness: 0.0
  });

  const earth = new THREE.Mesh(geometry, material);

  return earth;
}


function createJupiter(radius, sun, position) {
  const geometry = new THREE.SphereGeometry(radius, 128, 128);

  const colors = [];
  const pos = geometry.attributes.position;

  const bandColors = [
    new THREE.Color(0xd8c4a0),
    new THREE.Color(0xcbb08a),
    new THREE.Color(0xbfa27a),
    new THREE.Color(0xd8c4a0),
    new THREE.Color(0xbfa27a)
  ];

   const stormColor = new THREE.Color(0xd97a2b);

  // Storm center (relative to Jupiter)
   const stormDir = getSunDirection(position, sun); // unit vector
   const stormCenter = stormDir.clone();



  const stormAngularRadius = 0.25; // radians

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const v = new THREE.Vector3(vx, vy, vz).normalize();

    // Latitude bands
    const lat = (vy / radius + 1) * 0.5;
    const bandIndex = Math.min(
      Math.floor(lat * bandColors.length),
      bandColors.length - 1
    );

    let color = bandColors[bandIndex].clone();

    // Great Red Spot (angular distance on sphere)
    const angle = v.angleTo(stormCenter);
    if (angle < stormAngularRadius) {
      const t = 1 - angle / stormAngularRadius;
      color.lerp(stormColor, t);
    }

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.0
  });

  const jupiter = new THREE.Mesh(geometry, material);

  return jupiter;
}


function addSaturnRings(saturnSpinFrame, planetRadius) {
  const ringGroup = new THREE.Group();

  // Approximate main ring system (scaled for  scene)
  const bands = [
    { inner: 10, outer: 14, opacity: 0.25 }, // D ring (faint)
    { inner: 14.5, outer: 22, opacity: 0.55 }, // C ring
    { inner: 23, outer: 28, opacity: 0.0 },  // Cassini Division (gap)
    { inner: 28.5, outer: 40, opacity: 0.7 }, // B ring (bright)
    { inner: 41, outer: 48, opacity: 0.5 }  // A ring
  ];

  for (const band of bands) {
    if (band.opacity <= 0) continue; // skip gaps

    const geometry = new THREE.RingGeometry(
      planetRadius + band.inner,
      planetRadius + band.outer,
      256
    );

    const material = new THREE.MeshStandardMaterial({
      color: 0xd8cbb0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: band.opacity,
      roughness: 0.9,
      metalness: 0.0
    });

    const ring = new THREE.Mesh(geometry, material);
    ringGroup.add(ring);
  }
  ringGroup.rotation.x = Math.PI/2; // needed because rings are default flat along XY plane
  // so we have to rotate them to be flat along XZ plane like planets' equators
  // then when it's added to the tilted frame, it will automatically tilt with planet
  saturnSpinFrame.add(ringGroup);

  return ringGroup;
}


function addUranusRing(uranusSpinFrame, radius) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius + 6, radius + 14, 64),
    new THREE.MeshStandardMaterial({
      color: 0x9ad6d9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    })
  );

  // Extreme axial tilt
  ring.rotation.x = Math.PI / 2;//
  // Uranus is tipped almost on its side


  uranusSpinFrame.add(ring);
}

function createNeptune(radius, position, sun) {
  const geometry = new THREE.SphereGeometry(radius, 128, 128);
  const colors = [];
  const pos = geometry.attributes.position;

  const baseColor = new THREE.Color(0x2b4cff);
  const stormColor = new THREE.Color(0x1a2a6c);

  // Direction from Neptune → Sun (unit vector)
  const stormDir = getSunDirection(position, sun);

  const stormAngularRadius = 0.22;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const v = new THREE.Vector3(vx, vy, vz).normalize();
    let color = baseColor.clone();

    const angle = v.angleTo(stormDir);
    if (angle < stormAngularRadius) {
      const t = 1 - angle / stormAngularRadius;
      color.lerp(stormColor, t);
    }

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.0
  });

  const neptune = new THREE.Mesh(geometry, material);
  neptune.position.set(0, 0, 0);

  return neptune;
}




// Creates scene objects needed in main.js
export function initThree() {
  const canvas = document.getElementById("sim-canvas");

  let renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  let scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  let camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    9500
  );

    camera.position.set(initialCam.x, initialCam.y, 750);
    camera.lookAt(earthPos.x, earthPos.y, earthPos.z);


  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  //controls.enableZoom;

  return  { scene, camera, renderer, controls };
}


// Creates all the planets
export function initScene(scene, objectMap, moons) {

  // Sun and Lights //
    const ambient = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambient);

    const sunMat = new THREE.MeshStandardMaterial({
        color: 0xffcc55,
        emissive: 0xffaa33,
        emissiveIntensity: 2,
        toneMapped: false
        });


    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(sunRadius, 64, 64),
        sunMat
    );

    sun.position.set(0, 0, 0);
    scene.add(sun);

    const sunLight = new THREE.PointLight(0xffffff, 3500000.0, 0); // distance = 0 means infinite
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);


    // Earth and Moon //

    // =========================
    // Earth system
    // =========================

    // 1. Orbit frame (ONLY thing that rotates for the year)
    const earthOrbitFrame = new THREE.Group();
    scene.add(earthOrbitFrame);

    // 2. Position frame (sets distance from Sun, never rotates)
    const earthPositionFrame = new THREE.Group();
    earthPositionFrame.position.set(earthPos.x, 0, earthPos.z);
    earthOrbitFrame.add(earthPositionFrame);

    // 3. Axial frame (tilt lives here, NEVER rotates)
    const earthAxialFrame = new THREE.Group();
    earthAxialFrame.rotation.z = PLANET_TILTS.earth;
    earthPositionFrame.add(earthAxialFrame);

    // 4. Spin frame (daily rotation)
    const earthSpinFrame = new THREE.Group();
    earthAxialFrame.add(earthSpinFrame);

    // 5. Earth mesh
    const earth = createEarthMesh(earthRadius);
    earthSpinFrame.add(earth);
   // earth.rotation.z = 0.41; // 23.5°

    //earth.position.set(earthPos.x, earthPos.y, earthPos.z);
    
    const moonFrame = new THREE.Group();
    moonFrame.position.set(0, 0, 0);
    earthAxialFrame.add(moonFrame);

    const moon = new THREE.Mesh(
    new THREE.SphereGeometry(MOON_RADII.moon, 32, 32),
    new THREE.MeshStandardMaterial({
        color: MOON_COLORS.moon,
        roughness: 0.9,
        metalness: 0.0
    })
    );

    moon.position.set(MOON_ORBIT_RADII.moon, 0, 0);
    moonFrame.add(moon);

    const moonOrbit = createOrbit(MOON_ORBIT_RADII.moon, 0x888888);
    moonFrame.add(moonOrbit);
    moonFrame.rotation.z = MOON_INCLINATIONS.moon;

    moons.push({
      moonFrame,
      orbitSpeed: MOON_ORBIT_SPEEDS.moon,
      planet: "earth"
    });
  // ---- Extra planets (visual only) ----

    // =====================
    // Mercury
    // =====================

    // rotates around the Sun (year)
    const mercuryOrbitFrame = new THREE.Group();
    scene.add(mercuryOrbitFrame);

    // radial distance from Sun
    const mercuryPositionFrame = new THREE.Group();
    mercuryPositionFrame.position.set(mercuryPos.x, 0, 0);
    mercuryOrbitFrame.add(mercuryPositionFrame);

    // fixed axial tilt (does NOT rotate)
    const mercuryAxialFrame = new THREE.Group();
    mercuryAxialFrame.rotation.z = PLANET_TILTS.mercury;
    mercuryPositionFrame.add(mercuryAxialFrame);

    // daily spin only
    const mercurySpinFrame = new THREE.Group();
    mercuryAxialFrame.add(mercurySpinFrame);

    // actual mesh
    const mercury = createPlanet(
      mercuryRadius,
      mercuryColor,
      mercurySpinFrame
    );


    // =====================
    // Venus
    // =====================

    // rotates around the Sun (year)
    const venusOrbitFrame = new THREE.Group();
    scene.add(venusOrbitFrame);

    // radial distance from Sun
    const venusPositionFrame = new THREE.Group();
    venusPositionFrame.position.set(venusPos.x, 0, 0);
    venusOrbitFrame.add(venusPositionFrame);

    // fixed axial tilt (never animated)
    const venusAxialFrame = new THREE.Group();
    venusAxialFrame.rotation.z = PLANET_TILTS.venus;
    venusPositionFrame.add(venusAxialFrame);

    // daily spin only
    const venusSpinFrame = new THREE.Group();
    venusAxialFrame.add(venusSpinFrame);

    // actual planet mesh
    const venus = createPlanet(
      venusRadius,
      venusColor,
      venusSpinFrame
    );


    // =====================
    // Mars
    // =====================

    // rotates around the Sun (year)
    const marsOrbitFrame = new THREE.Group();
    scene.add(marsOrbitFrame);

    // radial distance from Sun
    const marsPositionFrame = new THREE.Group();
    marsPositionFrame.position.set(marsPos.x, 0, 0);
    marsOrbitFrame.add(marsPositionFrame);

    // fixed axial tilt (never animated)
    const marsAxialFrame = new THREE.Group();
    marsAxialFrame.rotation.z = PLANET_TILTS.mars;
    marsPositionFrame.add(marsAxialFrame);

    // daily spin only
    const marsSpinFrame = new THREE.Group();
    marsAxialFrame.add(marsSpinFrame);

    // actual planet mesh
    const mars = createPlanet(
      marsRadius,
      marsColor,
      marsSpinFrame
    );


    // Mars moons
    // --- Phobos ---
    const phobos = createMoon(
      MOON_RADII.phobos,
      MOON_COLORS.phobos,
      MOON_ORBIT_RADII.phobos,
      MOON_ORBIT_SPEEDS.phobos,
      MOON_INCLINATIONS.phobos
    );

    // attach directly to Mars tilt frame
    marsAxialFrame.add(phobos.moonFrame);

    moons.push({
      moonFrame: phobos.moonFrame,
      orbitSpeed: phobos.orbitSpeed,
      planet: "mars"
    });


    // --- Deimos ---
    const deimos = createMoon(
      MOON_RADII.deimos,
      MOON_COLORS.deimos,
      MOON_ORBIT_RADII.deimos,
      MOON_ORBIT_SPEEDS.deimos,
      MOON_INCLINATIONS.deimos
    );

    marsAxialFrame.add(deimos.moonFrame);

    moons.push({
      moonFrame: deimos.moonFrame,
      orbitSpeed: deimos.orbitSpeed,
      planet: "mars"
    });


    
    // =====================
    // Jupiter
    // =====================

    // rotates around the Sun (year)
    const jupiterOrbitFrame = new THREE.Group();
    scene.add(jupiterOrbitFrame);

    // radial distance from Sun
    const jupiterPositionFrame = new THREE.Group();
    jupiterPositionFrame.position.set(jupiterPos.x, 0, 0);
    jupiterOrbitFrame.add(jupiterPositionFrame);

    // fixed axial tilt (never animated)
    const jupiterAxialFrame = new THREE.Group();
    jupiterAxialFrame.rotation.z = PLANET_TILTS.jupiter;
    jupiterPositionFrame.add(jupiterAxialFrame);

    // daily spin only
    const jupiterSpinFrame = new THREE.Group();
    jupiterAxialFrame.add(jupiterSpinFrame);

    // actual planet mesh
    const jupiter = createJupiter(jupiterRadius, sun, jupiterPos);
    jupiterSpinFrame.add(jupiter);

    
    // --- Io ---
    const io = createMoon(
      MOON_RADII.io,
      MOON_COLORS.io,
      MOON_ORBIT_RADII.io,
      MOON_ORBIT_SPEEDS.io,
      MOON_INCLINATIONS.io
    );

    jupiterAxialFrame.add(io.moonFrame);

    moons.push({
      moonFrame: io.moonFrame,
      orbitSpeed: io.orbitSpeed,
      planet: "jupiter"
    });


    // --- Europa ---
    const europa = createMoon(
      MOON_RADII.europa,
      MOON_COLORS.europa,
      MOON_ORBIT_RADII.europa,
      MOON_ORBIT_SPEEDS.europa,
      MOON_INCLINATIONS.europa
    );

    jupiterAxialFrame.add(europa.moonFrame);

    moons.push({
      moonFrame: europa.moonFrame,
      orbitSpeed: europa.orbitSpeed,
      planet: "jupiter"
    });


    // --- Ganymede ---
    const ganymede = createMoon(
      MOON_RADII.ganymede,
      MOON_COLORS.ganymede,
      MOON_ORBIT_RADII.ganymede,
      MOON_ORBIT_SPEEDS.ganymede,
      MOON_INCLINATIONS.ganymede
    );

    jupiterAxialFrame.add(ganymede.moonFrame);

    moons.push({
      moonFrame: ganymede.moonFrame,
      orbitSpeed: ganymede.orbitSpeed,
      planet: "jupiter"
    });


    // --- Callisto ---
    const callisto = createMoon(
      MOON_RADII.callisto,
      MOON_COLORS.callisto,
      MOON_ORBIT_RADII.callisto,
      MOON_ORBIT_SPEEDS.callisto,
      MOON_INCLINATIONS.callisto
    );

    jupiterAxialFrame.add(callisto.moonFrame);

    moons.push({
      moonFrame: callisto.moonFrame,
      orbitSpeed: callisto.orbitSpeed,
      planet: "jupiter"
    });


    // =====================
    // Saturn
    // =====================

    // rotates around the Sun (year)
    const saturnOrbitFrame = new THREE.Group();
    scene.add(saturnOrbitFrame);

    // radial distance from Sun
    const saturnPositionFrame = new THREE.Group();
    saturnPositionFrame.position.set(saturnPos.x, 0, 0);
    saturnOrbitFrame.add(saturnPositionFrame);

    // fixed axial tilt (never animated)
    const saturnAxialFrame = new THREE.Group();
    saturnAxialFrame.rotation.z = PLANET_TILTS.saturn;
    saturnPositionFrame.add(saturnAxialFrame);

    // daily spin only
    const saturnSpinFrame = new THREE.Group();
    saturnAxialFrame.add(saturnSpinFrame);

    // actual planet mesh
    const saturn = createPlanet(
      saturnRadius,
      saturnColor,
      saturnSpinFrame
    );


    addSaturnRings(saturnSpinFrame, saturnRadius);

    // --- Titan ---
    const titan = createMoon(
      MOON_RADII.titan,
      MOON_COLORS.titan,
      MOON_ORBIT_RADII.titan,
      MOON_ORBIT_SPEEDS.titan,
      MOON_INCLINATIONS.titan
    );

    saturnAxialFrame.add(titan.moonFrame);

    moons.push({
      moonFrame: titan.moonFrame,
      orbitSpeed: titan.orbitSpeed,
      planet: "saturn"
    });


    // --- Iapetus ---
    const iapetus = createMoon(
      MOON_RADII.iapetus,
      MOON_COLORS.iapetus,
      MOON_ORBIT_RADII.iapetus,
      MOON_ORBIT_SPEEDS.iapetus,
      MOON_INCLINATIONS.iapetus
    );

    saturnAxialFrame.add(iapetus.moonFrame);

    moons.push({
      moonFrame: iapetus.moonFrame,
      orbitSpeed: iapetus.orbitSpeed,
      planet: "saturn"
    });


    // --- Mimas ---
    const mimas = createMoon(
      MOON_RADII.mimas,
      MOON_COLORS.mimas,
      MOON_ORBIT_RADII.mimas,
      MOON_ORBIT_SPEEDS.mimas,
      MOON_INCLINATIONS.mimas
    );

    saturnAxialFrame.add(mimas.moonFrame);

    moons.push({
      moonFrame: mimas.moonFrame,
      orbitSpeed: mimas.orbitSpeed,
      planet: "saturn"
    });


    // --- Enceladus ---
    const enceladus = createMoon(
      MOON_RADII.enceladus,
      MOON_COLORS.enceladus,
      MOON_ORBIT_RADII.enceladus,
      MOON_ORBIT_SPEEDS.enceladus,
      MOON_INCLINATIONS.enceladus
    );

    saturnAxialFrame.add(enceladus.moonFrame);

    moons.push({
      moonFrame: enceladus.moonFrame,
      orbitSpeed: enceladus.orbitSpeed,
      planet: "saturn"
    });


    // --- Tethys ---
    const tethys = createMoon(
      MOON_RADII.tethys,
      MOON_COLORS.tethys,
      MOON_ORBIT_RADII.tethys,
      MOON_ORBIT_SPEEDS.tethys,
      MOON_INCLINATIONS.tethys
    );

    saturnAxialFrame.add(tethys.moonFrame);

    moons.push({
      moonFrame: tethys.moonFrame,
      orbitSpeed: tethys.orbitSpeed,
      planet: "saturn"
    });


    // --- Dione ---
    const dione = createMoon(
      MOON_RADII.dione,
      MOON_COLORS.dione,
      MOON_ORBIT_RADII.dione,
      MOON_ORBIT_SPEEDS.dione,
      MOON_INCLINATIONS.dione
    );

    saturnAxialFrame.add(dione.moonFrame);

    moons.push({
      moonFrame: dione.moonFrame,
      orbitSpeed: dione.orbitSpeed,
      planet: "saturn"
    });


    // --- Rhea ---
    const rhea = createMoon(
      MOON_RADII.rhea,
      MOON_COLORS.rhea,
      MOON_ORBIT_RADII.rhea,
      MOON_ORBIT_SPEEDS.rhea,
      MOON_INCLINATIONS.rhea
    );

    saturnAxialFrame.add(rhea.moonFrame);

    moons.push({
      moonFrame: rhea.moonFrame,
      orbitSpeed: rhea.orbitSpeed,
      planet: "saturn"
    });


    // =====================
    // Uranus
    // =====================

    // rotates around the Sun (year)
    const uranusOrbitFrame = new THREE.Group();
    scene.add(uranusOrbitFrame);

    // radial distance from Sun
    const uranusPositionFrame = new THREE.Group();
    uranusPositionFrame.position.set(uranusPos.x, 0, 0);
    uranusOrbitFrame.add(uranusPositionFrame);

    // fixed axial tilt (Uranus is sideways)
    const uranusAxialFrame = new THREE.Group();
    uranusAxialFrame.rotation.x = PLANET_TILTS.uranus; // ~98°
    uranusPositionFrame.add(uranusAxialFrame);

    // daily spin only
    const uranusSpinFrame = new THREE.Group();
    uranusAxialFrame.add(uranusSpinFrame);

    // actual planet mesh
    const uranus = createPlanet(
      uranusRadius,
      uranusColor,
      uranusSpinFrame
    );
    addUranusRing(uranusAxialFrame, uranusRadius);



    // --- Miranda ---
    const miranda = createMoon(
      MOON_RADII.miranda,
      MOON_COLORS.miranda,
      MOON_ORBIT_RADII.miranda,
      MOON_ORBIT_SPEEDS.miranda,
      MOON_INCLINATIONS.miranda
    );

    uranusAxialFrame.add(miranda.moonFrame);

    moons.push({
      moonFrame: miranda.moonFrame,
      orbitSpeed: miranda.orbitSpeed,
      planet: "uranus"
    });


    // --- Ariel ---
    const ariel = createMoon(
      MOON_RADII.ariel,
      MOON_COLORS.ariel,
      MOON_ORBIT_RADII.ariel,
      MOON_ORBIT_SPEEDS.ariel,
      MOON_INCLINATIONS.ariel
    );

    uranusAxialFrame.add(ariel.moonFrame);

    moons.push({
      moonFrame: ariel.moonFrame,
      orbitSpeed: ariel.orbitSpeed,
      planet: "uranus"
    });


    // --- Umbriel ---
    const umbriel = createMoon(
      MOON_RADII.umbriel,
      MOON_COLORS.umbriel,
      MOON_ORBIT_RADII.umbriel,
      MOON_ORBIT_SPEEDS.umbriel,
      MOON_INCLINATIONS.umbriel
    );

    uranusAxialFrame.add(umbriel.moonFrame);

    moons.push({
      moonFrame: umbriel.moonFrame,
      orbitSpeed: umbriel.orbitSpeed,
      planet: "uranus"
    });


    // --- Titania ---
    const titania = createMoon(
      MOON_RADII.titania,
      MOON_COLORS.titania,
      MOON_ORBIT_RADII.titania,
      MOON_ORBIT_SPEEDS.titania,
      MOON_INCLINATIONS.titania
    );

    uranusAxialFrame.add(titania.moonFrame);

    moons.push({
      moonFrame: titania.moonFrame,
      orbitSpeed: titania.orbitSpeed,
      planet: "uranus"
    });


    // --- Oberon ---
    const oberon = createMoon(
      MOON_RADII.oberon,
      MOON_COLORS.oberon,
      MOON_ORBIT_RADII.oberon,
      MOON_ORBIT_SPEEDS.oberon,
      MOON_INCLINATIONS.oberon
    );

    uranusAxialFrame.add(oberon.moonFrame);

    moons.push({
      moonFrame: oberon.moonFrame,
      orbitSpeed: oberon.orbitSpeed,
      planet: "uranus"
    });



    

    // =====================
    // Neptune
    // =====================

    // rotates around the Sun (year)
    const neptuneOrbitFrame = new THREE.Group();
    scene.add(neptuneOrbitFrame);

    // radial distance from Sun
    const neptunePositionFrame = new THREE.Group();
    neptunePositionFrame.position.set(neptunePos.x, 0, 0);
    neptuneOrbitFrame.add(neptunePositionFrame);

    // fixed axial tilt (never animated)
    const neptuneAxialFrame = new THREE.Group();
    neptuneAxialFrame.rotation.z = PLANET_TILTS.neptune;
    neptunePositionFrame.add(neptuneAxialFrame);

    // daily spin only
    const neptuneSpinFrame = new THREE.Group();
    neptuneAxialFrame.add(neptuneSpinFrame);

    // actual planet mesh
    const neptune = createNeptune(neptuneRadius, neptunePos, sun);
    neptuneSpinFrame.add(neptune);


    // --- Triton (retrograde) ---
    const triton = createMoon(
      1.9,          // radius
      0xddddff,     // color
      65,           // orbit radius
      -0.02,        // NEGATIVE = retrograde
      MOON_INCLINATIONS.triton
    );

    // attach directly to Neptune tilt frame
    neptuneAxialFrame.add(triton.moonFrame);

    // register
    moons.push({
      moonFrame: triton.moonFrame,
      orbitSpeed: triton.orbitSpeed,
      planet: "neptune"
    });



    scene.add(createOrbit(mercuryPos.x, mercuryColor));
    scene.add(createOrbit(venusPos.x, venusColor));
    scene.add(createOrbit(earthPos.x, 0x4caf50)); // Earth orbit in green
    scene.add(createOrbit(marsPos.x, marsColor));
    scene.add(createOrbit(jupiterPos.x, jupiterColor));
    scene.add(createOrbit(saturnPos.x, saturnColor));
    scene.add(createOrbit(uranusPos.x, uranusColor));
    scene.add(createOrbit(neptunePos.x, neptuneColor));



    const planets = [
        {
          name: "mercury",
          orbitFrame: mercuryOrbitFrame,
          axialFrame: mercuryAxialFrame,
          spinFrame: mercurySpinFrame,
          orbitSpeed: PLANET_ORBIT_SPEEDS.mercury,
          spinSpeed: PLANET_SPIN_RATES.mercury
        },
        {
          name: "venus",
          orbitFrame: venusOrbitFrame,
          axialFrame: venusAxialFrame,
          spinFrame: venusSpinFrame,
          orbitSpeed: PLANET_ORBIT_SPEEDS.venus,
          spinSpeed: -PLANET_SPIN_RATES.venus // retrograde
        },
        {
          name: "earth",
          orbitFrame: earthOrbitFrame,
          axialFrame: earthAxialFrame,
          spinFrame: earthSpinFrame,
          orbitSpeed: PLANET_ORBIT_SPEEDS.earth,
          spinSpeed: PLANET_SPIN_RATES.earth
        },
        {
          name: "mars",
          orbitFrame: marsOrbitFrame,
          axialFrame: marsAxialFrame,
          spinFrame: marsSpinFrame,
          orbitSpeed: PLANET_ORBIT_SPEEDS.mars,
          spinSpeed: PLANET_SPIN_RATES.mars
        },
        {
          name: "jupiter",
          orbitFrame: jupiterOrbitFrame,
          axialFrame: jupiterAxialFrame,
          spinFrame: jupiterSpinFrame,
          orbitSpeed: PLANET_ORBIT_SPEEDS.jupiter,
          spinSpeed: PLANET_SPIN_RATES.jupiter
        },
        {
          name: "saturn",
          orbitFrame: saturnOrbitFrame,
          axialFrame: saturnAxialFrame,
          spinFrame: saturnSpinFrame,
          orbitSpeed: PLANET_ORBIT_SPEEDS.saturn,
          spinSpeed: PLANET_SPIN_RATES.saturn
        },
        {
          name: "uranus",
          orbitFrame: uranusOrbitFrame,
          axialFrame: uranusAxialFrame,
          spinFrame: uranusSpinFrame,
          orbitSpeed: PLANET_ORBIT_SPEEDS.uranus,
          spinSpeed: PLANET_SPIN_RATES.uranus
        },
        {
          name: "neptune",
          orbitFrame: neptuneOrbitFrame,
          axialFrame: neptuneAxialFrame,
          spinFrame: neptuneSpinFrame,
          orbitSpeed: PLANET_ORBIT_SPEEDS.neptune,
          spinSpeed: PLANET_SPIN_RATES.neptune
        }
      ];






    objectMap.set("mercury", [mercurySpinFrame, mercuryCameraOffset]);
    objectMap.set("venus",   [venusSpinFrame,   venusCameraOffset]);
    objectMap.set("earth",   [earthSpinFrame,   earthCameraOffset]);
    objectMap.set("mars",    [marsSpinFrame,    marsCameraOffset]);
    objectMap.set("jupiter", [jupiterSpinFrame, jupiterCameraOffset]);
    objectMap.set("saturn",  [saturnSpinFrame,  saturnCameraOffset]);
    objectMap.set("uranus",  [uranusSpinFrame,  uranusCameraOffset]);
    objectMap.set("neptune", [neptuneSpinFrame, neptuneCameraOffset]);
    objectMap.set("sun",     [sun,               sunCameraOffset]);
    objectMap.set("moon", [moon, moonCameraOffset]);




    return planets;
}