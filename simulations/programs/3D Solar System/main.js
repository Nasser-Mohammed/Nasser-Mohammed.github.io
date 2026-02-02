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

let currentPlanetView = "iss";
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

export const simState = {
  timeScale: 1,
  paused: false,
  activeTarget: null,
  controlMode: "manual", // "manual" | "hold" | "autopilot"
  thrust: 0
};

const ADCS_TIME_SCALE = 0.1; // slower than orbital motion so it's easier on the eyes
let batteryFill, batteryText, batteryCharge;
let attitudeErrorReadout;
let errorGraphCanvas, errorGraphCtx;
let controlEffortReadout;
let effortGraphCanvas, effortGraphCtx;
let rotScene, rotCamera, rotRenderer;
let rotAxes;
let omegaReadout;
let adcsTargetReadout;



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

//// HELPERS // ADCS VISIBILITY ////

function renderADCSHeader() {
  const title = document.getElementById("adcs-title");
  if (!title) return;

  title.textContent = `ADCS — ${currentPlanetView.toUpperCase()}`;
}


function getActiveADCS() {
  if (currentPlanetView === "iss") return iss?.adcs;

  const sat = satellites.find(s => s.name === currentPlanetView);
  return sat?.adcs;
}


  function isSpacecraftTarget(id) {
    return id === "iss" || id.startsWith("sat_") || id.startsWith("geo");
  }

  function updateADCSVisibility(target, adcsPanel=document.getElementById("adcs-panel")) {
    adcsPanel.classList.toggle("hidden", !isSpacecraftTarget(target));
  }

  function renderBatteryPanel(adcs) {
  if (!adcs) return;

  const pct = Math.round(adcs.battery * 100);

  batteryFill.style.width = `${pct}%`;
  batteryText.textContent = `${pct}%`;

  // Charging state
  batteryCharge.textContent = adcs.charging ? "CHARGING" : "DISCHARGING";
  batteryCharge.className = "battery-charge " +
    (adcs.charging ? "charging" : "discharging");

  // Color by level
  batteryFill.classList.remove("nominal", "warning", "critical");

  if (pct > 40) batteryFill.classList.add("nominal");
  else if (pct > 15) batteryFill.classList.add("warning");
  else batteryFill.classList.add("critical");
}

function renderAttitudeError(adcs) {
  if (!adcs || !attitudeErrorReadout) return;

  const err = adcs.attitudeError;

  attitudeErrorReadout.textContent =
    `${err.toFixed(4)} rad`;

  // Reset classes
  attitudeErrorReadout.classList.remove("blink-critical");

  if (err < 0.1) {
    attitudeErrorReadout.style.color = "#6ee27d"; // green
  }
  else if (err < 0.5) {
    attitudeErrorReadout.style.color = "#f0c674"; // yellow
  }
  else {
    attitudeErrorReadout.style.color = "#ff6b6b"; // red
    attitudeErrorReadout.classList.add("blink-critical");
  }
}



function renderAttitudeErrorGraph(adcs) {
  if (!adcs || !errorGraphCtx) return;

  const ctx = errorGraphCtx;
  const w = errorGraphCanvas.width;
  const h = errorGraphCanvas.height;

  ctx.clearRect(0, 0, w, h);

  const data = adcs.errorHistory;
  if (data.length < 2) return;

  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);

  const scaleY = val =>
    h - ((val - minVal) / (maxVal - minVal + 1e-6)) * h;

  ctx.strokeStyle = "#ff5c5c";

  ctx.lineWidth = 1;
  ctx.beginPath();

  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = scaleY(val);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();
}

function renderControlEffort(adcs) {
  if (!adcs || !controlEffortReadout) return;

  controlEffortReadout.textContent =
    adcs.controlEffort.toFixed(3);
    controlEffortReadout.style.color =
  adcs.controlEffort < 0.3 ? "#6ee27d" :
  adcs.controlEffort < 0.7 ? "#f0c674" :
                             "#ff6b6b";

}

function renderControlEffortGraph(adcs) {
  if (!adcs || !effortGraphCtx) return;

  const ctx = effortGraphCtx;
  const w = effortGraphCanvas.width;
  const h = effortGraphCanvas.height;

  ctx.clearRect(0, 0, w, h);

  const data = adcs.effortHistory;
  if (data.length < 2) return;

  ctx.strokeStyle = "#f0c674"; // amber = control activity
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - val * h; // effort is already [0,1]
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();
}

