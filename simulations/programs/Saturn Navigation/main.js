
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
const updateSteps = 250;

// Physical space dimensions
const finiteWidth = 1600; // Width of finite space we are considering
const finiteHeight = 1200; // Height of finite space we are considering
let physToCanvasScale;

// Initial positions
const satPos = [0, 0]; // center
const saturnMass = 500;
const saturn = {m: saturnMass, x: 0, y: 0, color: '#d1c596', radius: 80 , physicalRadius: 90};

// Rocks
const maxRocks = 750;
const radiusRange = [1, 4];
const colorRange = ['#888888', '#bbbbbb', '#dddddd', '#aaaaaa', '#777777'];
const variation = 0.25; // How much deviation along the boundary of the rock
let rocks = [];

// Path selection
let selectedPath = "lowSaturnOrbit";

// Freighter and starship
const starShipImg = new Image();
starShipImg.src = "images/spaceCraft.png";
const initialStarshipX = -700;
const initialStarshipY = 500;
const starship = {x: initialStarshipX, y: initialStarshipY, vx:0, vy:0, w: 30, h: 30, mass: 20, visionRadius: 40, nearbyRocks: [], img: starShipImg};


const freighterImg = new Image();
freighterImg.src = "images/freighter.png";
const initialFreighterX = -750;
const initialFreighterY = 550;
const freighter = {x: initialFreighterX, y: initialFreighterY, vx: 0, vy: 0, w: 75, h: 75, mass: 100, img: freighterImg};

let missionActive = false;

// Ring definitions
let ringDist1 = 110;
let ringDist2 = 315;
let dashPhase = 0;


const ring1 = {
  inner: saturn.radius + ringDist1,
  outer: saturn.radius + ringDist1 + 75
};

const ring2 = {
  inner: saturn.radius + ringDist2,
  outer: saturn.radius + ringDist2 + 350
};

const orbitLowSaturn =
  0.5 * (saturn.radius + ring1.inner);

const orbitMidGap =
  0.5 * (ring1.outer + ring2.inner);

  const orbitInnerRing =
  0.5 * (ring2.inner + ring2.outer);

const ECC = 0.95;



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
            bandWidth = 350;
        }
        else if(i > 2*maxRocks/3){
            //ringDist = 560;
            color = '#494242'
            //bandWidth = 125;
        }
        const angle = Math.random()*2*(Math.PI);
        const dist = saturn.radius + ringDist + Math.random()*bandWidth;
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


function starshipVision(){

}

function controller() {
  let ax = 0;
  let ay = 0;

  const sx = starship.x;
  const sy = starship.y;

  // Avoid Saturn
  const dxS = sx - saturn.x;
  const dyS = sy - saturn.y;
  const rS = Math.hypot(dxS, dyS);

  const saturnSafeRadius = saturn.radius + 40;

  if (rS < saturnSafeRadius) {
    const strength = 0.5 * (saturnSafeRadius - rS) / saturnSafeRadius;
    ax += strength * (dxS / rS);
    ay += strength * (dyS / rS);
  }

  // Avoid rocks
  for (const rock of starship.nearbyRocks) {
    const dx = sx - rock.x;
    const dy = sy - rock.y;
    const r = Math.hypot(dx, dy);
    if (r < 1e-6) continue;

    const strength = 0.5 * (starship.visionRadius - r) / starship.visionRadius;
    ax += strength * (dx / r);
    ay += strength * (dy / r);
  }

  // Weak orbit correction
  const r = Math.hypot(sx, sy);
  const rDesired = desiredOrbitRadius();
  const orbitGain = 0.01;

  ax += -orbitGain * (r - rDesired) * (sx / r);
  ay += -orbitGain * (r - rDesired) * (sy / r);

  // Deadzone
  const deadzone = 0.05;
  if (Math.abs(ax) < deadzone) ax = 0;
  if (Math.abs(ay) < deadzone) ay = 0;

  // Quantize
  const thrust = 0.005;
  let Ux = 0, Uy = 0;

  if (Math.abs(ax) > Math.abs(ay)) {
    Ux = thrust * Math.sign(ax);
  } else {
    Uy = thrust * Math.sign(ay);
  }

  return [Ux, Uy];
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
    // Relative position (toward Saturn)
    const dx = saturn.x - starship.x;
    const dy = saturn.y - starship.y;


    const r = Math.hypot(dx, dy);

    // Safety guard to avoid blow-up
    if (r < 1e-6) return;

    // Gravitational acceleration
    const factor = G * saturn.m / (r * r * r);
    const ax = factor * dx;
    const ay = factor * dy;

    const [Ux, Uy] = controller();


    const totalAx = ax + Ux;
    const totalAy = ay + Uy;

    // Symplectic Euler update
    starship.vx += totalAx * dt;
    starship.vy += totalAy * dt;

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

        starship.nearbyRocks = getVisibleRocks();

        ctx.beginPath();
        ctx.arc(sx, sy, canvasVisionRadius, 0, Math.PI * 2);

        if (starship.nearbyRocks.length === 0) {
        ctx.fillStyle = "#08e90048";
        } else {
        ctx.fillStyle = "#a5000048";
        }

        ctx.fill();


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



//     const controlOptions = document.querySelectorAll(".control-option");

//     controlOptions.forEach(option => {
//     option.addEventListener("click", () => {
//         controlOptions.forEach(o => o.classList.remove("active"));
//         option.classList.add("active");

//         selectedControlLaw = option.dataset.control;
//         console.log("Selected control law:", selectedControlLaw);
//     });
//     });


    const launchBtn = document.getElementById("launch");
    launchBtn.addEventListener("click", () => {
        if (!isRunning){
            let errorMessage = "Initiate system first before launching ";
            showLaunchWarning(errorMessage);
            return;
            }
        else{
            if (missionActive){
                return;
            }
        console.log("===========================");
        console.log("||   Initiating launch   ||");
        console.log("===========================");
        // initiateLaunch() calls addMission() to log the mission then 
        // addMission() calls executeLaunch() to actually launch once initialized
        missionActive = true;
        }
        });

//     // Mission container
//     missionsContainer = document.getElementById("missions-container");


    // Time controls
    timeDisplay = document.getElementById("time-display");

    
});