import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { createKesslerSystem, createStarfield, createSun } from "./planetCreation.js"
import { createPlayerShip } from "./shipAssembly.js";
import { StateEstimator } from "./estimator.js";



let scene, camera, renderer, controls;
let isRunning = true;
let lastTime = 0;
let canvas;

// Declare ALL globals here so updatePhysics can see them
let instancedMeshes, instancedModules, debrisData, modulesData; 
let isStabilized = false; // for rocking
let shipDrift = new THREE.Vector3(0, 0, 0);
let earthFrame;
let earth;

let playerShip, shipCameraPoint;

const CAMERA_VIEW = { FREE: "body", ONBOARD: "onboard" };
let cameraViewMode = CAMERA_VIEW.ONBOARD;

const _tmpPos = new THREE.Vector3();
const _tmpQuat = new THREE.Quaternion();
const _dummy = new THREE.Object3D();

const keys = new Set();




// ship translation state
let shipVel = new THREE.Vector3();

// simple attitude drift (for “unstable” mode)
let shipAngVel = new THREE.Vector3(); // local rad/s

// toggles
let attitudeStabilization = false; // start on or off,  user call

// tuning
const SHIP_ACCEL = 40;
const SHIP_DAMP_ON  = 2.2;  // stabilization on: more “assisted”
const SHIP_DAMP_OFF = 0.25; // stabilization off: drifty



let mouseLocked = false;


const MOUSE_SENS = 0.0006;


let rollRate = 0;
const ROLL_BIAS = 0.025; // radians / second^2

let driftVel = new THREE.Vector3();
const DRIFT_BIAS = 0.6;   // m/s^2 equivalent
const DRIFT_DAMP = 0.25;
const DRIFT_NOISE = 0.08;

const ROLL_KP = 4.0;   // angle correction
const ROLL_KD = 2.2;  // rate damping
const ROLL_MAX_TORQUE = 6.0;

let preferredRadius = 225;

let syncHeld = false;


// =======================
// Cruise control state
// =======================
let cruiseEnabled = false;
const targetVelocity = new THREE.Vector3();



let lockedTarget = null;
const TARGET_HOLD_DISTANCE = 17;

const TARGET_KP_POS = 1.2;
const TARGET_KP_VEL = 2.0;
const TARGET_MAX_ACCEL = 15;


let armControlMode = false;
let estimator;


const ARM_REACH_DISTANCE = 28.0;

let antiGravityEnabled = false;
const GRAV_KP = 0.9; // < 1 on purpose
let hudAntiGrav;
let estState;

const CAPTURE_RADIUS = 1.2;     // meters
const CAPTURE_MAX_RELVEL = 9; // m/s
const CAPTURE_TIME_REQUIRED = 5.0; // seconds
let captureTimer = 0;
let captureComplete = false;
let hudCapture;
const _prevCaptureTargetPos = new THREE.Vector3();

let graphCtx;
let rollErrorHistory = [];
let velErrorHistory = [];
let posErrorHistory = [];
let relPosErrorHistory = [];
const MAX_GRAPH_POINTS = 120;

let graphSampleTimer = 0;
const GRAPH_SAMPLE_INTERVAL = 0.1; // seconds (10 Hz)




// cache for velocity estimation
const _prevTargetPos = new THREE.Vector3();
    // =======================
    // Debug arrows
    // =======================
    const ARROW_SCALE = 8;

    const thrustArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, 0),
    1,
    0x00ff00
    );

    const driftArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 0),
    1,
    0xff8800
    );

    const velocityArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 0),
    1,
    0x00aaff
    );

    const rollArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, 0),
    1,
    0xff00ff
    );

function initCockpitButtons() {
  // STABILIZATION
  const stabBtn = document.getElementById("btn-stab");
  stabBtn.onclick = () => {
    attitudeStabilization = !attitudeStabilization;
  };

  // TARGET LOCK
  const lockBtn = document.getElementById("btn-lock");
  lockBtn.onclick = () => {
    if (lockedTarget) {
      lockedTarget = null;
    } else {
      const target = findTargetInView();
      if (target) lockedTarget = target;
    }
  };
}


