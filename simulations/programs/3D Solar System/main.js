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
let moonPos = { x: 50, y: 0, z: 0 };

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


const earthCameraOffset = new THREE.Vector3(55, 40, 55);
const sunCameraOffset = new THREE.Vector3(800, 800, 800);
const mercuryCameraOffset = new THREE.Vector3(20, 15, 20);
const venusCameraOffset = new THREE.Vector3(35, 20, 25);
const marsCameraOffset = new THREE.Vector3(30, 10, 25);
const jupiterCameraOffset = new THREE.Vector3(190, 60, 190);
const saturnCameraOffset = new THREE.Vector3(110, 70, 110);
const uranusCameraOffset = new THREE.Vector3(95, 50, 95);
const neptuneCameraOffset = new THREE.Vector3(85, 45, 85);

const CAMERA_MODE = {
  FREE: "free",
  EARTH_FIXED: "earth_fixed",
  SATELLITE: "satellite" // later
};

let cameraMode = CAMERA_MODE.FREE;

let satellites = [];
let spaceStations = [];

let planetMap = new Map();

let currentPlanetView = "earth";



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

   const stormColor = new THREE.Color(0xb5533c);

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
  ring.rotation.x = Math.PI / 2;
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
    0.1,
    10000
  );

    camera.position.set(initialCam.x, initialCam.y, 750);
    camera.lookAt(earthPos.x, earthPos.y, earthPos.z);


  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
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

    planetMap.set("mercury", [mercury, mercuryCameraOffset]);
    planetMap.set("venus", [venus, venusCameraOffset]);
    planetMap.set("earth", [earth, earthCameraOffset]);
    planetMap.set("mars", [mars, marsCameraOffset]);
    planetMap.set("jupiter", [jupiter, jupiterCameraOffset]);
    planetMap.set("saturn", [saturn, saturnCameraOffset]);
    planetMap.set("uranus", [uranus, uranusCameraOffset]);
    planetMap.set("neptune", [neptune, neptuneCameraOffset]);
    planetMap.set("sun", [sun, sunCameraOffset]);
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
        cameraMode = CAMERA_MODE.EARTH_FIXED;
        cameraToggleBtn.textContent = "Free Camera";
    } else {
        cameraMode = CAMERA_MODE.FREE;
        cameraToggleBtn.textContent = "Follow Planet";
    }
    };


    document.getElementById("planetView").onchange = e => {
        currentPlanetView = e.target.value;
        console.log("Switching view to planet:", currentPlanetView);
    }

}


function initEvents() {
  window.addEventListener("resize", onResize);

  window.addEventListener("keydown", e => {
    if (e.key === " ") {
      isRunning = !isRunning;
    }
  })
}

function updateCamera() {
    const entry = planetMap.get(currentPlanetView);
    if (!entry) return;

    let [planet, planetOffset] = entry;
    //console.log(planet, planetOffset);
  if (cameraMode === CAMERA_MODE.FREE) {
    // OrbitControls owns the camera
    controls.enableRotate = true;
    controls.enablePan = true;

    controls.target.copy(planet.position);
    controls.update();
  }

  else if (cameraMode === CAMERA_MODE.EARTH_FIXED) {
    // YOU own the camera
    controls.enableRotate = false;
    controls.enablePan = false;

    camera.position.copy(planet.position).add(planetOffset);
    camera.lookAt(planet.position);
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



function animate(time) {
  const dt = (time - lastTime) * 0.005;
  lastTime = time;

  if (isRunning) {
  updatePlanetPos(dt);
  updateMoons(dt);
  updatePlanetSpin(dt);
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
    initScene();
    initMoonPositions();


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
  initThree();
  initScene();
  initMoonPositions();
  initUI();
  initEvents();

  lastTime = performance.now();
  requestAnimationFrame(animate);
})