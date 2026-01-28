
let canvas;
let ctx;
const dt = 0.005;
const G = 1;
let time = 0;
let width;
let height;
let isRunning = true;
let startBtn;
let resetBtn;
let cx;
let cy;

// FPS display
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;
let lastFpsUpdate = lastFrameTime;
let fpsDisplay;

let timeDisplay;

// Number of physics updates per render frame
const updateSteps = 10;

// Physical space dimensions
const finiteWidth = 1600; // Width of finite space we are considering
const finiteHeight = 1200; // Height of finite space we are considering
let physToCanvasScale;
// Initial positions
const satPos = [0, 0]; // center
const saturnMass = 100;
const saturn = {m: saturnMass, x: 0, y: 0, color: '#d1c596', radius: 60 , physicalRadius: 90};

// Rocks
const maxRocks = 1000;
const radiusRange = [2, 5];
const colorRange = ['#888888', '#bbbbbb', '#dddddd', '#aaaaaa', '#777777'];
const variation = 0.25; // How much deviation along the boundary of the rock
let rocks = [];

// Path selection
let selectedPath = "lowSaturnOrbit";

// Control Law
let controlLaw = "2Layer";

// Freighter and starship
const starShipImg = new Image();
starShipImg.src = "images/spaceCraft.png";
const initialStarshipX = -700;
const initialStarshipY = 500;
const starship = {x: initialStarshipX, y: initialStarshipY, vx:0, vy:0, w: 20, h: 20, mass: 5, visionRadius: 32, nearbyRocks: [], img: starShipImg};


const freighterImg = new Image();
freighterImg.src = "images/freighter.png";
const initialFreighterX = -750;
const initialFreighterY = 550;
const freighter = {x: initialFreighterX, y: initialFreighterY, vx: 0, vy: 0, w: 75, h: 75, mass: 100, img: freighterImg};

let missionActive = false;

// Ring definitions
let ringDist1 = 210;
let ringDist2 = 380;
let dashPhase = 0;

let controlUx = 0;
let controlUy = 0;

const shipRadius = 0.5 * Math.max(starship.w, starship.h);
const saturnHardRadius = saturn.radius + shipRadius + 30;

const A_MAX = 0.25;        // max thrust acceleration
const ALPHA = 1.0;        // barrier aggressiveness

const SATURN_SAFE_RADIUS = saturn.radius + shipRadius + 30;

let omegaScale = 1.0;     // ∈ (0,1], scales reference speed
const OMEGA_MIN = 0.25;
const OMEGA_RECOVER = 0.6;
const OMEGA_SLOW = 6.0;

let orbitPhase = 0;

let lastThreat = 0;

let governedReference = null;  // { x, y } or null

const ACC_EPS = 1e-4;
const VEL_EPS = 0.02;
let escapeExistsDebug = true;

const RG_CAPTURE_RADIUS = 25;   // position tolerance
const RG_CAPTURE_SPEED = 0.15; // velocity tolerance

const JITTER = 0.65;

const RG_MIN_DISTANCE = 15;   // must be > capture radius
const CBF_BUFFER = 7.5;   // small, physical safety buffer

let deadlockScore = 0;
let deadlockDetected = false;

// tuning
const DEADLOCK_SCORE_TRIGGER = 1.0;
const DEADLOCK_SCORE_DECAY   = 0.5;   // per second
const DEADLOCK_SCORE_GAIN    = 2.0;   // per second

let lastBlockingSet = [];
let blockingPersistence = 0;

const BLOCKING_GAIN  = 2.0;  // per second
const BLOCKING_DECAY = 1.0;

const VMAX = 6.0;


const ring1 = {
  inner: ringDist1,
  outer: ringDist1 + 75
};

const ring2 = {
  inner: ringDist2,
  outer: ringDist2 + 450
};

const orbitLowSaturn =
  0.7 * (ring1.inner);