function initUI() {
    canvas = document.getElementById("sim-canvas");

    document.getElementById("startBtn").onclick = () => {
        isRunning = !isRunning;
        document.getElementById("startBtn").textContent = isRunning ? "Pause" : "Start";
    }
    document.getElementById("resetBtn").onclick = () => window.location.reload();
    
    document.getElementById("cameraView").onchange = (e) => {
        cameraViewMode = e.target.value;
        controls.enabled = (cameraViewMode === CAMERA_VIEW.FREE);
    };

    hudAntiGrav = document.getElementById("hud-antigrav");

    hudCapture = document.getElementById("hud-capture");

    const syncBtn = document.getElementById("btn-sync");

      syncBtn.onmousedown = () => syncHeld = true;
      syncBtn.onmouseup   = () => syncHeld = false;
      syncBtn.onmouseleave = () => syncHeld = false;

    
    const graphCanvas = document.getElementById("estimator-graph");
    if (graphCanvas) {
      graphCtx = graphCanvas.getContext("2d");
    }




  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;

    // always track movement keys
    keys.add(e.code);

    switch (e.code) {

      case "KeyT":
        attitudeStabilization = !attitudeStabilization;
        break;

      case "KeyL": {
        if (lockedTarget) {
          clearTargetLock();
        } else {
          const target = findTargetInView();
          if (target) lockTarget(target);
        }
        break;
      }

      case "KeyC":
        cruiseEnabled = !cruiseEnabled;
        if (cruiseEnabled) {
          targetVelocity.copy(shipVel);
        }
        break;
      
      case "KeyR":
        toggleControlMode();
        break;


      case "KeyG":
        antiGravityEnabled = !antiGravityEnabled;
        hudAntiGrav.textContent = antiGravityEnabled ? "ON" : "OFF";
        console.log("Anti-gravity " + (antiGravityEnabled ? "enabled" : "disabled"));
        break;



      case "Escape":
        lockedTarget = null;
        cruiseEnabled = false;
        break;
    }
  });



    window.addEventListener("keyup", (e) => keys.delete(e.code));

    canvas.addEventListener("click", () => {
        canvas.requestPointerLock();
    });


    document.addEventListener("pointerlockchange", () => {
    mouseLocked = (document.pointerLockElement === canvas);
    });

    document.addEventListener("mousemove", (e) => {
      if (!mouseLocked) return;
      if (!playerShip) return;
      if (armControlMode) return; // disable mouse look in arm mode

      const dyaw   = -e.movementX * MOUSE_SENS;
      const dpitch =  e.movementY * MOUSE_SENS;

      const up = new THREE.Vector3(0, 1, 0)
        .applyQuaternion(playerShip.quaternion);

      playerShip.rotateOnWorldAxis(up, dyaw);

      const right = new THREE.Vector3(1, 0, 0)
        .applyQuaternion(playerShip.quaternion);

      playerShip.rotateOnWorldAxis(right, dpitch);
    });



}

function initScene() {
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("sim-canvas"), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 8000);
    camera.position.set(250, 150, 250);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    scene.add(createSun());
    //scene.add(createStarfield());

    estimator = new StateEstimator();
    estState = estimator.getState();

    const result = createKesslerSystem(12500);
    earthFrame = result.earthFrame;
    earth = earthFrame.getObjectByName("earth");
    scene.add(result.worldGroup);
    instancedMeshes = result.instancedMeshes;
    debrisData = result.debrisData;
    modulesData = result.modulesData; // Now it's saved globally
    result.modulesData.forEach(m => {
      scene.add(m.frame);
    });


    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    playerShip = createPlayerShip();
    scene.add(playerShip);
    playerShip.position.set(450, 0, 0);


    // initialize estimator position
    estState.position.copy(playerShip.position);



    // attach to ship
    playerShip.add(thrustArrow);
    playerShip.add(driftArrow);
    playerShip.add(velocityArrow);
    playerShip.add(rollArrow);

    // store references
    playerShip.userData.debugArrows = {
    thrustArrow,
    driftArrow,
    velocityArrow,
    rollArrow
    };



    shipCameraPoint = playerShip.userData.cameraMount;
    initCockpitButtons();

}

