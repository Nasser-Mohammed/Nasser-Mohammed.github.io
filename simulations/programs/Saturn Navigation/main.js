
let canvas;
let ctx;
const dt = 0.001;
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
const updateSteps = 100;

// Physical space dimensions
const finiteWidth = 1600; // Width of finite space we are considering
const finiteHeight = 1200; // Height of finite space we are considering
let physToCanvasScale;
// Initial positions
const satPos = [0, 0]; // center
const saturnMass = 100;
const saturn = {m: saturnMass, x: 0, y: 0, color: '#d1c596', radius: 60 , physicalRadius: 90};

// Rocks
const maxRocks = 500;
const radiusRange = [2, 5];
const colorRange = ['#888888', '#bbbbbb', '#dddddd', '#aaaaaa', '#777777'];
const variation = 0.25; // How much deviation along the boundary of the rock
let rocks = [];

// Path selection
let selectedPath = "lowSaturnOrbit";

// Control Law
let controlLaw = "proximityAvoidance";

// Freighter and starship
const starShipImg = new Image();
starShipImg.src = "images/spaceCraft.png";
const initialStarshipX = -700;
const initialStarshipY = 500;
const starship = {x: initialStarshipX, y: initialStarshipY, vx:0, vy:0, w: 20, h: 20, mass: 5, visionRadius: 35, nearbyRocks: [], img: starShipImg};


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



const ring1 = {
  inner: ringDist1,
  outer: ringDist1 + 75
};

const ring2 = {
  inner: ringDist2,
  outer: ringDist2 + 550
};

const orbitLowSaturn =
  0.7 * (ring1.inner);

const orbitMidGap =
  ring1.outer + 0.5 * (ring2.inner - ring1.outer);

  const orbitInnerRing =
  ring2.inner + 0.5 * (ring2.outer - ring2.inner);

const ECC = 0.9;

const THRUST_MAG = 0.01;
const THRUST_CRUISE = 0.015;
const THRUST_PANIC  = 0.05;
const THRUST_HARD   = 0.08; // Saturn exclusion


const THRUST_DIRS = [
  [ 1,  0],  // right
  [-1,  0],  // left
  [ 0,  1],  // up
  [ 0, -1],  // down

  [ 1,  1],  // up-right
  [-1,  1],  // up-left
  [ 1, -1],  // down-right
  [-1, -1],  // down-left
].map(([x, y]) => {
  const n = Math.hypot(x, y);
  return [THRUST_MAG * x / n, THRUST_MAG * y / n];
});




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