const orbitMidGap =
  ring1.outer + 0.5 * (ring2.inner - ring1.outer);

  const orbitInnerRing =
  ring2.inner + 0.5 * (ring2.outer - ring2.inner);

const ECC = 0.9;

function loadImage(imgObject, src) {
  imgObject.onload = () => {
    loaded++;
    if (loaded === total) {
      initSimulation();
      requestAnimationFrame(render);
    }
  };
  imgObject.src = src;
}

function resize() {
    const viewport = document.querySelector('.viewport');
    if (!viewport) return;
    // Set internal resolution to match display size
    canvas.width = viewport.clientWidth;
    canvas.height = viewport.clientHeight;
    width = canvas.width;
    height = canvas.height;
    console.log("Resized width: ", width);
    console.log("Resized height: ", height);
    
    // Recalculate center points immediately after resize
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    updateScale();
}

// Needs to map a finite chunk of space into width, height
// Let's say the max x position is 500 and the max y position is 400
// Also note our space is centered at (0,0), whereas canvas is centered at (width/2, height/2)
function pos2Coords(posX, posY){
  // So posX = 0 maps to width/2 and posY = 0 maps to height/2
  // posX = 500 maps to width and posY = 400 maps to 0
  // posX = -500 maps to 0, and posY = -400 maps to height

  // First shift the intervals [-500, 500] x [-400, 400] to [0, 1000] x [-800, 0]
  // Then scale to [0,1], [1,0] and scale back up to [0, width] x [height, 0]

  posX = canvas.width * (posX + finiteWidth/2) / finiteWidth;
  posY = canvas.height * (posY - finiteHeight/2) / -finiteHeight;

  return [posX, posY]
}

let rockIdCounter = 0;
function generateRocks(){
    let ringDist = ringDist1;
    let color = "#ac9393"
    let bandWidth = 75;
    for (let i = 0; i < maxRocks; i++){
        if (i > maxRocks/10 && i <= 2*maxRocks/3){
            ringDist = ringDist2;
            color = '#ebe2e2'
            bandWidth = ring2.outer - ring2.inner;
        }
        else if(i > 2*maxRocks/3){
            //ringDist = 560;
            color = '#494242'
            //bandWidth = 125;
        }
        const angle = Math.random()*2*(Math.PI);
        const dist = ringDist + Math.random()*bandWidth;
        const x = satPos[0] + dist * Math.cos(angle);
        const y = satPos[1] + dist * Math.sin(angle);
        const radius = radiusRange[0] + Math.random()*(radiusRange[1]-radiusRange[0]);
        //const color = colorRange[Math.floor(Math.random()*colorRange.length)];

        rocks.push({
          id: rockIdCounter++,
          x, y, radius, color
        });

    }
    console.log("Successfully implemented ", rocks.length, " rocks in Saturn's orbit");
}

function getReferenceOrbitParams() {
  let r;

  if (selectedPath === "lowSaturnOrbit") {
    r = orbitLowSaturn;
  } 
  else if (selectedPath === "midRingOrbit") {
    r = orbitMidGap;
  } 
  else if (selectedPath === "innerRingOrbit") {
    r = orbitInnerRing;
  }

  return {
    a: r,
    b: r * ECC
  };
}

function drawReferenceOrbit() {
  if (!selectedPath) return;

  const { a, b } = getReferenceOrbitParams();

  ctx.save();
  ctx.strokeStyle = "rgb(71, 78, 71)";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);


  // Uncomment to make the trajectory "move" like it's in orbit
  //ctx.lineDashOffset = dashPhase;

  ctx.beginPath();
  const steps = 240;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;

    const xPhys = satPos[0] + a * Math.cos(t);
    const yPhys = satPos[1] + b * Math.sin(t);

    const [x, y] = pos2Coords(xPhys, yPhys);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.restore();
}

function desiredOrbitRadius() {
  const { a, b } = getReferenceOrbitParams();
  return 0.5 * (a + b);
}

