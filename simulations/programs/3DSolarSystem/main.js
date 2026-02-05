// ================================
// Global state
// ================================
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { instantiateSatelliteSystems } from "./spaceCraftInit.js";
import { initThree, initScene, setEarthMoonCamInfo} from "./planetCreation.js";

let scene, camera, renderer;
let controls;

let isRunning = false;
let lastTime = 0;

let earth;

let earthRadius;

let planets = [];
let moons = [];

let initialCam;

let earthPos;
let simulationTime = 0;


const PLANET_ORBIT_TIME_SCALE = 5;
const PLANET_SPIN_TIME_SCALE = 1250; 

const MOON_ORBIT_TIME_SCALES = {
  earth:   20000,
  mars:    400,
  jupiter: 10000,
  saturn:  10000,
  uranus:  10000,
  neptune: 25
};

const CAMERA_MODE = {
  FREE: "free",
  BODY_FIXED: "body_fixed"
};

let cameraMode = CAMERA_MODE.FREE;


let objectMap = new Map();

let currentBodyView = "geo_sat_5";
const ISS_SCALE = 0.05;
let ISS_ORBIT_RADIUS;
let issPhase = 0; // angle along orbit

const _worldPos = new THREE.Vector3();

const SUN_DIR_WORLD = new THREE.Vector3(1, 0.2, 0.3).normalize();
const PANEL_NORMAL_LOCAL = new THREE.Vector3(1, 0, 0);

const SUN_POS_WORLD = new THREE.Vector3(1e6, 2e5, 3e5);


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


// ADCS Simulation panel parameters
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

let antennaArrow, targetArrow, errorAxisArrow;

const CAMERA_FRAME = {
  SPIN:  "spin",
  ORBIT: "orbit",
  FIXED: "fixed",
  BODY:  "body"   // satellites
};

let cameraFrameMode = CAMERA_FRAME.FIXED;

const CAMERA_VIEW = {
  FIXED: "fixed",
  SPIN: "spin",
  BODY: "body",
  ONBOARD: "onboard"
};

let cameraViewMode = CAMERA_VIEW.ONBOARD;



// ================================
// Initialization
// ================================
// syncs common vars from planetCreation.js
function setGlobalVars(){
    [initialCam, earthPos, earthRadius] = setEarthMoonCamInfo();
    ISS_ORBIT_RADIUS = earthRadius + 4.5; // visually compressed LEO
    GEO_ORBIT_RADIUS = earthRadius + 15;
}

function sceneSolarSystemInitialization(){
    ({ scene, camera, renderer, controls } = initThree());
    planets = initScene(scene, objectMap, moons); // now we can grab earth here
    earth = planets.find(p => p.name === "earth");
    antennaArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(),
      4,
      0xff3333
    );
    scene.add(antennaArrow);

    targetArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(),
      4,
      0x33ff33
    );
    scene.add(targetArrow);

    errorAxisArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(),
      3,
      0x3399ff
    );
    scene.add(errorAxisArrow);

}

//// HELPERS // ADCS VISIBILITY ////



function renderADCSHeader() {
  const title = document.getElementById("adcs-title");
  if (!title) return;

  title.textContent = `ADCS — ${currentBodyView.toUpperCase()}`;
}