function updateCockpitButtons() {
  const stabBtn = document.getElementById("btn-stab");
  const lockBtn = document.getElementById("btn-lock");

  // --- Roll stabilization ---
  if (attitudeStabilization) {
    stabBtn.textContent = "ROLL STABILIZATION: ON  | Press [T] to shut off";
    stabBtn.classList.add("active");
  } else {
    stabBtn.textContent = "ROLL STABILIZATION: OFF | Press [T] to engage";
    stabBtn.classList.remove("active");
  }

  // --- Target lock ---
  if (lockedTarget) {
    stabBtn.classList.remove("warning");
    lockBtn.textContent = "TARGET: LOCKED | Press [L] to release";
    lockBtn.classList.add("active");
  } else {
    lockBtn.textContent = "TARGET: NONE   | Press [L] to lock";
    lockBtn.classList.remove("active");
  }


}

function updateControlsPanel() {

  const modeLabel = document.getElementById("hud-control-mode");
  const content   = document.getElementById("controls-content");

  if (!modeLabel || !content) return;

  if (!armControlMode) {

    modeLabel.textContent = "FLIGHT";

    content.innerHTML = `
      W  → THRUST<br>
      S  → BRAKE<br>
      MOUSE → ORIENT<br>
      T  → STABILIZE<br>
      L  → LOCK TARGET<br>
      G  → ANTI-GRAV<br>
      R  → SWITCH TO ARM MODE
    `;

  } else {

    modeLabel.textContent = "ROBOT ARM";

    content.innerHTML = `
      W / S → ELBOW<br>
      A / D → BASE<br>
      MOUSE → DISABLED<br>
      R  → RETURN TO FLIGHT
    `;
  }
}



function updateDebugArrows() {
  if (!playerShip || !playerShip.userData.debugArrows) return;

  const {
    thrustArrow,
    driftArrow,
    velocityArrow,
    rollArrow
  } = playerShip.userData.debugArrows;

  // --- Forward thrust (ship local +Z) ---
  thrustArrow.setDirection(new THREE.Vector3(0, 0, 1));
  thrustArrow.setLength(1.5, 0.3, 0.2);

  // --- Drift velocity (world -> ship local) ---
  if (driftVel.lengthSq() > 1e-6) {
    const localDrift = driftVel.clone()
      .applyQuaternion(playerShip.quaternion.clone().invert());

    driftArrow.setDirection(localDrift.clone().normalize());
    driftArrow.setLength(localDrift.length() * ARROW_SCALE);
  } else {
    driftArrow.setLength(0.001);
  }

  // --- Total velocity ---
  if (shipVel.lengthSq() > 1e-6) {
    const localVel = shipVel.clone()
      .applyQuaternion(playerShip.quaternion.clone().invert());

    velocityArrow.setDirection(localVel.clone().normalize());
    velocityArrow.setLength(localVel.length() * ARROW_SCALE);
  } else {
    velocityArrow.setLength(0.001);
  }

  // --- Roll rate (about local Z) ---
  const rollSign = Math.sign(rollRate || 0);
  rollArrow.setDirection(new THREE.Vector3(0, 0, rollSign || 1));
  rollArrow.setLength(Math.abs(rollRate) * ARROW_SCALE * 2);
}


function updateCamera() {
  if (cameraViewMode === CAMERA_VIEW.ONBOARD) {
    shipCameraPoint.getWorldPosition(_tmpPos);
    shipCameraPoint.getWorldQuaternion(_tmpQuat);
    camera.position.copy(_tmpPos);
    camera.quaternion.copy(_tmpQuat);
  } else {
    controls.target.copy(playerShip.position);
    controls.update();
  }
}