function desiredOrbitState() {
  const { a, b } = getReferenceOrbitParams();

  const theta = orbitPhase;

  const xd = a * Math.cos(theta);
  const yd = b * Math.sin(theta);

  // Tangent velocity
  const { a: aa } = getReferenceOrbitParams();
  const omegaNom = 1.5 * Math.sqrt(G * saturn.m / (aa * aa * aa));
  const omega = omegaScale * omegaNom;

  const vxd = -a * omega * Math.sin(theta);
  const vyd =  b * omega * Math.cos(theta);

  return { xd, yd, vxd, vyd };
}


function drawTargetPoint() {
  const { xd, yd } = desiredOrbitState();
  const [cx, cy] = pos2Coords(xd, yd);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#00ff66";
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#00ff66";
  ctx.fill();
  ctx.restore();
}

function drawGovernedReference() {
  if (!governedReference) return;

  const [x, y] = pos2Coords(
    governedReference.x,
    governedReference.y
  );

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ff9f1c"; // orange
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#ff9f1c";
  ctx.fill();
  ctx.restore();
}


function updateDeadlockDetector() {
  const currentSet = getBlockingRockSet();

  const sameAsLast =
    currentSet.some(v => v === 1) &&
    currentSet.length === lastBlockingSet.length &&
    currentSet.every((v, i) => v === lastBlockingSet[i]);


  const blockedCount = currentSet.reduce((s, v) => s + v, 0);

    if (sameAsLast) {
      blockingPersistence += BLOCKING_GAIN * dt/5;
    } else if (blockedCount === 0) {
      // completely free: decay fast
      blockingPersistence -= 1 * BLOCKING_DECAY * dt/2.5;
    } else {
      // partially constrained: decay slowly
      blockingPersistence -= BLOCKING_DECAY * dt;
    }


  blockingPersistence = Math.max(
      0,
      Math.min(1.0, blockingPersistence)
    );

  deadlockDetected = blockingPersistence >= DEADLOCK_SCORE_TRIGGER;

  lastBlockingSet = currentSet;
}




function getBlockingRockSet() {
  const sx = starship.x;
  const sy = starship.y;

  const ANGLE_BINS = 12;
  const bins = new Array(ANGLE_BINS).fill(0);

  for (const rock of starship.nearbyRocks) {
    const dx = rock.x - sx;
    const dy = rock.y - sy;
    const dist = Math.hypot(dx, dy);

    // DEADLOCK operates on vision scale, not collision scale
    if (dist < starship.visionRadius * 0.9) {
      const ang = Math.atan2(dy, dx);
      const bin = Math.floor(
        ((ang + Math.PI) / (2 * Math.PI)) * ANGLE_BINS
      );

      bins[Math.max(0, Math.min(ANGLE_BINS - 1, bin))] = 1;
    }
  }

  return bins;
}





function isReferenceFeasible(xd, yd) {
  const shipRadius = 0.5 * Math.max(starship.w, starship.h);
  const BUFFER = 15;

  // Check rocks
  for (const rock of starship.nearbyRocks) {
    const dx = xd - rock.x;
    const dy = yd - rock.y;
    const dist = Math.hypot(dx, dy);

    if (dist < rock.radius + shipRadius + BUFFER) {
      return false;
    }
  }

  // Check Saturn (treated as big rock)
  {
    const dx = xd - saturn.x;
    const dy = yd - saturn.y;
    const dist = Math.hypot(dx, dy);

    if (dist < saturn.radius + shipRadius + BUFFER) {
      return false;
    }
  }

  return true;
}

