// ================================
// Global state
// ================================
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"


let scene, camera, renderer;
let controls;

let isRunning = false;
let lastTime = 0;

let earth;
let sun;
let moon;
let mercury;
let venus;
let mars;
let jupiter;
let saturn;
let uranus;
let neptune;

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
const earthColor   = 0x2e7d32;  // forest green
const moonColor    = 0xaaaaaa;  // light gray
const marsColor    = 0xb5533c;  // reddish
const jupiterColor = 0xd8c4a0;  // tan
const saturnColor  = 0xc9b38c;  // pale gold
const uranusColor  = 0x7ad0d6;  // cyan
const neptuneColor = 0x2b4cff;  // deep blue

let planets = [];
let moons = [];


const saturnRingColor = 0xc9b38c;



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
let jupiterPos = { x: 1550, y: 0, z: 0 };
let saturnPos  = { x: 2000, y: 0, z: 0 };
let uranusPos  = { x: 2600, y: 0, z: 0 };
let neptunePos = { x: 3200, y: 0, z: 0 };

// Moon (relative to Earth)
let moonPos = { x: 75, y: 0, z: 0 };

const ORBIT_SPEEDS = {
  mercury: 0.020,
  venus:   0.015,
  earth:   0.010,
  mars:    0.008,
  jupiter: 0.004,
  saturn:  0.003,
  uranus:  0.002,
  neptune: 0.001
};

const SPIN_RATES = {
  mercury:  0.004,
  venus:   -0.0015, // retrograde
  earth:    0.02,
  mars:     0.018,
  jupiter:  0.05,
  saturn:   0.045,
  uranus:   0.03,
  neptune:  0.028
};


const MOON_ORBIT_SPEED = 0.04;
let moonPhase = 0;
const moonOrbitRadius = moonPos.x; // relative to Earth


const earthCameraOffset = new THREE.Vector3(15, 15, 15);
const sunCameraOffset = new THREE.Vector3(800, 800, 800);
const mercuryCameraOffset = new THREE.Vector3(20, 15, 20);
const venusCameraOffset = new THREE.Vector3(35, 20, 25);
const marsCameraOffset = new THREE.Vector3(30, 10, 25);
const jupiterCameraOffset = new THREE.Vector3(190, 60, 190);
const saturnCameraOffset = new THREE.Vector3(110, 70, 110);
const uranusCameraOffset = new THREE.Vector3(95, 50, 95);
const neptuneCameraOffset = new THREE.Vector3(85, 45, 85);
const issCameraOffset = new THREE.Vector3(1.5, 1.5, 1.5);
const moonCameraOffset = new THREE.Vector3(10, 10, 15);

const CAMERA_MODE = {
  FREE: "free",
  BODY_FIXED: "body_fixed"
};

let cameraMode = CAMERA_MODE.FREE;

let satellites = [];
let spaceStations = [];
let numSpaceStations = 4;

let objectMap = new Map();

let currentPlanetView = "earth";
const ISS_SCALE = 0.05;
const ISS_ORBIT_RADIUS = earthRadius + 4.5;
const ISS_INCLINATION = THREE.MathUtils.degToRad(55);
let issPhase = 0; // angle along orbit

const _worldPos = new THREE.Vector3();


const ISS_POSITION = { x: earthPos.x + 15, y: earthPos.y + 12, z: earthPos.z };
let iss; 

const GEO_ORBIT_RADIUS = earthRadius + 15; // visually compressed GEO
const GEO_SAT_COUNT = 5;




// ================================
// Initialization
// ================================
function getSunDirection(planetPosition) {
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

function initOrbits() {
  const earthRadius = 8; // use actual Earth radius

  // --- Orbit 1: equatorial ---
  const equatorialOrbit = createOrbitRing(
    earthRadius + 3,
    256,
    0x44aaff
  );
  earth.add(equatorialOrbit);

  // --- Orbit 2: inclined ---
  const inclinedOrbit = createOrbitRing(
    earthRadius + 4.5,
    256,
    0xffaa44
  );
  inclinedOrbit.rotation.z = THREE.MathUtils.degToRad(55); // inclination
  earth.add(inclinedOrbit);

  // --- GEO ring ---
const geoOrbit = createOrbitRing(
  GEO_ORBIT_RADIUS,
  256,
  0xbb66ff
);
earth.add(geoOrbit);

}


function initMoonPositions() {
  for (const obj of moons) {
    const { moon } = obj;

    moon.mesh.position.set(
      moon.orbitRadius * Math.cos(moon.phase),
      0,
      moon.orbitRadius * Math.sin(moon.phase)
    );
  }
}



function createPlanet(radius, color, position) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 48),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.0
    })
  );

  mesh.position.set(position.x, position.y, position.z);
  scene.add(mesh);
  return mesh;
}