function updateCockpitHUD(dt) {

  // ======================
  // ATTITUDE
  // ======================
  document.getElementById("hud-roll-rate").textContent =
    rollRate.toFixed(3);

  const stabBtn = document.getElementById("btn-stab");
  stabBtn.classList.toggle("active", attitudeStabilization);


  // ======================
  // TARGET PANEL
  // ======================
  if (lockedTarget) {

    document.getElementById("hud-target").textContent = "LOCKED";

    const targetPos = new THREE.Vector3();
    lockedTarget.frame.getWorldPosition(targetPos);

    const relPos = targetPos.clone().sub(playerShip.position);

    document.getElementById("hud-target-dist").textContent =
      relPos.length().toFixed(1);

    document.getElementById("btn-lock").classList.add("active");

  } else {

    document.getElementById("hud-target").textContent = "NONE";
    document.getElementById("hud-target-dist").textContent = "--";
    document.getElementById("btn-lock").classList.remove("active");
  }


  // ======================
  // STATE ESTIMATION ERRORS
  // ======================
  if (!estState) return;

  const rollError = rollRate - estState.rollRate;

  const velError = shipVel.clone()
    .sub(estState.velocity)
    .length();

  const posError = playerShip.position.clone()
    .sub(estState.position)
    .length();

  let relError = 0;

  if (lockedTarget) {

    const targetPos = new THREE.Vector3();
    lockedTarget.frame.getWorldPosition(targetPos);

    const trueRel = targetPos.clone()
      .sub(playerShip.position);

    relError = trueRel.clone()
      .sub(estState.relPosition)
      .length();
  }


  // ======================
  // GRAPH SAMPLING
  // ======================
  graphSampleTimer += dt;

  if (graphSampleTimer >= GRAPH_SAMPLE_INTERVAL) {

    graphSampleTimer = 0;

    rollErrorHistory.push(rollError);
    velErrorHistory.push(velError);
    posErrorHistory.push(posError);
    relPosErrorHistory.push(relError);

    if (rollErrorHistory.length > MAX_GRAPH_POINTS)
      rollErrorHistory.shift();

    if (velErrorHistory.length > MAX_GRAPH_POINTS)
      velErrorHistory.shift();

    if (posErrorHistory.length > MAX_GRAPH_POINTS)
      posErrorHistory.shift();

    if (relPosErrorHistory.length > MAX_GRAPH_POINTS)
      relPosErrorHistory.shift();

    drawEstimatorGraph();
  }
}



function isWithinArmRange() {
  if (!lockedTarget) return false;

  const targetPos = new THREE.Vector3();
  lockedTarget.frame.getWorldPosition(targetPos);

  return targetPos.distanceTo(playerShip.position) < ARM_REACH_DISTANCE;
}


function lockTarget(module) {
  clearTargetLock();
  lockedTarget = module;
  _prevTargetPos.set(0, 0, 0);
}

function clearTargetLock() {
  lockedTarget = null;
  _prevTargetPos.set(0, 0, 0);
  captureTimer = 0;
  captureComplete = false;
  syncHeld = false;
  document.getElementById("sync-bar").style.width = "0%";

}


function findTargetInView(maxDist = 80, coneDot = 0.96) {
  if (!playerShip) return null;

  const shipPos = estState.position;
  const forward = new THREE.Vector3(0, 0, 1)
    .applyQuaternion(playerShip.quaternion)
    .normalize();

  let best = null;
  let bestDist = Infinity;

  modulesData.forEach(m => {
    const dockWorld = new THREE.Vector3();
    m.dock.getWorldPosition(dockWorld);

    const toDock = dockWorld.clone().sub(shipPos);
    const dist = toDock.length();
    if (dist > maxDist) return;

    const dir = toDock.normalize();
    const dot = dir.dot(forward);

    if (dot > coneDot && dist < bestDist) {
      best = m;
      bestDist = dist;
    }
  });

  return best;
}