function isDirectionClear(dx, dy) {
  const sx = starship.x;
  const sy = starship.y;

  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return false;

  const ux = dx / len;
  const uy = dy / len;

  const shipRadius = 0.5 * Math.max(starship.w, starship.h);
  const BUFFER = 15;

  // Test rocks
  for (const rock of starship.nearbyRocks) {
    const rx = rock.x - sx;
    const ry = rock.y - sy;

    const proj = rx * ux + ry * uy;
    if (proj < 0) continue;

    const closest2 =
      rx*rx + ry*ry - proj*proj;

    const rInflated =
      rock.radius + shipRadius + CBF_BUFFER;



    if (closest2 < rInflated * rInflated) {
      return false;
    }
  }

  // Saturn as big obstacle
  {
    const rx = saturn.x - sx;
    const ry = saturn.y - sy;
    const proj = rx * ux + ry * uy;
    if (proj > 0) {
      const closest2 =
        rx*rx + ry*ry - proj*proj;

      const rInflated =
        saturn.radius + shipRadius + BUFFER;

      if (closest2 < rInflated * rInflated) {
        return false;
      }
    }
  }

  return true;
}

function shouldReleaseGovernedReference() {
  if (!governedReference) return false;

  const dx = starship.x - governedReference.x;
  const dy = starship.y - governedReference.y;
  const dist = Math.hypot(dx, dy);

  const speed = Math.hypot(starship.vx, starship.vy);
    if (speed > VMAX) {
      const scale = VMAX / speed;
      starship.vx *= scale;
      starship.vy *= scale;
    }

  return (
    dist < RG_CAPTURE_RADIUS
  );
}



function positionReferenceGovernor() {
  const sx = starship.x;
  const sy = starship.y;

  const shipRadius = 0.5 * Math.max(starship.w, starship.h);
  const BUFFER = 15;

  const LOOKAHEAD = 120;
  const NUM_DIRS = 32;

  let bestScore = -Infinity;
  let bestDir = null;

  for (let i = 0; i < NUM_DIRS; i++) {
    const ang = (2 * Math.PI * i) / NUM_DIRS;
    const ux = Math.cos(ang);
    const uy = Math.sin(ang);

    let minClearance = Infinity;
    let blocked = false;

    // --- check rocks ---
    for (const rock of starship.nearbyRocks) {
      const rx = rock.x - sx;
      const ry = rock.y - sy;

      const proj = rx * ux + ry * uy;
      if (proj < 0) continue;

      const closest2 = rx*rx + ry*ry - proj*proj;
      const clearance =
        Math.sqrt(Math.max(closest2, 0)) -
        (rock.radius + shipRadius + BUFFER);

      minClearance = Math.min(minClearance, clearance);
      if (clearance < 0) {
        blocked = true;
        break;
      }
    }

    if (blocked) continue;

    // --- Saturn check ONLY at reference point ---
    const px = sx + LOOKAHEAD * ux;
    const py = sy + LOOKAHEAD * uy;

    const ds = Math.hypot(px - saturn.x, py - saturn.y);
    if (ds < saturn.radius + shipRadius + BUFFER) continue;

    // --- score: prefer directions that increase clearance ---
    const score = minClearance;

    if (score > bestScore) {
      bestScore = score;
      bestDir = { ux, uy };
    }
  }

  if (bestDir) {
    let gx = sx + LOOKAHEAD * bestDir.ux;
    let gy = sy + LOOKAHEAD * bestDir.uy;

    // --- enforce minimum displacement ---
    const dx = gx - sx;
    const dy = gy - sy;
    const d  = Math.hypot(dx, dy);

    if (d < RG_MIN_DISTANCE) {
      const scale = RG_MIN_DISTANCE / (d + 1e-6);
      gx = sx + dx * scale;
      gy = sy + dy * scale;
    }

    governedReference = { x: gx, y: gy };

  } else {
    governedReference = {
      x: RG_MIN_DISTANCE,
      y: RG_MIN_DISTANCE
    };
  }

}





