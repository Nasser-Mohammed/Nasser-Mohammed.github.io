// ================================
// Global state
// ================================
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { initSpaceStation, initSatellites } from "./spaceCrafts.js";
import { initThree, initScene, initOrbits, initMoonPositions, setEarthMoonCamInfo} from "./planetCreation.js";

let scene, camera, renderer;
let controls;

let isRunning = false;
let lastTime = 0;

let earth;
let moon;

let earthRadius;

let planets = [];
let moons = [];



// Real world coordinates
// Sun at origin

let initialCam;

// Inner planets (tighter, but ordered correctly)
let earthPos;

// Outer planets (compressed but proportional)

// Moon (relative to Earth)
let moonPos;

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
let moonOrbitRadius; // relative to Earth


const issCameraOffset = new THREE.Vector3(1.5, 1.5, 1.5);


const CAMERA_MODE = {
  FREE: "free",
  BODY_FIXED: "body_fixed"
};

let cameraMode = CAMERA_MODE.FREE;

let satellites = [];

let objectMap = new Map();

let currentPlanetView = "earth";
const ISS_SCALE = 0.05;
let ISS_ORBIT_RADIUS;
const ISS_INCLINATION = THREE.MathUtils.degToRad(55);
let issPhase = 0; // angle along orbit

const _worldPos = new THREE.Vector3();

let iss; 

let GEO_ORBIT_RADIUS; // visually compressed GEO
const GEO_SAT_COUNT = 15;
const INCLINED_SAT_COUNT = 5;
const EQUATORIAL_SAT_COUNT = 8;
const MIN_SEP = THREE.MathUtils.degToRad(25);


// ================================
// Initialization
// ================================
// syncs common vars from planetCreation.js
function setGlobalVars(){
    [initialCam, earthPos, moonPos, earthRadius] = setEarthMoonCamInfo();
    moonOrbitRadius = moonPos.x;
    ISS_ORBIT_RADIUS = earthRadius + 4.5; // visually compressed LEO
    GEO_ORBIT_RADIUS = earthRadius + 15;
}

function sceneSolarSystemInitialization(){
    ({ scene, camera, renderer, controls } = initThree());
    planets = initScene(scene, objectMap, moons);
    earth = objectMap.get("earth")[0];
    initOrbits(earth, GEO_ORBIT_RADIUS, ISS_ORBIT_RADIUS);
    initMoonPositions(moons);
    //console.log(objectMap);
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
        cameraToggleBtn.textContent = "Up Close and Locked View";
    }
    };


    document.getElementById("planetView").onchange = e => {
        currentPlanetView = e.target.value;
        console.log("Switching view to body:", currentPlanetView);
            
    }

}

// Here we call creation functions through spaceCraft.js
// exposed functions 

function initializeSpaceStation(){
  iss = initSpaceStation(ISS_SCALE, issCameraOffset, objectMap, earth);
  //console.log(iss);
  setISSOnOrbit();
}

function initializeSatellites(){
  initSatellites(earth, earthRadius, INCLINED_SAT_COUNT, EQUATORIAL_SAT_COUNT, GEO_SAT_COUNT, GEO_ORBIT_RADIUS, issPhase, objectMap, satellites, ISS_SCALE, MIN_SEP);
}



///// END OF ISS AND SATELLITE CREATION /////



// ================================
// Animation loop and functions
// ================================

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
    sceneSolarSystemInitialization();
    initializeSpaceStation();
    initializeSatellites();


  // reset physical state here
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
    setGlobalVars();
    sceneSolarSystemInitialization();
    initUI();
    initializeSpaceStation();
    initializeSatellites();
    //initSatellites();

  lastTime = performance.now();
  requestAnimationFrame(animate);
})