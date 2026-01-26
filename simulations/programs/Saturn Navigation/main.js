
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
let controlLaw = "3Layer";

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

function desiredOrbitState() {
  const { a, b } = getReferenceOrbitParams();

  const theta = orbitPhase;

  const xd = a * Math.cos(theta);
  const yd = b * Math.sin(theta);

  // Tangent velocity
  const { a: aa } = getReferenceOrbitParams();
  const omegaNom = 5 * Math.sqrt(G * saturn.m / (aa * aa * aa));
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

function velocitySafetyFilter(axNom, ayNom) {
  const vx = starship.vx;
  const vy = starship.vy;

  const v2 = vx*vx + vy*vy;
  const R  = starship.visionRadius;

  // Barrier RHS
  const rhs = A_MAX * R - 0.5 * ALPHA * v2;

  // If already safe, do nothing
  const dot = vx * axNom + vy * ayNom;
  if (dot <= rhs) {
    return [axNom, ayNom];
  }

  // Otherwise project acceleration
  const vNorm2 = v2 + 1e-6;
  const lambda = (dot - rhs) / vNorm2;

  const axSafe = axNom - lambda * vx;
  const aySafe = ayNom - lambda * vy;

  return [axSafe, aySafe];
}

function rockSafetyFilter(ax, ay) {
  let axSafe = ax;
  let aySafe = ay;

  const sx = starship.x;
  const sy = starship.y;
  const vx = starship.vx;
  const vy = starship.vy;

  const dMin = 18;     // safety distance
  const alpha = 1.2;   // barrier gain

  for (const rock of starship.nearbyRocks) {
    const rx = sx - rock.x;
    const ry = sy - rock.y;
    const r2 = rx*rx + ry*ry;

    if (r2 < 1e-6) continue;

    const dvx = vx;   // rock velocity approx zero (or fill in)
    const dvy = vy;

    const rhs =
      -(dvx*dvx + dvy*dvy)
      - alpha * (rx*dvx + ry*dvy);

    const dot = rx*axSafe + ry*aySafe;

    if (dot < rhs) {
      const norm2 = r2 + 1e-6;
      const lambda = (rhs - dot) / norm2;

      axSafe += lambda * rx;
      aySafe += lambda * ry;
    }
  }
  // === Saturn safety barrier ===
  const rx = starship.x - saturn.x;
  const ry = starship.y - saturn.y;
  const r2 = rx*rx + ry*ry;

  if (r2 > 1e-6) {
    const vx = starship.vx;
    const vy = starship.vy;

    const dMin2 = SATURN_SAFE_RADIUS * SATURN_SAFE_RADIUS;

    // Only activate barrier when near Saturn
    if (r2 < dMin2 * 1.5) {
      const alpha = 2.0;

      const rhs =
        -(vx*vx + vy*vy)
        - alpha * (rx*vx + ry*vy);

      const dot = rx*axSafe + ry*aySafe;

      if (dot < rhs) {
        const lambda = (rhs - dot) / (r2 + 1e-6);
        axSafe += lambda * rx;
        aySafe += lambda * ry;
      }
    }
  }


  // === Tangential bias to break deadlocks ===
  const BIAS_GAIN = 0.01;  // small, constant

  const r = Math.hypot(starship.x, starship.y);
  if (r > 1e-6) {
    const tx = -starship.y / r;
    const ty =  starship.x / r;

    axSafe += BIAS_GAIN * tx;
    aySafe += BIAS_GAIN * ty;
  }


  return [axSafe, aySafe];
}

function referenceGovernor() {
  const sx = starship.x;
  const sy = starship.y;
  const vx = starship.vx;
  const vy = starship.vy;

  const vMag = Math.hypot(vx, vy);

  // Allow recovery even when slow
  if (vMag < 1e-3) {
    omegaScale += OMEGA_RECOVER * dt;
    omegaScale = Math.min(1.0, omegaScale);
    lastThreat = 0;
    return;
  }


  const vHatX = vx / vMag;
  const vHatY = vy / vMag;

  let threat = 0;

  // ===== ROCKS =====
  for (const rock of starship.nearbyRocks) {
    const rx = rock.x - sx;
    const ry = rock.y - sy;
    const r  = Math.hypot(rx, ry);
    if (r < 1e-6) continue;

    const cosAngle = (rx * vHatX + ry * vHatY) / r;
    if (cosAngle < 0.6) continue;

    // AMPLIFIED threat
    threat += 3.0 * cosAngle / (r + 5);
  }

  // ===== SATURN =====
  {
    const rx = -sx;
    const ry = -sy;
    const r  = Math.hypot(rx, ry);
    if (r > 1e-6) {
      const cosAngle = (rx * vHatX + ry * vHatY) / r;
      if (cosAngle > 0.6 && r < 250) {
        threat += 6.0 / (r + 5);
      }
    }
  }

  lastThreat = threat;

  // ===== GOVERNOR DYNAMICS =====
  if (threat > 0.005) {
    omegaScale -= OMEGA_SLOW * threat * dt;
  } else {
    omegaScale += OMEGA_RECOVER * dt;
  }

  omegaScale = Math.max(OMEGA_MIN, Math.min(1.0, omegaScale));
}




function orbitalPDControl() {
  const sx = starship.x;
  const sy = starship.y;
  const vx = starship.vx;
  const vy = starship.vy;

  const { xd, yd, vxd, vyd } = desiredOrbitState();

  const ex = sx - xd;
  const ey = sy - yd;

  const evx = vx - vxd;
  const evy = vy - vyd;

  const Kp = 0.01;
  const Kv = 0.18;

  const ax = -Kp * ex - Kv * evx;
  const ay = -Kp * ey - Kv * evy;

  return [ax, ay];
}





function controller() {
  let [ax, ay] = orbitalPDControl();
  [ax, ay] = velocitySafetyFilter(ax, ay);
  [ax, ay] = rockSafetyFilter(ax, ay);
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
    const orbitalVelocity = 3*Math.sqrt(G*saturn.m/dist);
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
    referenceGovernor(); 
    [controlUx, controlUy] = controller();
}

    if(isRunning){
    // update physics of aircraft wrt Saturn's gravity
    // symplectic euler integration
    for (let i = 0; i < updateSteps; i++){
      if (missionActive){
        // --- advance reference PHASE ---
        const { a } = getReferenceOrbitParams();
        const omegaNom = 5 * Math.sqrt(G * saturn.m / (a * a * a));
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

    // === Debug: Reference Governor ===
    ctx.save();
    ctx.fillStyle = "#00ff66";
    ctx.font = "14px monospace";
    ctx.fillText(`ω-scale: ${omegaScale.toFixed(2)}`, 100, 40);
    ctx.fillText(`threat: ${lastThreat.toFixed(3)}`, 100, 60);
    ctx.restore();


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