function createMoon(radius, color, orbitRadius, orbitSpeed, phase = Math.random() * Math.PI * 2) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      metalness: 0.0
    })
  );

  return {
    mesh,
    orbitRadius,
    orbitSpeed,
    phase
  };
}


function createEarth(radius, position) {
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
  earth.position.set(position.x, position.y, position.z);

  return earth;
}


function createJupiter(radius, position) {
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
   const stormDir = getSunDirection(position); // unit vector
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
  jupiter.position.set(position.x, position.y, position.z);

  return jupiter;
}








function addSaturnRings(saturn, planetRadius) {
  const innerRadius = planetRadius + 10;
  const outerRadius = planetRadius + 30;

  const ringGeometry = new THREE.RingGeometry(
    innerRadius,
    outerRadius,
    128
  );

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xc9b38c,
    side: THREE.DoubleSide,
    roughness: 1.0,
    metalness: 0.0,
    transparent: true,
    opacity: 0.85
  });

  const rings = new THREE.Mesh(ringGeometry, ringMaterial);

  // Tilt rings like real Saturn
  rings.rotation.x = Math.PI / 3;

  // Attach to Saturn
  saturn.add(rings);

  return rings;
}

function addUranusRing(uranus, radius) {
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
  ring.rotation.x = Math.PI / 3;
  // Uranus is tipped almost on its side


  uranus.add(ring);
}

function createNeptune(radius, position) {
  const geometry = new THREE.SphereGeometry(radius, 128, 128);
  const colors = [];
  const pos = geometry.attributes.position;

  const baseColor = new THREE.Color(0x2b4cff);
  const stormColor = new THREE.Color(0x1a2a6c);

  // Direction from Neptune → Sun (unit vector)
  const stormDir = getSunDirection(position);

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
  neptune.position.set(position.x, position.y, position.z);

  return neptune;
}





function initThree() {
  const canvas = document.getElementById("sim-canvas");

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    10000
  );

    camera.position.set(initialCam.x, initialCam.y, 750);
    camera.lookAt(earthPos.x, earthPos.y, earthPos.z);


  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom;
}