function rockSafetyFilter(ax, ay) {
  let axSafe = ax;
  let aySafe = ay;

  const sx = starship.x;
  const sy = starship.y;
  const vx = starship.vx;
  const vy = starship.vy;

  const shipRadius = 0.5 * Math.max(starship.w, starship.h);
  const ALPHA  = 2.0;

  // Build obstacle list: rocks + Saturn
  const obstacles = [];

  for (const rock of starship.nearbyRocks) {
    obstacles.push({
      x: rock.x,
      y: rock.y,
      radius: rock.radius
    });
  }

  // Treat Saturn as a big rock
  obstacles.push({
    x: saturn.x,
    y: saturn.y,
    radius: saturn.radius + 15
  });

  for (const obs of obstacles) {
    const dx = sx - obs.x;
    const dy = sy - obs.y;

    const r2 = dx*dx + dy*dy;
    if (r2 < 1e-8) continue;

    const rInflated =
      obs.radius + shipRadius + CBF_BUFFER;

    const h = r2 - rInflated * rInflated;

    // Only enforce near boundary
    if (h > 0.05 * rInflated * rInflated) continue;


    // ḣ = 2 r · v
    const hDot = 2 * (dx * vx + dy * vy);

    // ḧ = 2 v·v + 2 r·a
    const rhs =
      -2 * (vx*vx + vy*vy)
      - ALPHA * hDot
      - ALPHA * ALPHA * h;

    const dot = 2 * (dx * axSafe + dy * aySafe);

    if (dot < rhs) {
      const denom = 2 * r2 + 1e-8;
      const lambda = (rhs - dot) / denom;

      axSafe += lambda * dx;
      aySafe += lambda * dy;
    }
  }

  return [axSafe, aySafe];
}



function orbitalPDControl() {
  const sx = starship.x;
  const sy = starship.y;
  const vx = starship.vx;
  const vy = starship.vy;

  // --- GET NOMINAL ORBIT REFERENCE ---
  const orbitRef = desiredOrbitState();

  // --- OVERRIDE POSITION IF RG IS ACTIVE ---
  const xd = governedReference ? governedReference.x : orbitRef.xd;
  const yd = governedReference ? governedReference.y : orbitRef.yd;

  // For a position RG, we intentionally zero the reference velocity
  const vxd = governedReference ? 0 : orbitRef.vxd;
  const vyd = governedReference ? 0 : orbitRef.vyd;

  // --- PD ERRORS ---
  const ex = sx - xd;
  const ey = sy - yd;

  const evx = vx - vxd;
  const evy = vy - vyd;

  const Kp = 0.01;
  const Kv = 0.18;

  const SPEED_DAMPING = 0.2;   // try 0.4–0.8

  const speed = Math.hypot(vx, vy);
  const vxUnit = speed > 1e-6 ? vx / speed : 0;
  const vyUnit = speed > 1e-6 ? vy / speed : 0;

  // oppose motion proportional to speed
  const axDamp = -SPEED_DAMPING * speed * vxUnit;
  const ayDamp = -SPEED_DAMPING * speed * vyUnit;

  const ax = -Kp * ex - Kv * evx + axDamp;
  const ay = -Kp * ey - Kv * evy + ayDamp;


  return [ax, ay];
}






function controller() {
  let [ax,ay] = [0,0];
  switch (controlLaw){
    case "2Layer": 
      [ax, ay] = orbitalPDControl();
      [ax, ay] = rockSafetyFilter(ax, ay);
      break;

    case "3Layer":
      [ax, ay] = orbitalPDControl();
      [ax, ay] = rockSafetyFilter(ax, ay);
      break;
    case "3Layer-trajectory":
      [ax, ay] = orbitalPDControl();
      [ax, ay] = rockSafetyFilter(ax, ay);
      break;

    default:
      [ax,ay] = [0,0];
  }
  return [ax, ay];
}



function isRockDangerous(rock) {
  const sx = starship.x;
  const sy = starship.y;
  const vx = starship.vx;
  const vy = starship.vy;

  const shipRadius = 0.5 * Math.max(starship.w, starship.h);
  const speed = Math.hypot(vx, vy);

  const dx = sx - rock.x;
  const dy = sy - rock.y;
  const r  = Math.hypot(dx, dy);

  const safe =
    shipRadius + rock.radius
    + 20
    + 2.5 * speed
    + 0.5 * updateSteps * dt * speed;

  return r < safe;
}