function getActiveADCS() {
  const entry = objectMap.get(currentBodyView);
  if (!entry) return null;

  // Look for ADCS on the physics frame first, fallback to the main frame
  const adcsFrame = entry.body?.physics || entry.body?.frame;
  return adcsFrame?.adcs || null;
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
    `${err.toFixed(2)} rad`;

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

  // === FIXED PHYSICAL SCALE ===
  const MAX_ERR = Math.PI; // 180 deg
  const MIN_ERR = 0;

  const scaleY = val =>
    h - (THREE.MathUtils.clamp(val, MIN_ERR, MAX_ERR) / MAX_ERR) * h;

  // === GRID (optional but highly recommended) ===
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;

  for (let i = 1; i < 4; i++) {
    const y = (i / 4) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // === ERROR TRACE ===
  ctx.strokeStyle = "#ff5c5c";
  ctx.lineWidth = 1.6;
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
    adcs.controlEffort.toFixed(1);
    controlEffortReadout.style.color =
  adcs.controlEffort < 0.3 ? "#6ee27d" :
  adcs.controlEffort < 0.7 ? "#f0c674" :
                             "#ff6b6b";

  if (!adcs.enabled) {
  controlEffortReadout.textContent = "OFF";
  controlEffortReadout.style.color = "#777";
  return;
}


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

function renderRotationViz(adcs) {
  if (!adcs || !rotAxes) return;

  rotAxes.quaternion.copy(
    adcs._bodyFrame.getWorldQuaternion(new THREE.Quaternion())
  );

  rotRenderer.render(rotScene, rotCamera);
}


function updateOmegaADCS(bodyFrame, dt) {
    const adcs = bodyFrame.adcs;
    if (!adcs || !adcs.enabled) return;

    const targetDir = getTargetWorldDir(bodyFrame, adcs.target);
    if (!targetDir) return;

    const errorAxis = computeAttitudeErrorVector(bodyFrame, targetDir);
    if (!errorAxis) return;

    const KP = 6.0;   
    const KD = 2.5;   
    const MAX_RATE = 0.6; 

    // 1. Calculate Desired Angular Velocity (Proportional)
    const omegaDesired = errorAxis.clone().multiplyScalar(
      Math.min(KP * adcs.attitudeError, MAX_RATE)
    );

    // 2. PD Tracking Torque (Proportional - Derivative)
    // This naturally includes damping because we subtract the current omega
    const torque = omegaDesired
      .clone()
      .sub(adcs.omega)
      .multiplyScalar(KD);

    // 3. ADD PERTURBATION (Disturbance Torque)
    // Simulates solar pressure and tiny mechanical vibrations
    const perturbationStrength = 0.115; 
    const noise = new THREE.Vector3(
      (2 * Math.random() - 1) * perturbationStrength,
      (2 * Math.random() - 1) * perturbationStrength,
      (2 * Math.random() - 1) * perturbationStrength
    );
    torque.add(noise);

    // 4. Integrate total torque into angular velocity
    adcs.omega.addScaledVector(torque, dt);

    // 5. Numerical safety (Friction/Decay)
    adcs.omega.multiplyScalar(0.995);
}


function renderOmega(adcs) {
  if (!adcs || !omegaReadout) return;

  const w = adcs.omega;

  omegaReadout.textContent =
    `[${w.x.toFixed(1)}, ${w.y.toFixed(1)}, ${w.z.toFixed(1)}]`;

  // Optional: color by magnitude
  const mag = w.length();
  omegaReadout.style.color =
    mag < 0.01 ? "#6ee27d" :
    mag < 0.03 ? "#f0c674" :
                 "#ff6b6b";
}

function renderADCSTarget(adcs) {
  const sysEl = document.getElementById("adcs-system-status");
  const attEl = document.getElementById("adcs-attitude-status");
  if (!adcs || !sysEl || !attEl) return;

  // reset
  sysEl.className = "";
  attEl.className = "";

  // ===== SYSTEM =====
  if (adcs.powerState === "ACTIVE") {
    sysEl.textContent = "ONLINE";
    sysEl.classList.add("adcs-online");
  } else {
    sysEl.textContent = "OFFLINE";
    sysEl.classList.add("adcs-offline");

    // offline → attitude meaningless
    attEl.textContent = "—";
    return;
  }

  // ===== ATTITUDE =====
  if (adcs.attitudeLocked) {
    attEl.textContent = "STABILIZED";
    attEl.classList.add("adcs-stable");
  } else {
    attEl.textContent = "UNSTABLE";
    attEl.classList.add("adcs-unstable");
  }
}



function setADCSStatusMessage(adcs, msg, type = "error", duration = 2500) {
  const el = document.getElementById("adcs-status");
  if (!el) return;

  el.textContent = msg;
  el.classList.remove("hidden", "error", "success", "locked");
  el.classList.add(type);

  if (adcs._statusTimeout) {
    clearTimeout(adcs._statusTimeout);
  }

  adcs._statusTimeout = setTimeout(() => {
    el.classList.add("hidden");
  }, duration);
}








function updateControlEffortADCS(adcs, dt) {
  // HARD GATE: no power, no control
  if (!adcs.enabled || adcs.powerState !== "ACTIVE") {
    adcs.controlEffort = 0;

    adcs.effortHistory.push(0);
    if (adcs.effortHistory.length > 200) {
      adcs.effortHistory.shift();
    }
    return;
  }

  const KP = 6.0;
  const KD = 2.5;

  const err = adcs.attitudeError;
  const omegaMag = adcs.omega.length();

  const u = KP * err - KD * omegaMag;

  adcs.controlEffort = THREE.MathUtils.clamp(u, 0, 1);

  adcs.effortHistory.push(adcs.controlEffort);
  if (adcs.effortHistory.length > 200) {
    adcs.effortHistory.shift();
  }
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

    const cameraViewSelect = document.getElementById("cameraView");
      cameraViewSelect.onchange = e => {
      cameraViewMode = e.target.value;
      console.log("Camera view mode set to", cameraViewMode);
      };



    const planetViewSelect = document.getElementById("planetView");
    //const adcsPanel = document.getElementById("adcs-panel");

  planetViewSelect.onchange = e => {
  currentBodyView = e.target.value;
  updateADCSVisibility(currentBodyView);

  // clear stale message
  const el = document.getElementById("adcs-status");
  if (el) el.classList.add("hidden");
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


// ================================
// Animation loop and functions
// ================================

function updateCamera() {
  const entry = objectMap.get(currentBodyView);
  if (!entry) return;

  const targetBody = entry.body.frame;
  const worldPos = new THREE.Vector3();
  const worldQuat = new THREE.Quaternion();
  
  targetBody.getWorldPosition(worldPos);
  targetBody.getWorldQuaternion(worldQuat);

  switch (cameraViewMode) {
    case "body": // FREE VIEW (OrbitControls)
      controls.enabled = true;
      controls.target.copy(worldPos);
      controls.update();
      break;

    case "spin": // ORBITING VIEW (Auto-rotation)
      controls.enabled = false;
      const time = performance.now() * 0.0005;
      
      // Use the 'spin' property from the map
      // Fallback to a distance of 5 for satellites if not specified
      const spinDist = entry.spin?.offset 
        ? entry.spin.offset.length() 
        : (entry.radius || 5) * 3;
      
      camera.position.set(
        worldPos.x + Math.cos(time) * spinDist,
        worldPos.y + (spinDist * 0.4),
        worldPos.z + Math.sin(time) * spinDist
      );
      camera.lookAt(worldPos);
      break;

    case "fixed": // FIXED VECTOR (Rigidly attached to satellite orientation)
      controls.enabled = false;
      let fixedOffset;

      if (entry.fixed && entry.fixed.offset) {
        fixedOffset = entry.fixed.offset.clone();
      } else {
        // Fallback for planets/objects without a 'fixed' entry
        const d = entry.radius ? entry.radius * 3 : 50;
        fixedOffset = new THREE.Vector3(0, d * 0.2, d);
      }

      // This is the key: it rotates the offset with the satellite
      camera.position.copy(worldPos).add(fixedOffset.applyQuaternion(worldQuat));
      camera.lookAt(worldPos);
      break;

    case "onboard": // FIRST PERSON (Looking out from the satellite)
      controls.enabled = false;
      if (entry.onboard && entry.onboard.frame) {
        const onboardFrame = entry.onboard.frame;
        onboardFrame.getWorldPosition(worldPos);
        onboardFrame.getWorldQuaternion(worldQuat);
        
        camera.position.copy(worldPos);
        camera.quaternion.copy(worldQuat);
      } else {
  // FALLBACK: "Surface" view for planets/bodies (and the Sun)
  const surfaceDist = (entry.radius || 20) * 1.1;
  const slowTime = simulationTime * 0.1; 
  
  // 1. Position the camera on the shell of the object
  const camX = worldPos.x + Math.cos(slowTime) * surfaceDist;
  const camY = worldPos.y + (surfaceDist * 0.1);
  const camZ = worldPos.z + Math.sin(slowTime) * surfaceDist;
  camera.position.set(camX, camY, camZ);

  if (currentBodyView === "neptune") {
    // Neptune looks back at the inner solar system (the Sun/Origin)
    camera.lookAt(0, 0, 0);
  } 
  else if (currentBodyView === "sun") {
    // The Sun looks directly at Earth
    // We get Earth's world position from the objectMap
    const earthEntry = objectMap.get("earth");
    if (earthEntry) {
      const earthPos = new THREE.Vector3();
      earthEntry.body.frame.getWorldPosition(earthPos);
      camera.lookAt(earthPos);
    } else {
      camera.lookAt(0, 0, 0); // Safety fallback
    }
  } 
  else {
    // Other planets look "OUT" into the void/starfield
    const lookTarget = new THREE.Vector3()
      .subVectors(camera.position, worldPos) 
      .normalize()
      .multiplyScalar(100) 
      .add(camera.position);

    camera.lookAt(lookTarget);
  }
}
  break;
  }
}





function computeSolarEfficiency(bodyFrame) {
  const panelNormalWorld = PANEL_NORMAL_LOCAL
    .clone()
    .applyQuaternion(
      bodyFrame.getWorldQuaternion(new THREE.Quaternion())
    )
    .normalize();

  const sunDir = SUN_DIR_WORLD.clone().normalize();

  return Math.max(panelNormalWorld.dot(sunDir), 0);
}


function isInEarthShadow(bodyFrame) {
  const satPos = new THREE.Vector3();
  bodyFrame.getWorldPosition(satPos);

  const earthPos = earth.axialFrame.getWorldPosition(new THREE.Vector3());

  const satToEarth = earthPos.clone().sub(satPos);
  const satToSun   = SUN_DIR_WORLD.clone().negate();

  const proj = satToEarth.dot(satToSun);
  if (proj < 0) return false; // Sun is behind satellite

  const closestDistSq =
    satToEarth.lengthSq() - proj * proj;

  return closestDistSq < earthRadius * earthRadius;
}

function computeAttitudeErrorVector(bodyFrame, targetDirWorld) {
  const antennaDir = getAntennaWorldDir(bodyFrame);
  if (!antennaDir) return null;

  const dot = THREE.MathUtils.clamp(
    antennaDir.dot(targetDirWorld),
    -1, 1
  );

  // === 180° singularity handling ===
  if (dot < -0.999) {
    // pick any axis perpendicular to antenna
    const fallback = Math.abs(antennaDir.x) < 0.9
      ? new THREE.Vector3(1, 0, 0)
      : new THREE.Vector3(0, 1, 0);

    const axisWorld = new THREE.Vector3()
      .crossVectors(antennaDir, fallback)
      .normalize();

    return axisWorld
      .applyQuaternion(
        bodyFrame.getWorldQuaternion(new THREE.Quaternion()).invert()
      );
  }

  // === normal case ===
  const axisWorld = new THREE.Vector3()
    .crossVectors(antennaDir, targetDirWorld);

  if (axisWorld.lengthSq() < 1e-8) return null;

  axisWorld.normalize();

  return axisWorld
    .applyQuaternion(
      bodyFrame.getWorldQuaternion(new THREE.Quaternion()).invert()
    );
}





function computePointingError(bodyFrame) {
  const adcs = bodyFrame.adcs;
  if (!adcs) return;

  const antennaDir = getAntennaWorldDir(bodyFrame);
  const targetDir  = getTargetWorldDir(bodyFrame, adcs.target);
  if (!targetDir) return;

  const cosErr = THREE.MathUtils.clamp(
    antennaDir.dot(targetDir),
    -1,
    1
  );

  adcs.attitudeError = Math.acos(cosErr); // radians

  // ===== DEBUG LOG (once per second) =====
  if (!adcs._dbg || performance.now() - adcs._dbg > 1000) {
    adcs._dbg = performance.now();
    // console.log(
    //   `[${bodyFrame.name || "sat"}] error =`,
    //   THREE.MathUtils.radToDeg(adcs.attitudeError).toFixed(2),
    //   "deg"
    // );
  }
}






function updateAttitudeErrorADCS(adcs, dt) {
  if (!adcs) return;

  // Optional: low-pass filter to avoid jitter
  const TAU = 0.15; // seconds
  const alpha = 1 - Math.exp(-dt / TAU);

  if (adcs._filteredError === undefined) {
    adcs._filteredError = adcs.attitudeError;
  }

  adcs._filteredError +=
    alpha * (adcs.attitudeError - adcs._filteredError);

  adcs.attitudeError = adcs._filteredError;

  // Noise floor (real sensors never read zero)
  adcs.attitudeError = Math.max(adcs.attitudeError, 1e-4);

  // History for UI
  adcs.errorHistory.push(adcs.attitudeError);
  if (adcs.errorHistory.length > 200) {
    adcs.errorHistory.shift();
  }
  // ===============================
  // Attitude lock detection
  // ===============================
  const LOCK_THRESHOLD = 0.03;    // ~1.7°
  const UNLOCK_THRESHOLD = 0.06;  // hysteresis

  if (
      adcs.powerState === "ACTIVE" &&
      !adcs.attitudeLocked &&
      adcs.attitudeError < LOCK_THRESHOLD
    ) {
      adcs.attitudeLocked = true;
    }

    if (adcs.attitudeLocked && adcs.attitudeError > UNLOCK_THRESHOLD) {
      adcs.attitudeLocked = false;
    }


}


function isActiveView(bodyFrame) {
  const entry = objectMap.get(currentBodyView);
  if (!entry) return false;

  // Check if the frame being updated (bodyFrame) matches 
  // either the main frame OR the physics frame in the map
  return (entry.body?.frame === bodyFrame || entry.body?.physics === bodyFrame);
}


function updateBatteryADCS(bodyFrame, dt) {
    const adcs = bodyFrame.adcs;
    if (!adcs) return;

    const BASE_DRAIN   = 0.11;
    const CTRL_DRAIN   = 0.1;
    const SOLAR_CHARGE = 0.1;

    const DEAD_CUTOFF   = 0.01;
    const RESTART_LEVEL = 0.80;

    // --- solar ---
    let solarInput = 0;
    if (!isInEarthShadow(bodyFrame)) {
      solarInput = SOLAR_CHARGE * computeSolarEfficiency(bodyFrame);
    }
    solarInput = SOLAR_CHARGE;

    // --- drain ---
    let drain = 0;
    if (adcs.powerState === "ACTIVE") {
      drain = BASE_DRAIN + CTRL_DRAIN * adcs.controlEffort;
    }

    // Offline then no drain

    // --- integrate battery ---
    adcs.battery = THREE.MathUtils.clamp(
      adcs.battery + (solarInput - drain) * dt,
      0,
      1
    );

    adcs.charging = solarInput >= drain;

    // ==================================================
    // STATE TRANSITIONS (EDGE TRIGGERED)
    // ==================================================

    // ACTIVE → SAFE
    if (
      adcs._lastPowerState === "ACTIVE" &&
      adcs.battery < DEAD_CUTOFF
    ) {
      adcs.powerState = "SAFE";
      adcs.enabled = false;
      adcs.attitudeLocked = false;

      // induce tumble
        adcs.omega.set(
          (Math.random() - 0.5) * 6, 
          (Math.random() - 0.5) * 6, 
          (Math.random() - 0.5) * 6
      );

      if (isActiveView(bodyFrame)) {
        setADCSStatusMessage(
          adcs,
          "ONBOARD SYSTEMS DOWN — TUMBLING",
          "error",
          5000
        );
      }

    }

    // SAFE → ACTIVE
    if (
      adcs._lastPowerState === "SAFE" &&
      adcs.battery >= RESTART_LEVEL
    ) {
      adcs.powerState = "ACTIVE";
      adcs.enabled = true;

      adcs.omega.multiplyScalar(0.2);

      if (isActiveView(bodyFrame)) {
        setADCSStatusMessage(
          adcs,
          "SATELLITE BACK ONLINE — ATTITUDE STABILIZING",
          "success",
          5000
        );
      }
    }

    // --- update memory LAST ---
    adcs._lastPowerState = adcs.powerState;
  }







function updateAllADCS(dt) {
  for (const entry of objectMap.values()) {
    // Target the physics frame specifically
    const bodyFrame = entry.body?.physics; 
    if (!bodyFrame?.adcs) continue;

    computePointingError(bodyFrame);
    updateAttitudeErrorADCS(bodyFrame.adcs, dt);
    updateControlEffortADCS(bodyFrame.adcs, dt);
    updateOmegaADCS(bodyFrame, dt);
    updateBatteryADCS(bodyFrame, dt);
  }
}



function getTargetWorldDir(bodyFrame, target) {
  const bodyPos = new THREE.Vector3();
  bodyFrame.getWorldPosition(bodyPos);

  switch (target) {
    case "earth": {
      const earthWorldPos = new THREE.Vector3();
      earth.axialFrame.getWorldPosition(earthWorldPos);
      return earthWorldPos.sub(bodyPos).normalize();
    }

    case "sun": {
      return SUN_POS_WORLD.clone().sub(bodyPos).normalize();
    }


    case "moon": {
      const moon = moons.find(m => m.planet === "earth");
      if (!moon) return null;
      const moonPos = new THREE.Vector3();
      moon.mesh.getWorldPosition(moonPos);
      return moonPos.sub(bodyPos).normalize();
    }

    default:
      return null;
  }
}




function getAntennaWorldDir(bodyFrame) {
  // Antenna forward is +Z in BODY frame
  const ANTENNA_BODY = new THREE.Vector3(0, 0, 1);

  return ANTENNA_BODY
    .clone()
    .applyQuaternion(
      bodyFrame.getWorldQuaternion(new THREE.Quaternion())
    )
    .normalize();
}










function updateSatellites(dt) {
  scene.traverse(obj => {
    if (!obj.userData.isSatelliteOrbit) return;

    // 1. Orbital motion (cage)
    obj.rotation.y += obj.userData.orbitSpeed * dt;

    // 2. Attitude motion (body frame)
    const bodyFrame = obj.userData.bodyFrame;
    if (!bodyFrame?.adcs) return;

    const w = bodyFrame.adcs.omega;
    const wmag = w.length();
    if (wmag < 1e-8) return;

    const axis = w.clone().normalize();
    const angle = wmag * dt;

    const dq = new THREE.Quaternion().setFromAxisAngle(axis, angle);
    bodyFrame.quaternion.multiply(dq).normalize();
  });
}



function updateOrbits(dt) {
  for (const p of planets) {
    const dtheta = p.orbitSpeed * dt;

    // yearly motion
    p.orbitFrame.rotation.y += dtheta;

    // cancel orbital rotation for axial tilt
    if (p.axialFrame) {
      p.axialFrame.rotation.y -= dtheta;
    }
  }
}


function updatePlanetSpin(dt) {
  for (const p of planets) {
    p.spinFrame.rotation.y += p.spinSpeed *PLANET_SPIN_TIME_SCALE *dt;
  }
}

function updateMoons(dt) {
  for (const obj of moons) {
    obj.moonFrame.rotation.y +=
      obj.orbitSpeed * MOON_ORBIT_TIME_SCALES[obj.planet] * dt;
  }
}


function animate(time) {
  const dt = (time - lastTime) * 0.0005;
  lastTime = time;

  if (isRunning) {
  simulationTime += dt;
  updateAllADCS(dt);
  updateOrbits(dt);
  updateMoons(dt);
  updatePlanetSpin(dt);
  updateSatellites(dt);
  issPhase += 0.18*dt;
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
  window.location.reload();
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
    instantiateSatelliteSystems({
      axialFrame: earth.axialFrame,
      spinFrame: earth.spinFrame,
      bodyRadius: earthRadius,
      scale: ISS_SCALE,
      basePhase: issPhase,
      objectMap
    });
    updateADCSVisibility(currentBodyView);

  lastTime = performance.now();
  requestAnimationFrame(animate);
})