function initScene() {

  // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);

    const sunMat = new THREE.MeshStandardMaterial({
        color: 0xffcc55,
        emissive: 0xffaa33,
        emissiveIntensity: 2,
        toneMapped: false
        });


    sun = new THREE.Mesh(
        new THREE.SphereGeometry(sunRadius, 64, 64),
        sunMat
    );

    sun.position.set(0, 0, 0);
    scene.add(sun);




    earth = createEarth(earthRadius, earthPos);
    scene.add(earth);
    earth.rotation.z = 0.41; // 23.5°

    earth.position.set(earthPos.x, earthPos.y, earthPos.z);

    moon = new THREE.Mesh(
    new THREE.SphereGeometry(moonRadius, 32, 32),
    new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.9,
        metalness: 0.0
    })
    );

    moon.position.set(moonPos.x, moonPos.y, moonPos.z);
    earth.add(moon);

    const moonOrbit = createOrbit(moonOrbitRadius, 0x888888);
    earth.add(moonOrbit);



    const sunLight = new THREE.DirectionalLight(0xffffff, 3);
    sunLight.position.set(0, 0, 0);   // position defines direction
    sunLight.target.position.copy(earth.position);
    scene.add(sunLight);
    scene.add(sunLight.target);


  // ---- Extra planets (visual only) ----

    mercury = createPlanet(
    mercuryRadius,
    mercuryColor,
    mercuryPos
    );

    venus = createPlanet(
    venusRadius,
    venusColor,
    venusPos
    );
    venus.rotation.z = 0.03; // ~3°

    mars = createPlanet(
    marsRadius,
    marsColor,
    marsPos
    );
    mars.rotation.z = 0.44;
    // Mars moons
    const phobos = createMoon(0.6, 0x888888, 18, 0.08);
    const deimos = createMoon(0.4, 0xaaaaaa, 28, 0.05);

    mars.add(phobos.mesh);
    mars.add(deimos.mesh);

    moons.push({ parent: mars, moon: phobos });
    moons.push({ parent: mars, moon: deimos });



    jupiter = createJupiter(jupiterRadius, jupiterPos);
    scene.add(jupiter);
    jupiter.rotation.z = 0.05;

    const io = createMoon(1.8, 0xffcc88, 85, 0.03);
    const europa   = createMoon(1.6, 0xe0e0e0, 110, 0.025);
    const ganymede = createMoon(2.4, 0xaaaaaa, 145, 0.02);
    const callisto = createMoon(2.2, 0x888888, 190, 0.015);


    jupiter.add(io.mesh);
    jupiter.add(europa.mesh);
    jupiter.add(ganymede.mesh);
    jupiter.add(callisto.mesh);

    moons.push({ parent: jupiter, moon: io });
    moons.push({ parent: jupiter, moon: europa });
    moons.push({ parent: jupiter, moon: ganymede });
    moons.push({ parent: jupiter, moon: callisto });



    saturn = createPlanet(
    saturnRadius,
    saturnColor,
    saturnPos
    );
    saturn.rotation.z = 0.47;

    addSaturnRings(saturn, saturnRadius);

    const titan = createMoon(2.1, 0xffcc99, 95, 0.02);

    saturn.add(titan.mesh);
    moons.push({ parent: saturn, moon: titan });


    uranus = createPlanet(
    uranusRadius,
    uranusColor,
    uranusPos
    );
    uranus.rotation.x = Math.PI / 2; // ~90°
    uranus.rotation.z = 0.1;

    addUranusRing(uranus, uranusRadius);
    


    neptune = createNeptune(neptuneRadius, neptunePos);
    scene.add(neptune);
    neptune.rotation.z = 0.49;
    const triton = createMoon(1.9, 0xddddff, 65, -0.02); // negative = retrograde

    neptune.add(triton.mesh);
    moons.push({ parent: neptune, moon: triton });


    scene.add(createOrbit(mercuryPos.x, mercuryColor));
    scene.add(createOrbit(venusPos.x, venusColor));
    scene.add(createOrbit(earthPos.x, 0x4caf50)); // Earth orbit in green
    scene.add(createOrbit(marsPos.x, marsColor));
    scene.add(createOrbit(jupiterPos.x, jupiterColor));
    scene.add(createOrbit(saturnPos.x, saturnColor));
    scene.add(createOrbit(uranusPos.x, uranusColor));
    scene.add(createOrbit(neptunePos.x, neptuneColor));



    planets = [
        {
            name: "mercury",
            planet: mercury,
            radius: mercuryPos.x,
            phase: Math.atan2(mercury.position.z, mercury.position.x)
        },
        {
            name: "venus",
            planet: venus,
            radius: venusPos.x,
            phase: Math.atan2(venus.position.z, venus.position.x)
        },
        {
            name: "earth",
            planet: earth,
            radius: earthPos.x,
            phase: Math.atan2(earth.position.z, earth.position.x)
        },
        {
            name: "mars",
            planet: mars,
            radius: marsPos.x,
            phase: Math.atan2(mars.position.z, mars.position.x)
        },
        {
            name: "jupiter",
            planet: jupiter,
            radius: jupiterPos.x,
            phase: Math.atan2(jupiter.position.z, jupiter.position.x)
        },
        {
            name: "saturn",
            planet: saturn,
            radius: saturnPos.x,
            phase: Math.atan2(saturn.position.z, saturn.position.x)
        },
        {
            name: "uranus",
            planet: uranus,
            radius: uranusPos.x,
            phase: Math.atan2(uranus.position.z, uranus.position.x)
        },
        {
            name: "neptune",
            planet: neptune,
            radius: neptunePos.x,
            phase: Math.atan2(neptune.position.z, neptune.position.x)
        }
        ];

    objectMap.set("mercury", [mercury, mercuryCameraOffset]);
    objectMap.set("venus", [venus, venusCameraOffset]);
    objectMap.set("earth", [earth, earthCameraOffset]);
    objectMap.set("mars", [mars, marsCameraOffset]);
    objectMap.set("jupiter", [jupiter, jupiterCameraOffset]);
    objectMap.set("saturn", [saturn, saturnCameraOffset]);
    objectMap.set("uranus", [uranus, uranusCameraOffset]);
    objectMap.set("neptune", [neptune, neptuneCameraOffset]);
    objectMap.set("sun", [sun, sunCameraOffset]);
    objectMap.set("moon", [moon, moonCameraOffset]);
}