function drawDangerLines() {
  if (!missionActive) return;

  const [sx, sy] = pos2Coords(starship.x, starship.y);

  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]); // dash length, gap length

  for (const rock of starship.nearbyRocks) {
    if (!isRockDangerous(rock)) continue;

    const [rx, ry] = pos2Coords(rock.x, rock.y);

    // Fade intensity based on proximity
    const dx = starship.x - rock.x;
    const dy = starship.y - rock.y;
    const dist = Math.hypot(dx, dy);

    const alpha = Math.min(1, 80 / dist);
    ctx.strokeStyle = `rgba(255, 50, 50, ${0.3 + 0.5 * alpha})`;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(rx, ry);
    ctx.stroke();
  }

  ctx.restore();
}



// Find which rocks are in the vision radius of starship
function getVisibleRocks() {
  const visible = [];
  const R2 = starship.visionRadius * starship.visionRadius;

  const sx = starship.x;
  const sy = starship.y;

  for (const rock of rocks) {
    const dx = rock.x - sx;
    const dy = rock.y - sy;

    if (dx*dx + dy*dy <= R2) {
      visible.push(rock);
    }
  }

  return visible;
}


function symplecticEuler() {
  const dx = saturn.x - starship.x;
  const dy = saturn.y - starship.y;
  const r = Math.hypot(dx, dy);
  if (r < 1e-6) return;

  // --- Saturn hard exclusion radius ---
  const shipRadius = 0.5 * Math.max(starship.w, starship.h);
  const saturnHardRadius = saturn.radius + shipRadius + 30;

  // --- Gravity attenuation near Saturn ---
  let gravityScale = 1.0;

  // --- Gravitational acceleration ---
  const factor = gravityScale * G * saturn.m / (r * r * r);
  const ax = factor * dx + controlUx;
  const ay = factor * dy + controlUy;

  // --- Symplectic Euler ---
  starship.vx += ax * dt;
  starship.vy += ay * dt;

  starship.x += starship.vx * dt;
  starship.y += starship.vy * dt;
}



function updateRocks(){
    rocks.forEach(n => {
    const [x,y] = pos2Coords(n.x, n.y);

    // Now update their position so we don't have to repeat the loop elsewhere
    // We can use Keplerian motion since rocks are only really influenced by Saturn 
    const dx = n.x - satPos[0];
    const dy = n.y - satPos[1];
    const dist = Math.sqrt(dx*dx + dy*dy);
    const orbitalVelocity = 5*Math.sqrt(G*saturn.m/dist);
    // Compute tangential unit vector
    const tx = -dy/dist;
    const ty = dx/dist;
    n.x += orbitalVelocity * tx * dt;
    n.y += orbitalVelocity * ty * dt;

  });
}


function updateScale() {
  const sx = canvas.width  / finiteWidth;
  const sy = canvas.height / finiteHeight;
  physToCanvasScale = Math.min(sx, sy);
}