function drawEstimatorGraph() {

  if (!graphCtx) return;

  const canvas = graphCtx.canvas;
  const w = canvas.width;
  const h = canvas.height;

  graphCtx.clearRect(0, 0, w, h);

  // center line for roll (since it can be +/-)
  graphCtx.strokeStyle = "#333";
  graphCtx.beginPath();
  graphCtx.moveTo(0, h / 2);
  graphCtx.lineTo(w, h / 2);
  graphCtx.stroke();

  // -----------------------------
  // SCALE SETTINGS
  // -----------------------------
  const maxRoll = 0.5;   // adjust if needed
  const maxVel  = 3.0;   // adjust if needed

  // -----------------------------
  // DRAW ROLL ERROR (CYAN)
  // -----------------------------
  if (rollErrorHistory.length > 1) {

    graphCtx.strokeStyle = "#00ffff";
    graphCtx.beginPath();

    rollErrorHistory.forEach((err, i) => {

      const x = (i / MAX_GRAPH_POINTS) * w;
      const y = h / 2 - (err / maxRoll) * (h / 2);

      if (i === 0) graphCtx.moveTo(x, y);
      else graphCtx.lineTo(x, y);
    });

    graphCtx.stroke();
  }

  // -----------------------------
  // DRAW VELOCITY ERROR (ORANGE)
  // -----------------------------
  if (velErrorHistory.length > 1) {

    graphCtx.strokeStyle = "#ffaa33";
    graphCtx.beginPath();

    velErrorHistory.forEach((err, i) => {

      const x = (i / MAX_GRAPH_POINTS) * w;
      const y = h - (err / maxVel) * h;

      if (i === 0) graphCtx.moveTo(x, y);
      else graphCtx.lineTo(x, y);
    });

    graphCtx.stroke();
  }


  // -----------------------------
  // DRAW POSITION ERROR (GREEN)
  // -----------------------------
  if (posErrorHistory.length > 1) {

    graphCtx.strokeStyle = "#33ff66";
    graphCtx.beginPath();

    const maxPos = 10;  // adjust scaling

    posErrorHistory.forEach((err, i) => {

      const x = (i / MAX_GRAPH_POINTS) * w;
      const y = h - (err / maxPos) * h;

      if (i === 0) graphCtx.moveTo(x, y);
      else graphCtx.lineTo(x, y);
    });

    graphCtx.stroke();
  }

  // -----------------------------
// DRAW RELATIVE POSITION ERROR (MAGENTA)
// -----------------------------
if (relPosErrorHistory.length > 1) {

  graphCtx.strokeStyle = "#ff33ff";
  graphCtx.beginPath();

  const maxRel = 10;  // adjust scale

  relPosErrorHistory.forEach((err, i) => {

    const x = (i / MAX_GRAPH_POINTS) * w;
    const y = h - (err / maxRel) * h;

    if (i === 0) graphCtx.moveTo(x, y);
    else graphCtx.lineTo(x, y);
  });

  graphCtx.stroke();
}




}





function applyAntiGravity(dt) {
  if (!antiGravityEnabled) return;

  const pos = playerShip.position.clone();
  const r = pos.length();
  const rHat = pos.normalize();

  const MU = 320000;
  const gravity = rHat.multiplyScalar(-MU / (r * r));

  shipVel.addScaledVector(gravity.multiplyScalar(-GRAV_KP), dt);
}

function applyGravity(dt) {
  if (!playerShip || !isRunning) return;

  const pos = playerShip.position.clone();
  const r = pos.length();

  const MU = 80000;  //
  const rHat = pos.normalize();

  const accel = rHat.multiplyScalar(-MU / (r * r));

  shipVel.addScaledVector(accel, dt);
}


function applyTargetLock(dt) {
    if (!lockedTarget || !isRunning) return;

    const shipPos = playerShip.position;

    // --- target world position ---
    const targetPos = new THREE.Vector3();
    lockedTarget.frame.getWorldPosition(targetPos);

    // --- estimate target velocity (finite difference) ---
    let targetVel = new THREE.Vector3();
    if (_prevTargetPos.lengthSq() > 0) {
      targetVel.copy(targetPos)
        .sub(_prevTargetPos)
        .divideScalar(dt);
    }
    _prevTargetPos.copy(targetPos);

    // --- relative quantities ---
    const relPos = estState.relPosition.clone();
    const relVel = estState.relVelocity.clone();



    const distError = relPos.length() - TARGET_HOLD_DISTANCE;
    const posDir = relPos.clone().normalize();

    // --- PD control in relative frame ---
    const accel = posDir.multiplyScalar(distError * TARGET_KP_POS)
      .add(relVel.multiplyScalar(TARGET_KP_VEL));

    // --- saturate thrusters ---
    if (accel.length() > TARGET_MAX_ACCEL) {
      accel.setLength(TARGET_MAX_ACCEL);
    }

    shipVel.addScaledVector(accel, dt);
  }


function applyRollStabilization(dt) {
  if (!attitudeStabilization) return;

  // Just damp roll rate
  const torque = -ROLL_KD * estState.rollRate;

  rollRate += THREE.MathUtils.clamp(
    torque,
    -ROLL_MAX_TORQUE,
     ROLL_MAX_TORQUE
  ) * dt;
}


function applyRollDisturbance(dt) {
  if (!isRunning) return;

  rollRate += ROLL_BIAS * dt;
  rollRate *= Math.exp(-0.3 * dt);
}