function initUI() {
    const controlBar = document.getElementById("control-bar");
    const collapseBtn = document.getElementById("collapse-btn");
    const controlTab = document.getElementById("control-tab");

    collapseBtn.onclick = () => {
        controlBar.classList.add("hidden");
        controlTab.classList.add("visible");
    }

    controlTab.onclick = () => {
        controlBar.classList.remove("hidden");
        controlTab.classList.remove("visible");
        }



    // existing buttons
    document.getElementById("startBtn").onclick = () => {
    isRunning = !isRunning
    document.getElementById("startBtn").textContent = isRunning ? "Pause" : "Start";
    }

    document.getElementById("resetBtn").onclick = resetSimulation;

    // document.getElementById("modeSelect").onchange = e => {
    // setMode(e.target.value);
    // }

    const cameraToggleBtn = document.getElementById("cameraToggle");

    cameraToggleBtn.onclick = () => {
    if (cameraMode === CAMERA_MODE.FREE) {
        cameraMode = CAMERA_MODE.BODY_FIXED;
        cameraToggleBtn.textContent = "Free Camera";
    } else {
        cameraMode = CAMERA_MODE.FREE;
        cameraToggleBtn.textContent = "Close Body View";
    }
    };


    document.getElementById("planetView").onchange = e => {
        currentPlanetView = e.target.value;
        console.log("Switching view to planet:", currentPlanetView);
            
    }

}

// Space station and satellite logic and drawing


// functions to initialize space station modules (core components)

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


///// end of space station module components

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

function setISSOnOrbit() {
  const localPos = new THREE.Vector3(
    ISS_ORBIT_RADIUS * Math.cos(issPhase),
    0,
    ISS_ORBIT_RADIUS * Math.sin(issPhase)
  );

  // rotate into inclined orbital plane
  localPos.applyAxisAngle(
    new THREE.Vector3(0, 0, 1),
    ISS_INCLINATION
  );

  // LOCAL to Earth now
  iss.position.copy(localPos);

  // optional orientation
  iss.lookAt(new THREE.Vector3(0, 0, 0));
}



function initSpaceStations() {
  iss = createISS();

  setISSOnOrbit();

  iss.scale.setScalar(ISS_SCALE);
  iss.rotation.y = Math.PI / 4;

  earth.add(iss);
  objectMap.set("iss", [iss, issCameraOffset]);
}



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

  // Scale
  sat.scale.setScalar(ISS_SCALE*5);

  return sat;
}


function spawnGEOSatellite({ parent, longitude, name }) {
  const sat = createSatelliteMesh();

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
    geo: true // flag: no phase update
  });
}




function spawnSatelliteOnOrbit({
  parent,
  radius,
  phase,
  speed,
  inclination = 0,
  name
}) {

  const mesh = createSatelliteMesh();
  mesh.name = name;
  

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

  satellites.push({
    mesh,
    orbitFrame,
    radius,
    phase,
    speed,
    name
  });

  objectMap.set(name, [mesh, new THREE.Vector3(0.5, 0.5, 0.5)]);

}


function initSatellites() {
  const earthRadius = 8;
  const planetSelect = document.getElementById("planetView");


  // ----- Equatorial ring -----
  for (let i = 0; i < 5; i++) {
    const name = `sat_eq_${i}`;

    spawnSatelliteOnOrbit({
        parent: earth,
        radius: earthRadius + 3,
        phase: (i / 5) * Math.PI * 2,
        speed: 0.2,
        inclination: 0,
        name
    });

    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `Equatorial Leo Sattelite ${i + 1}`;
    planetSelect.appendChild(opt);
    }


  // ----- ISS-like inclined ring -----
    for (let i = 0; i < 4; i++) {
    const name = `sat_inc_${i}`;

    spawnSatelliteOnOrbit({
        parent: earth,
        radius: earthRadius + 4.5,
        phase: (i / 4) * Math.PI * 2,
        speed: 0.18,
        inclination: THREE.MathUtils.degToRad(55),
        name
    });

    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `Inclined LEO Satellite ${i + 1}`;
    planetSelect.appendChild(opt);
    }


    // ----- GEO satellites -----

    for (let i = 0; i < GEO_SAT_COUNT; i++) {
    const lon = (i / GEO_SAT_COUNT) * Math.PI * 2;
    const name = `geo_sat_${i}`;

    spawnGEOSatellite({
        parent: earth,
        longitude: lon,
        name
    });

    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `Equatorial GEO Satellite ${i + 1}`;
    planetSelect.appendChild(opt);
    }


}