function initRotationViz() {
  const canvas = document.getElementById("rotation-canvas");
  if (!canvas) return;

  rotScene = new THREE.Scene();

  rotCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
  rotCamera.position.set(1.9, 1.2, 1.9);
  rotCamera.position.multiplyScalar(1.15);
  rotCamera.lookAt(0, 0, 0);



  rotRenderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });
  rotRenderer.setSize(80, 80, false);

  // Axes helper (this is the monster)
  rotAxes = new THREE.Group();

  const xArrow = new THREE.ArrowHelper(
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 0, 0),
  1.3,
  0xff2222,   // bright red
  0.25,
  0.12
  );

  const yArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 0),
    1.3,
    0x22ff22,   // bright green
    0.25,
    0.12
  );

  const zArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, 0),
    1.3,
    0x3399ff,   // bright blue
    0.25,
    0.12
  );



  rotAxes.add(xArrow, yArrow, zArrow);
  rotScene.add(rotAxes);


  const body = new THREE.Mesh(
  new THREE.SphereGeometry(0.18, 20, 20),
  new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    roughness: 0.5,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85
    })
  );
  rotScene.add(body);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3, 4, 5);
    rotScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-3, -2, 1);
    rotScene.add(fillLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    rotScene.add(ambient);


    const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.035, 16, 64),
    new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9
    })
  );
  ring.rotation.x = Math.PI / 2;
  rotScene.add(ring);

  const ring2 = ring.clone();
  ring2.scale.setScalar(1.12);
  ring2.material = ring.material.clone();
  ring2.material.opacity = 0.35;
  ring2.material.transparent = true;
  rotScene.add(ring2);



  rotScene.add(rotAxes);
}

function renderRotationViz(adcs, dt) {
  if (!adcs || !rotAxes) return;

  const ω = adcs.omega;

  // small-angle rotation per frame
  rotAxes.rotation.x += ω.x * dt;
  rotAxes.rotation.y += ω.y * dt;
  rotAxes.rotation.z += ω.z * dt;

  rotRenderer.render(rotScene, rotCamera);
}

function updateOmegaADCS(adcs, dt) {
  if (!adcs) return;

  const DAMPING_GAIN = 2.0;
  const NOISE = 0.0003;

  const decay = Math.exp(-DAMPING_GAIN * adcs.controlEffort * dt);
  adcs.omega.multiplyScalar(decay);

  // background disturbance
  adcs.omega.x += NOISE * (Math.random() - 0.5);
  adcs.omega.y += NOISE * (Math.random() - 0.5);
  adcs.omega.z += NOISE * (Math.random() - 0.5);
}

function renderOmega(adcs) {
  if (!adcs || !omegaReadout) return;

  const ω = adcs.omega;

  omegaReadout.textContent =
    `[${ω.x.toFixed(3)}, ${ω.y.toFixed(3)}, ${ω.z.toFixed(3)}]`;

  // Optional: color by magnitude
  const mag = ω.length();
  omegaReadout.style.color =
    mag < 0.01 ? "#6ee27d" :
    mag < 0.03 ? "#f0c674" :
                 "#ff6b6b";
}

function renderADCSTarget(adcs) {
  if (!adcs || !adcsTargetReadout) return;

  const label = adcs.target.toUpperCase();
  adcsTargetReadout.textContent = label;

  // Optional semantic coloring
  adcsTargetReadout.style.color =
    adcs.target === "sun"   ? "#f0c674" :
    adcs.target === "earth" ? "#6ee27d" :
    adcs.target === "moon"  ? "#9fd3ff" :
                              "#d6dbe0";
}

  //////////////////////////////

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


    const planetViewSelect = document.getElementById("planetView");
    //const adcsPanel = document.getElementById("adcs-panel");

  planetViewSelect.onchange = e => {
    currentPlanetView = e.target.value;
    console.log("Switching view to body:", currentPlanetView);

    updateADCSVisibility(currentPlanetView);
  };

  // Initial visibility on load
  updateADCSVisibility(planetViewSelect.value);
  batteryFill   = document.querySelector(".battery-fill");
  batteryText   = document.querySelector(".battery-readout");
  batteryCharge = document.querySelector(".battery-charge");
  attitudeErrorReadout = document.getElementById("attitude-error-readout");
  errorGraphCanvas = document.getElementById("attitude-error-graph");
  errorGraphCtx = errorGraphCanvas?.getContext("2d");
  controlEffortReadout = document.getElementById("control-effort-readout");
  effortGraphCanvas = document.getElementById("control-effort-graph");
  effortGraphCtx = effortGraphCanvas?.getContext("2d");
  omegaReadout = document.getElementById("omega-readout");
  adcsTargetReadout = document.getElementById("adcs-target-readout");
  initRotationViz();

}