function applyTranslationalDrift(dt) {
  return;
  if (!playerShip || !isRunning) return;

  const pos = playerShip.position.clone();
  const r = pos.length();
  const rHat = pos.normalize();

  const worldUp = new THREE.Vector3(0, 1, 0);

  // Tangential orbital flow
  const tangential = new THREE.Vector3()
    .crossVectors(worldUp, rHat)
    .normalize();

  // --- Tangential drift ---
  const tangentialAccel = tangential.multiplyScalar(DRIFT_BIAS);

  // --- Radial spring + damping ---
  const radialVel = shipVel.dot(rHat);

  const KR = 0.012;
  const CR = 0.8;

  const radialAccel = rHat.clone().multiplyScalar(
    -KR * (r - preferredRadius) - CR * radialVel
  );

  // --- Noise ---
  const noise = new THREE.Vector3(
    (Math.random() - 0.5) * DRIFT_NOISE,
    (Math.random() - 0.5) * DRIFT_NOISE,
    (Math.random() - 0.5) * DRIFT_NOISE
  );

  // Total acceleration
  const accel = tangentialAccel
    .add(radialAccel)
    .add(noise);

  driftVel.addScaledVector(accel, dt);

  // Light global damping
  driftVel.multiplyScalar(Math.exp(-DRIFT_DAMP * dt));

  shipVel.addScaledVector(driftVel, dt);
}




function updateShipTranslationFromInput(dt) {
  if (!playerShip) return;
  if (!isRunning) return;
  if(lockedTarget) return; // disable manual control when target locked
  if (armControlMode) return; // disable manual control when in arm mode

    // build input (ship local)
    const thrustForward = keys.has("KeyW");
    const braking = keys.has("KeyS");



    // thrust direction depends on orientation
    // Forward thrust only
    if (thrustForward) {
    const accelWorld = new THREE.Vector3(0, 0, 1)
        .applyQuaternion(playerShip.quaternion)
        .multiplyScalar(SHIP_ACCEL);

    shipVel.addScaledVector(accelWorld, dt);
    }

    // Normal drift damping
    let damp = SHIP_DAMP_OFF;

    // Extra damping when braking
    if (braking) {
    damp = 4.0; // tune this
    }

    //shipVel.multiplyScalar(Math.exp(-damp * dt));

}

function updateCaptureLogic(dt) {
  if (!hudCapture) return;


  const syncBar = document.getElementById("sync-bar");

  // Must have a locked target
  if (!lockedTarget || captureComplete) {
    captureTimer = 0;
    syncBar.style.width = "0%";
    hudCapture.textContent = "NOT CAPTURED";
    hudCapture.style.color = "#ff4444";
    return;
  }

  // --- get end effector (ball) ---
  const effector =
    playerShip?.userData?.roboticArm?.userData?.endEffector;

  if (!effector) {
    console.warn("No end effector found");
    return;
  }

  // --- world positions ---
// --- effector position ---
const effectorPos = new THREE.Vector3();
effector.getWorldPosition(effectorPos);

// --- into torus local frame ---
const localPos = effectorPos.clone();
lockedTarget.dock.worldToLocal(localPos);

// Torus geometry (MUST match TorusGeometry)
const R = 0.8;   // major radius
const r = 0.12;  // tube radius
const tol = 0.5;

// Distance from torus axis
const rho = Math.sqrt(localPos.x**2 + localPos.y**2);

// Torus implicit equation
const torusError = (rho - R)**2 + localPos.z**2;

// Inside tube?
const inPosition = torusError < (r + tol)**2;

// Velocity gate
const slowEnough = shipVel.length() < CAPTURE_MAX_RELVEL;

const canSync = inPosition && slowEnough;

if (canSync) {
  captureTimer += dt;
  console.log("syncing");
} else {
  captureTimer = Math.max(0, captureTimer - 2 * dt);
  console.log("not syncing");
}


  const progress = THREE.MathUtils.clamp(
    captureTimer / CAPTURE_TIME_REQUIRED,
    0,
    1
  );

  syncBar.style.width = `${progress * 100}%`;

  if (progress >= 1.0) {
    captureComplete = true;
    hudCapture.textContent = "CAPTURED";
    hudCapture.style.color = "#33ff66";
    syncBar.style.background = "#33ff66";
  } else if (progress > 0) {
    hudCapture.textContent = "SYNCING";
    hudCapture.style.color = "#ffaa33";
  } else {
    hudCapture.textContent = "NOT CAPTURED";
    hudCapture.style.color = "#ff4444";
  }
}



function toggleControlMode() {

  armControlMode = !armControlMode;
  controls.enabled = !armControlMode;

  if (armControlMode) {
    shipVel.multiplyScalar(0.3);
  }

  updateControlsPanel();  // <-- update once here
}