// Animation functions below

function updateCamera() {
  const entry = objectMap.get(currentPlanetView);
  if (!entry) return;

  const [targetObj, offset] = entry;

  targetObj.getWorldPosition(_worldPos);

  // ================= FREE =================
  if (cameraMode === "free") {
    controls.enabled = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.enableZoom = true;

    controls.target.copy(_worldPos);
    controls.update();
  }

  // ================= BODY_FIXED =================
  else if (cameraMode === "body_fixed") {
    controls.enabled = false;

    camera.position.copy(_worldPos).add(offset);
    camera.lookAt(_worldPos);
  }



}





// ================================
// Animation loop
// ================================

function updatePlanetPos(dt) {
  // --- Planets orbit the Sun ---
  for (const obj of planets) {
    const { planet, radius, name } = obj;

    // advance orbital phase
    obj.phase += ORBIT_SPEEDS[name] * dt;

    // circular Keplerian orbit in XZ plane
    planet.position.set(
      radius * Math.cos(obj.phase),
      0,
      radius * Math.sin(obj.phase)
    );
  }

  // --- Moon orbits Earth ---
  if (earth && moon) {
    moonPhase += MOON_ORBIT_SPEED * dt;

    moon.position.set(
      moonOrbitRadius * Math.cos(moonPhase),
      0,
      moonOrbitRadius * Math.sin(moonPhase)
    );
  }
}

function updatePlanetSpin(dt) {
  for (const obj of planets) {
    const { planet, name } = obj;

    const spin = SPIN_RATES[name];
    if (!spin) continue;

    planet.rotation.y += spin * dt;
  }
}


function updateMoons(dt) {
  for (const obj of moons) {
    const { moon } = obj;

    moon.phase += moon.orbitSpeed * dt;

    moon.mesh.position.set(
      moon.orbitRadius * Math.cos(moon.phase),
      0,
      moon.orbitRadius * Math.sin(moon.phase)
    );
  }
}

function updateSatellites(dt) {
for (const sat of satellites) {
  if (sat.geo) continue; // GEO sats don't move in inertial frame

  sat.phase += sat.speed * dt;

  sat.mesh.position.set(
    sat.radius * Math.cos(sat.phase),
    0,
    sat.radius * Math.sin(sat.phase)
  );
}

}



function animate(time) {
  const dt = (time - lastTime) * 0.0005;
  lastTime = time;

  if (isRunning) {
  updatePlanetPos(dt);
  updateMoons(dt);
  updatePlanetSpin(dt);
  issPhase += 0.18*dt;
  setISSOnOrbit();
  updateSatellites(dt);
}

    updateCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

}


// ================================
// Simulation logic
// ================================


function resetSimulation() {
  isRunning = false;

  const startBtn = document.getElementById("startBtn");
  startBtn.textContent = "Start";

    camera.position.set(initialCam.x, initialCam.y, 750);
    camera.lookAt(earthPos.x, earthPos.y, earthPos.z);
    moons = [];
    planets = [];
    scene.clear();
    moonPhase = 0;
    currentPlanetView = "earth";
    const planetViewSelect = document.getElementById("planetView");
    planetViewSelect.value = "earth";
    satellites = [];
    objectMap.clear();
    initScene();
    initMoonPositions();
    initSpaceStations();
    initOrbits();
    initSatellites();


  // reset physical state here
}

function setMode(mode) {
  console.log("Control mode:", mode);

  // switch control law here
}


// ================================
// Utilities
// ================================

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


// ================================
// Entry point
// ================================

document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("resize", onResize);
    initThree();
    initScene();
    initMoonPositions();
    initUI();
    initOrbits();// this is only for earth orbits
    initSpaceStations();
    initSatellites();

  lastTime = performance.now();
  requestAnimationFrame(animate);
})