function render(now= performance.now()){

  frameCount++;

  const delta = now - lastFpsUpdate;
  if (delta >= 500) {
    fps = Math.round((frameCount * 1000) / delta);
    frameCount = 0;
    lastFpsUpdate = now;
    fpsDisplay.innerText = `Simulation Active: ${fps} FPS`;
  }

 if (missionActive && isRunning) {

    // 1. Sense
    starship.nearbyRocks = getVisibleRocks();

    // 2. Analyze constraint state
    updateDeadlockDetector();

    // 3. Supervisory decision (REFERENCE logic)
    if (
      (controlLaw === "3Layer" || controlLaw === "3Layer-trajectory") &&
      deadlockDetected
    ) {
      positionReferenceGovernor();
      blockingPersistence *= 0; //  reset
    }

    if (governedReference && shouldReleaseGovernedReference()) {
      governedReference = null;
    }

    // 4. Control synthesis (ACTUATION logic)
    [controlUx, controlUy] = controller();
  }




    if(isRunning){
    // update physics of aircraft wrt Saturn's gravity
    // symplectic euler integration
    for (let i = 0; i < updateSteps; i++){
      if (missionActive){
        // --- advance reference PHASE ---
        const { a } = getReferenceOrbitParams();
        const omegaNom = 1.5 * Math.sqrt(G * saturn.m / (a * a * a));
        orbitPhase += omegaScale * omegaNom * dt;



        symplecticEuler();
      }
      updateRocks();
    }

  }


  // Space background
  ctx.fillStyle = '#05060a'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);






  // Draw trajectory target
  dashPhase -= 0.2;  // speed
  drawReferenceOrbit();
  drawTargetPoint();
  drawGovernedReference();

  // Draw Saturn
    const [satX, satY] = pos2Coords(satPos[0], satPos[1]);
    ctx.beginPath();
    ctx.arc(satX, satY, saturn.radius, 0, Math.PI * 2);
    ctx.fillStyle = saturn.color;
    // Visual glow effect
    ctx.shadowBlur = 30;
    ctx.shadowColor = saturn.color;
    ctx.fill();
    ctx.shadowBlur = 0;


  rocks.forEach(n => {
    const [x,y] = pos2Coords(n.x, n.y);
    ctx.beginPath();
    ctx.arc(x, y, n.radius, 0, Math.PI * 2);
    ctx.fillStyle = n.color;
    // Visual glow effect
    ctx.shadowBlur = 20; 
    ctx.shadowColor = n.color;
    ctx.fill(); 
    ctx.shadowBlur = 0;
  });

  // === Debug: Deadlock & RG ===
  ctx.save();
  ctx.font = "14px monospace";

  const y0 = 20;
  const dy = 18;

  // Deadlock score
  ctx.fillStyle = deadlockDetected ? "#ff4444" : "#ffaa00";
  ctx.fillText(
    `deadlock score: ${blockingPersistence.toFixed(2)}`,
    200, y0 + dy
  );

  // Deadlock flag
  ctx.fillStyle = deadlockDetected ? "#ff4444" : "#888888";
  ctx.fillText(
    `deadlock detected: ${deadlockDetected ? "YES" : "NO"}`,
    200, y0 + 2 * dy
  );

    ctx.fillStyle = "#ff7777";
    ctx.fillText(
      `blocking bins: ${lastBlockingSet.join("")}`,
      200, y0 + 3 * dy
    );


  // RG state
  ctx.fillStyle = governedReference ? "#ff9f1c" : "#888888";
  ctx.fillText(
    `RG active: ${governedReference ? "YES" : "NO"}`,
    200, y0 + 4 * dy
  );

  ctx.restore();



  const [freighterX, freighterY] = pos2Coords(freighter.x, freighter.y);
  ctx.drawImage(
    freighter.img,
    freighterX - freighter.w / 2,
    freighterY - freighter.h / 2,
    freighter.w,
    freighter.h
    );



    if(missionActive){
    // draw vision radius around it in light transparent green
        const [sx, sy] = pos2Coords(starship.x, starship.y);
        const canvasVisionRadius = starship.visionRadius * physToCanvasScale;

        ctx.beginPath();
        ctx.arc(sx, sy, canvasVisionRadius, 0, Math.PI * 2);

        if (starship.nearbyRocks.length === 0) {
        ctx.fillStyle = "#08e90048";
        } else {
        ctx.fillStyle = "#a5000048";
        }

        ctx.fill();
        drawDangerLines();
        // --- VELOCITY DIRECTION ARROW ---
        const vx = starship.vx;
        const vy = starship.vy;
        const speed = Math.hypot(vx, vy);

        if (speed > 1e-3) {
          const arrowScale = 40; // visual length
          const ex = starship.x + arrowScale * vx / speed;
          const ey = starship.y + arrowScale * vy / speed;

          const [exC, eyC] = pos2Coords(ex, ey);

          ctx.save();
          ctx.strokeStyle = "rgba(0, 255, 120, 0.8)";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(exC, eyC);
          ctx.stroke();

          ctx.restore();
        }


        // Draw small starship
          ctx.drawImage(
            starship.img,
            sx - starship.w / 2,
            sy - starship.h / 2,
            starship.w,
            starship.h
        );
        }
  requestAnimationFrame(render);

}