function updateArmControl(dt) {
  if (!playerShip?.userData?.roboticArm) return;
  if (!armControlMode) return;


  const arm = playerShip.userData.roboticArm;
  const { baseYaw, elbowPitch, wristPitch, joints } = arm.userData;

  const RATE = 1.2; // rad/sec


  if (keys.has("KeyW")) elbowPitch.rotation.x += RATE * dt;
  if (keys.has("KeyS")) elbowPitch.rotation.x -= RATE * dt;

  if (keys.has("KeyA")) baseYaw.rotation.y += RATE * dt;
  if (keys.has("KeyD")) baseYaw.rotation.y -= RATE * dt;


  // clamp joints
  elbowPitch.rotation.x = THREE.MathUtils.clamp(
    elbowPitch.rotation.x,
    joints.elbow.min,
    joints.elbow.max
  );

  wristPitch.rotation.x = THREE.MathUtils.clamp(
    wristPitch.rotation.x,
    joints.wrist.min,
    joints.wrist.max
  );
}


function integratePosition(dt) {
  playerShip.position.addScaledVector(shipVel, dt);
}


function updatePhysics(dt) {
  if (!isRunning) return;
    // if (earthFrame && isRunning){
    //     earth.rotation.y += 0.05*dt;
    // } no more earth rotation because it makes me dizzyt

    // 1. Update the 150k Debris Array
    debrisData.forEach(item => {
        if (isRunning) {
            item.theta += item.speed * dt;
            item.currentRot.x += item.tumbleVel.x;
            item.currentRot.y += item.tumbleVel.y;
            item.currentRot.z += item.tumbleVel.z;
        }
        _dummy.position.setFromSphericalCoords(item.radius, item.phi, item.theta);
        _dummy.rotation.copy(item.currentRot);
        _dummy.updateMatrix();
        instancedMeshes[item.meshIndex].setMatrixAt(item.instanceIndex, _dummy.matrix);
    });

    // 2. Update the Modules Array (Separate loop = cleaner)
    modulesData.forEach(m => {
      if (!isRunning) return;

      // --- orbital motion ---
      m.orbit.theta += m.orbit.speed * dt;

      const pos = new THREE.Vector3().setFromSphericalCoords(
        m.orbit.radius,
        m.orbit.phi,
        m.orbit.theta
      );

      m.frame.position.copy(pos);

      // --- tumbling / spin ---
      m.spin.rot.x += m.spin.omega.x * dt;
      m.spin.rot.y += m.spin.omega.y * dt;
      m.spin.rot.z += m.spin.omega.z * dt;

      m.frame.rotation.copy(m.spin.rot);
    });



}

function animate(time) {
    const dt = (time - lastTime) * 0.001 || 0;
    lastTime = time;

    updatePhysics(dt);
    estimator.updateBias(dt);
    estimator.propagate(dt);
    estimator.updateRollEstimate(rollRate);
    estimator.updateVelocityEstimate(shipVel);
    if (Math.random() < 0.2){
    estimator.updatePositionEstimate(playerShip.position);
    }
    // ----------------------------
    // Relative target estimation
    // ----------------------------
    if (lockedTarget) {

      const targetPos = new THREE.Vector3();
      lockedTarget.frame.getWorldPosition(targetPos);

      const trueRelPos = targetPos.clone()
        .sub(playerShip.position);

      estimator.updateRelativeEstimate(trueRelPos, dt);
    }

    //applyDirectionalShipDisturbance(dt);
    //updateShipAttitude(dt);
    applyRollDisturbance(dt);
    applyRollStabilization(dt);
    updateCaptureLogic(dt);
    if (isRunning){
    playerShip.rotateZ(rollRate*dt);
    applyTranslationalDrift(dt);
    applyTargetLock(dt);
    applyGravity(dt);
    applyAntiGravity(dt);
    updateShipTranslationFromInput(dt);
    shipVel.multiplyScalar(Math.exp(-SHIP_DAMP_OFF * dt));
    integratePosition(dt);}
    //updateDebugArrows();
    updateCockpitHUD(dt);
    updateCockpitButtons();

    updateArmControl(dt);
    updateCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

document.addEventListener("DOMContentLoaded", () => {
    initUI();
    initScene();
    updateControlsPanel();
    animate();
});