function generateRocks(){
    let ringDist = ringDist1;
    let color = "#ac9393"
    let bandWidth = 75;
    for (let i = 0; i < maxRocks; i++){
        if (i > maxRocks/10 && i <= 2*maxRocks/3){
            ringDist = ringDist2;
            color = '#ebe2e2'
            bandWidth = 550;
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
        rocks.push({x, y, radius, color});
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


function quantizeThrust(ax, ay, thrust) {
  // No command
  if (ax === 0 && ay === 0) return [0, 0];

  // Angle of desired acceleration
  const theta = Math.atan2(ay, ax);

  // 8 directions (45° increments)
  const dirs = [
    [ 1,  0],  // E
    [ 1,  1],  // NE
    [ 0,  1],  // N
    [-1,  1],  // NW
    [-1,  0],  // W
    [-1, -1],  // SW
    [ 0, -1],  // S
    [ 1, -1],  // SE
  ];

  let best = [0, 0];
  let bestDot = -Infinity;

  for (const [dx, dy] of dirs) {
    const mag = Math.hypot(dx, dy);
    const ux = dx / mag;
    const uy = dy / mag;

    const dot = ux * Math.cos(theta) + uy * Math.sin(theta);
    if (dot > bestDot) {
      bestDot = dot;
      best = [ux, uy];
    }
  }

  return [thrust * best[0], thrust * best[1]];
}



function proximityController() {
  const sx = starship.x;
  const sy = starship.y;
  const vx = starship.vx;
  const vy = starship.vy;

  const speed = Math.hypot(vx, vy);
  const shipRadius = 0.5 * Math.max(starship.w, starship.h);

  let ax = 0;
  let ay = 0;

  // ============================
  // HARD SATURN EXCLUSION
  // ============================
  const dxS = sx - saturn.x;
  const dyS = sy - saturn.y;
  const rS  = Math.hypot(dxS, dyS);

  if (rS < saturnHardRadius) {
    return quantizeThrust(dxS, dyS, THRUST_HARD);
  }

  // ============================
  // ROCK PANIC ZONE (DISTANCE)
  // ============================
  let panicAx = 0;
  let panicAy = 0;
  let rockThreat = false;

  for (const rock of starship.nearbyRocks) {
    const dx = sx - rock.x;
    const dy = sy - rock.y;
    const r  = Math.hypot(dx, dy);
    if (r < 1e-6) continue;

    const safe =
      shipRadius + rock.radius
      + 20
      + 2.5 * Math.hypot(vx, vy)
      + 0.5 * updateSteps * dt * Math.hypot(vx, vy);


    if (r < safe) {
      rockThreat = true;

      const nx = dx / r;
      const ny = dy / r;

      panicAx += 1.4 * nx;
      panicAy += 1.4 * ny;

      // Brake if moving toward rock
      if (vx * dx + vy * dy < 0) {
        panicAx += -1.6 * vx;
        panicAy += -1.6 * vy;
      }
    }
  }

  // --- PANIC OVERRIDE ---
  if (rockThreat) {
    return quantizeThrust(panicAx, panicAy, THRUST_PANIC);
  }

  // ============================
  // ORBIT FOLLOW (CALM MODE)
  // ============================
  const r = Math.hypot(sx, sy);
  const rDesired = desiredOrbitRadius();

  ax += -0.02 * (r - rDesired) * (sx / r);
  ay += -0.02 * (r - rDesired) * (sy / r);

  ax += 0.02 * (-sy / r);
  ay += 0.02 * ( sx / r);

  // ============================
  // SPEED DAMPING
  // ============================
  ax += -0.45 * vx;
  ay += -0.45 * vy;

  return quantizeThrust(ax, ay, THRUST_CRUISE);
}



function trajectoryController() {
  const sx = starship.x;
  const sy = starship.y;
  const vx = starship.vx;
  const vy = starship.vy;

  const speed2 = vx*vx + vy*vy;
  const shipRadius = 0.5 * Math.max(starship.w, starship.h);

  let ax = 0;
  let ay = 0;

  // ============================
  // HARD SATURN EXCLUSION
  // ============================
  const dxS = sx - saturn.x;
  const dyS = sy - saturn.y;
  const rS  = Math.hypot(dxS, dyS);

  if (rS < saturnHardRadius) {
    return quantizeThrust(dxS, dyS, THRUST_HARD);
  }

  // ============================
  // TRAJECTORY COLLISION CHECK
  // ============================
  let panicAx = 0;
  let panicAy = 0;
  let collisionThreat = false;

  if (speed2 > 1e-6) {
    for (const rock of starship.nearbyRocks) {
      const rx = rock.x - sx;
      const ry = rock.y - sy;

      const vdot = rx * vx + ry * vy;
      if (vdot <= 0) continue; // not heading toward

      const t = vdot / speed2;
      if (t > 3.0) continue; // too far in future

      const cx = rx - vx * t;
      const cy = ry - vy * t;
      const d  = Math.hypot(cx, cy);

      const safe =
        shipRadius + rock.radius
        + 20
        + 2.5 * Math.hypot(vx, vy)
        + 0.5 * updateSteps * dt * Math.hypot(vx, vy);


      if (d < safe) {
        collisionThreat = true;

        const nx = cx / d;
        const ny = cy / d;
        const tx = -ny;
        const ty =  nx;

        panicAx += 0.7 * nx + 0.3 * tx;
        panicAy += 0.7 * ny + 0.3 * ty;
      }
    }
  }

  // --- PANIC OVERRIDE ---
  if (collisionThreat) {
    return quantizeThrust(panicAx, panicAy, THRUST_PANIC);
  }

  // ============================
  // ORBIT FOLLOW (CALM MODE)
  // ============================
  const r = Math.hypot(sx, sy);
  const rDesired = desiredOrbitRadius();

  ax += -0.02 * (r - rDesired) * (sx / r);
  ay += -0.02 * (r - rDesired) * (sy / r);

  ax += 0.02 * (-sy / r);
  ay += 0.02 * ( sx / r);

  // ============================
  // SPEED DAMPING
  // ============================
  ax += -0.45 * vx;
  ay += -0.45 * vy;

  return quantizeThrust(ax, ay, THRUST_CRUISE);
}







function controller(){
  let [Ux, Uy] = [0, 0];
  switch (controlLaw){
    case "proximityAvoidance":
      [Ux, Uy] = proximityController();
      break;
    case "trajectoryAvoidance":
      [Ux, Uy] = trajectoryController();
      break;

    default:
      [Ux, Uy] = proximityController();
  }

  return [Ux, Uy];
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

  if (r < saturnHardRadius) {
    gravityScale = 0.0; // absolute no-pull zone
  } else if (r < saturnHardRadius + 80) {
    gravityScale = (r - saturnHardRadius) / 80;
  }

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
    const orbitalVelocity = Math.sqrt(G*saturn.m/dist);
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
    starship.nearbyRocks = getVisibleRocks();
    [controlUx, controlUy] = controller();
}

    if(isRunning){
    // update physics of aircraft wrt Saturn's gravity
    // symplectic euler integration
    for (let i = 0; i < updateSteps; i++){
        if (missionActive){
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
    selectedPath = "lowSaturnOrbit";
    // Reset position and velocity of ship
    starship.x = initialStarshipX;
    starship.y = initialStarshipY;
    starship.vx = 0;
    starship.vy = 0;
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