// Necessary velocity to orbit a body with mass m at a distance r
// v = sqrt(G*m/r)
function computeEscapeVelocity(mass, point1, point2){
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    // Compute tangential unit vector
    const tx = -dy/dist;
    const ty = dx/dist;

    // circular orbit velocity
    const v = Math.sqrt(G*mass/dist);

    return [v*tx, v*ty]
}

function globalReset(startBtn){
    isRunning = false; // pauses motion
    rocks = []; // resets rocks
    generateRocks(); // refills rocks array
    missionActive = false; // removes view of starship
    // Reset position and velocity of ship
    starship.x = initialStarshipX;
    starship.y = initialStarshipY;
    starship.vx = 0;
    starship.vy = 0;
    governedReference = null;
    deadlockScore = 0;
    deadlockDetected = false;
    //
    const launchBtn = document.getElementById("launch");
    launchBtn.style.display = "inline-block";

    startBtn.innerText = "Initiate System";
    startBtn.style.backgroundColor = "#15ff00"; 
}



document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('simCanvas');
    ctx = canvas.getContext('2d');
    startBtn = document.getElementById('start-simulation');
    resetBtn = document.getElementById('reset-global');
    
    window.addEventListener('resize', resize);
    resize();

    generateRocks();

    startBtn.addEventListener('click', () => {
        // Toggle the boolean
        isRunning = !isRunning;
        if (isRunning) {
            startBtn.innerText = "Pause System";
            startBtn.style.backgroundColor = "#fffb1f"; 
        } else {
            startBtn.innerText = "Initiate System";
            startBtn.style.backgroundColor = "#15ff00"; 
        }
    });


    // FPS display
    fpsDisplay = document.getElementById("fps-display");

    render();

    resetBtn.addEventListener("click", () => {
        globalReset(startBtn);
    });



    const missionOptions = document.querySelectorAll(".mission-option");

    missionOptions.forEach(option => {
    option.addEventListener("click", () => {
        if (missionActive){
            return;
        }
        // Remove active from all
        missionOptions.forEach(o => o.classList.remove("active"));

        // Activate clicked
        option.classList.add("active");

        // Store selected mission
        selectedPath = option.dataset.mission;

        console.log("Selected mission:", selectedPath);
    });
    });


    const warningOverlay = document.getElementById("launch-warning");

    function showLaunchWarning(message) {
        warningOverlay.querySelector(".overlay-card").innerText = message;
        warningOverlay.classList.remove("hidden");

        // Auto-hide after 1.5s
        setTimeout(() => {
            warningOverlay.classList.add("hidden");
        }, 1500);
    }



    const controlOptions = document.querySelectorAll(".control-option");

    controlOptions.forEach(option => {
    option.addEventListener("click", () => {
        if (missionActive){
          return;
        }

        controlOptions.forEach(o => o.classList.remove("active"));
        option.classList.add("active");

        controlLaw = option.dataset.control;
        console.log("Selected control law:", controlLaw);
    });
    });


  const launchBtn = document.getElementById("launch");

  launchBtn.addEventListener("click", () => {
    if (!isRunning) {
      showLaunchWarning("Initiate system first before launching");
      return;
    }

    if (missionActive) return;

    console.log("===========================");
    console.log("||   Initiating launch   ||");
    console.log("===========================");

    missionActive = true;

    // Hide launch button
    launchBtn.style.display = "none";

  });


//     // Mission container
//     missionsContainer = document.getElementById("missions-container");


    // Time controls
    timeDisplay = document.getElementById("time-display");

    
});