// Here we call creation functions through spaceCraft.js
// exposed functions 

function initializeSpaceStation(){
  iss = initSpaceStation(ISS_SCALE, issCameraOffset, objectMap, earth);
  //console.log(iss.adcs);
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

function updateAttitudeErrorADCS(adcs, dt) {
  if (!adcs) return;

  // initialize modal phases once
  if (!adcs._phase1) {
    adcs._phase1 = Math.random() * Math.PI * 2;
    adcs._phase2 = Math.random() * Math.PI * 2;
    adcs._phase3 = Math.random() * Math.PI * 2;
  }

  // frequencies (rad/s, fake but reasonable)
  const w1 = 0.2;
  const w2 = 1.1;
  const w3 = 1.3;

  const t = dt * ADCS_TIME_SCALE;

  adcs._phase1 += w1 * t;
  adcs._phase2 += w2 * t;
  adcs._phase3 += w3 * t;

  const decay = Math.exp(-0.35 * t);


  // modal sum (decaying oscillation)
  const error =
      0.6 * Math.sin(adcs._phase1) +
      0.3 * Math.cos(adcs._phase2) +
      0.1 * Math.sin(adcs._phase3);

  adcs.attitudeError = Math.abs(error) * decay + 1e-4;

  // history
  adcs.errorHistory.push(adcs.attitudeError);
  if (adcs.errorHistory.length > 200) {
    adcs.errorHistory.shift();
  }
}


function updateControlEffortADCS(adcs) {
  if (!adcs) return;

  // simple nonlinear effort model
  const k = 4.0; // gain
  adcs.controlEffort = Math.tanh(k * adcs.attitudeError);

  // history
  adcs.effortHistory.push(adcs.controlEffort);
  if (adcs.effortHistory.length > 200) {
    adcs.effortHistory.shift();
  }
}



  function updateBatteryADCS(adcs, dt) {
  if (!adcs) return;

  const chargeRate = 0.03;
  const drainRate  = 0.015;

  adcs.battery += (adcs.charging ? chargeRate : -drainRate) * dt;
  adcs.battery = Math.max(0, Math.min(1, adcs.battery));

  // Fake charging toggle (placeholder)
  if (Math.random() < 0.002) {
    adcs.charging = !adcs.charging;
  }
}

function updateAllADCS(dt) {
  if (iss?.adcs) {
    updateBatteryADCS(iss.adcs, dt);
    updateAttitudeErrorADCS(iss.adcs, dt);
    updateControlEffortADCS(iss.adcs);
    updateOmegaADCS(iss.adcs, dt);


  }

  for (const sat of satellites) {
    updateBatteryADCS(sat.adcs, dt);
    updateAttitudeErrorADCS(sat.adcs, dt);
    updateControlEffortADCS(sat.adcs);
    updateOmegaADCS(sat.adcs, dt);


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
  updateAllADCS(dt);
  updatePlanetPos(dt);
  updateMoons(dt);
  updatePlanetSpin(dt);
  issPhase += 0.18*dt;
  setISSOnOrbit();
  updateSatellites(dt);
}

    const activeADCS = getActiveADCS();
    renderADCSTarget(activeADCS);
    renderBatteryPanel(activeADCS);
    renderAttitudeError(activeADCS);
    renderAttitudeErrorGraph(activeADCS);
    renderControlEffort(activeADCS);
    renderControlEffortGraph(activeADCS);
    renderOmega(activeADCS);
    renderRotationViz(activeADCS, dt);

    renderADCSHeader();
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