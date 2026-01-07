
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

let selectedVehicle = "satellite"; // sattelite by default
let selectedLocation = "leo"; // low earth orbit by default
let selectedControlLaw = "pid"; // default PID control

let missionsContainer;

let missions = new Map();
let satelliteCount = 0;
let probeCount = 0;
let rocketCount = 0;
let telescopeCount = 0;

let bodies = new Map();
//bodies.set('Sun', {m: 5000, pctX: 0, pctY: 0, color: '#ffcc00', radius: 35 });
bodies.set('Earth', {m: 810, pctX: 0.25, pctY: 0, color: '#00d2ff', trailColor: "#00d2ff", radius: 60 , physicalRadius: 75});
bodies.set('Moon', {m: 10, pctX: 0.30, pctY: 0, color: '#ffffff', trailColor: "#ffffff", radius: 28, physicalRadius: 40 });
//bodies.set('Mars', {m: 45, pctX: 0.45, pctY: 0, color: '#c75614', radius: 11 });

const names = ['Earth', 'Moon'];

const objects = []; // these are things that move according to the dynamics but dont necessarily exert force
// we use "names" to refer to bodies that exert force

const initState = new Map();
let state;

// Image paths and maps

const availableVehicles = new Map([
  ["satellite", [
    "images/smallSat.png",
    "images/randomSat.png",
    "images/ISS.png",
    "images/randomSat2.png"
  ]],

  ["telescope", [
    "images/hubble.png",
    "images/jamesWebb.png"
  ]],

  ["probe", [
    "images/voyager.png",
    "images/voyager1.png",
    "images/voyager2.png",
    "images/cassini.png"
  ]],

  ["rocket", [
    "images/falcon9.png",
    "images/randomRocket.png"
  ]]
]);

const loadedVehicleImages = new Map();


function renderMissionsCard() {
  // If no missions, remove the card entirely
  if (missions.size === 0) {
    missionsContainer.innerHTML = "";
    return;
  }

  // Create card container
  const card = document.createElement("div");
  card.className = "status-card mission-list-card";

  // Card label
  const label = document.createElement("span");
  label.className = "label";
  label.innerText = "Active Missions";
  card.appendChild(label);

  // Scrollable mission list container
  const list = document.createElement("div");
  list.className = "mission-list";

  missions.forEach(mission => {
    const item = document.createElement("div");
    item.className = "mission-item";

    item.innerHTML = `
    <div class="mission-name">${mission.vehicleName}</div>
    <div class="mission-meta">
        ${mission.missionType.toUpperCase()} • ${mission.controlLaw.toUpperCase()}
    </div>
    `;


    list.appendChild(item);
  });

  // Attach list to card
  card.appendChild(list);

  // Replace contents
  missionsContainer.innerHTML = "";
  missionsContainer.appendChild(card);
}


function preloadVehicleImages(vehicleMap) {
  const promises = [];

  vehicleMap.forEach((paths, vehicleType) => {
    const imgs = [];

    paths.forEach(path => {
      const img = new Image();
      img.src = path;
      imgs.push(img);

      promises.push(
        new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        })
      );
    });

    loadedVehicleImages.set(vehicleType, imgs);
  });

  return Promise.all(promises);
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
}

function updateTimeDisplay(simTime) {
    const totalSeconds = Math.floor(simTime);

    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);
    const month = Math.floor(totalDays / 30) + 1;

    const pad = n => n.toString().padStart(2, "0");

    timeDisplay.innerText =
        `T+ ${pad(hours)}:${pad(minutes)}:${pad(seconds)} (Month ${month})`;
    }

function pickRandomVehicleImage(vehicleType) {
  const options = loadedVehicleImages.get(vehicleType);
  if (!options || options.length === 0) return null;

  const idx = Math.floor(Math.random() * options.length);
  return options[idx];
}


function incrementVehicleCount(vehicle) {
  switch (vehicle) {
    case "satellite": return ++satelliteCount;
    case "telescope": return ++telescopeCount;
    case "probe": return ++probeCount;
    case "rocket": return ++rocketCount;
    default:
      console.error("Unknown vehicle type:", vehicle);
      return 0;
  }
}

function initiateLaunch(vehicle, mission, controller) {
  let location;
  switch (mission) {
    case "leo": location = "Low Earth Orbit"; break;
    case "geo": location = "Geostationary Orbit"; break;
    case "moon": location = "Lunar Surface"; break;
    case "moon-orbit": location = "Lunar Orbit"; break;
    case "l1": location = "L1 Lagrange Point"; break;
    case "l2": location = "L2 Lagrange Point"; break;
    case "l4": location = "L4 Lagrange Point"; break;
    case "l5": location = "L5 Lagrange Point"; break;
    default: location = "Low Earth Orbit";
  }

  console.log(
    "Launching",
    vehicle,
    "to",
    location,
    "with control law:",
    controller
  );

  addMission(vehicle, mission, controller);
}


function addMission(vehicle, mission, controller) {
  const count = incrementVehicleCount(vehicle);

  const sprite = pickRandomVehicleImage(vehicle);
  if (!sprite) {
    console.error("No sprite available for", vehicle);
    return;
  }
  let earthState = state.get("Earth");
  let moonState = state.get("Moon");
  const vehicleName = `${vehicle}-${count}`;
  const startState = {x: earthState.x, y: earthState.y, vx: 0, vy: 0};

  const missionObj = {
    vehicleName: vehicleName,
    vehicleCount: count,
    vehicleType: vehicle,
    missionType: mission,
    controlLaw: controller,
    sprite: sprite, 
    dynamicState: { ...startState }
  };

  missions.set(vehicleName, missionObj);
  state.set(vehicleName, { ...startState });
  names.push(vehicleName);
  bodies.set(vehicleName, { m: 0.01, img: sprite, radius: 20});
  renderMissionsCard();

  console.log("Mission added:", missionObj);
}

function getTargetPosition(missionType){

}

function computeControlAcceleration(bodyName, bodyState, currentState) {
    if (bodyName === "Earth" || bodyName === "Moon") {
        return { x: 0, y: 0 };
    }

    const mission = missions.get(bodyName);
    if (!mission) {
        return { x: 0, y: 0 };
    }

    if (mission.controlLaw !== "pid") {
        return { x: 0, y: 0 };
    }

    // Moon-relative targeting
    const moonState = currentState.get("Moon");

    // Relative position
    const rx = bodyState.x - moonState.x;
    const ry = bodyState.y - moonState.y;

    // Relative velocity
    const rvx = bodyState.vx - moonState.vx;
    const rvy = bodyState.vy - moonState.vy;

    // Gains (tune these)
    const Kp = 0.0005;
    const Kd = 0.05;

    return {
        x: -Kp * rx - Kd * rvx,
        y: -Kp * ry - Kd * rvy
    };
}


function symplecticEulerStep(bodyName, currentState){
    const bodyState = currentState.get(bodyName);
    const futureState = { ...bodyState}; // Copy current state

    // Compute net gravitational force from other bodies, by using gravitational law and summing each interaction. 
    // For each body the force is: F_x = (G*m2(x2 - x1))/(dist(body1, body2)^3)
    // F_y = (G*m2(y2 - y1))/(dist(body1, body2)^3)
    let ax = 0;
    let ay = 0;

    for (let j = 0; j < names.length; j++) {
        if (bodyName === names[j]) continue;
        if (names[j] !== "Earth" && names[j] !== "Moon") continue;

        const body2 = bodies.get(names[j]);
        const state2 = currentState.get(names[j]);

        const dx = state2.x - bodyState.x;
        const dy = state2.y - bodyState.y;

        const r2 = dx*dx + dy*dy;
        const r = Math.sqrt(r2);

        const R = body2.physicalRadius; // must exist on Earth/Moon
        const eps = 5; // softening length (tuneable)

        let ax_g, ay_g;

        if (r < R) {
            // Inside a uniform sphere: linear gravity
            const factor = G * body2.m / (R*R*R);
            ax_g = factor * dx;
            ay_g = factor * dy;
        } else {
            // Outside: softened inverse-square gravity
            const softened = Math.sqrt(r2 + eps*eps);
            const invR3 = 1.0 / (softened * softened * softened);
            ax_g = G * body2.m * dx * invR3;
            ay_g = G * body2.m * dy * invR3;
        }

    ax += ax_g;
    ay += ay_g;
    }
    // Now that we have total force, we can update the state (and compute acceleration)
    // Acceleration in x = F_x/mass
    // Acceleration in y = F_y/mass
    // We already divided the mass though, since we did not include body1's mass in the 
    // gravitational force calculations
    // So just update velocity with total force directly

    // if this is a vehicle, we can apply control here
    const controlAcceleration = computeControlAcceleration(bodyName, bodyState, currentState);
    ax += controlAcceleration.x;
    ay += controlAcceleration.y;

    futureState.vx += ax*dt;
    futureState.vy += ay*dt;

    // Now we can update position using the updated velocity (Symplectic Euler)
    futureState.x += futureState.vx*dt;
    futureState.y += futureState.vy*dt;

    return futureState;
}


function updatePhysics() {
    // For each body, compute the position and 
    // velocity update. We will need to calculate net gravitational force from all other bodies
    // for acceleration
    // In the current state, we only have 2 bodies and therefore only one interaction per body
    let newStates = [];
    let currentState = new Map(state);
    // This loop will update each body's state
    for (let i = 0; i < names.length; i++){
        const bodyName = names[i];

        const newState = symplecticEulerStep(bodyName, currentState);
        newStates.push(newState);
    }

    // Now update global state
    for (let i = 0; i < names.length; i++){
        state.set(names[i], newStates[i]);
    }


    time += dt;
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

function render(now= performance.now()){

    frameCount++;

  const delta = now - lastFpsUpdate;
  if (delta >= 500) {
    fps = Math.round((frameCount * 1000) / delta);
    frameCount = 0;
    lastFpsUpdate = now;

    fpsDisplay.innerText = `Simulation Active: ${fps} FPS`;
  }


  // Space background
  ctx.fillStyle = '#05060a'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  names.forEach(n => {
    let b = bodies.get(n);
    let currentState = state.get(n);
    const [x,y] = pos2Coords(currentState.x, currentState.y);
    if (n === "Moon" || n === "Earth"){
        ctx.beginPath();
        ctx.arc(x, y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        // Visual glow effect
        ctx.shadowBlur = 20; 
        ctx.shadowColor = b.color;
        ctx.fill(); 
        ctx.shadowBlur = 0;
        }
    else{ 
        // It's a vehicle and therefore we draw its image
        const img = b.img;
        const imgWidth = b.radius * 2;
        const imgHeight = b.radius * 2;
        console.log(x, y);
        ctx.drawImage(img, x - b.radius, y - b.radius, imgWidth, imgHeight);     
        }
  });

  if (isRunning) {
    for (let k = 0; k < updateSteps; k++){
    updatePhysics();
    }
  }
  updateTimeDisplay(time);
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
    state = new Map(initState);
    time = 0;
    isRunning = false;
    startBtn.innerText = "Initiate System";
    startBtn.style.backgroundColor = "#15ff00";
    missions = new Map();
    console.log("System reset. Current State: ", state);
    probeCount = 0;
    rocketCount = 0;
    satelliteCount = 0;
    telescopeCount = 0;

    bodies = new Map();
    bodies.set('Earth', {m: 810, pctX: 0.25, pctY: 0, color: '#00d2ff', trailColor: "#00d2ff", radius: 48 });
    bodies.set('Moon', {m: 10, pctX: 0.30, pctY: 0, color: '#ffffff', trailColor: "#ffffff", radius: 12 });
    names = ['Earth', 'Moon'];

    renderMissionsCard();
}



document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('simCanvas');
    ctx = canvas.getContext('2d');
    startBtn = document.getElementById('start-simulation');
    resetBtn = document.getElementById('reset-global');
    
    window.addEventListener('resize', resize);
    resize();

    

    const earthPos = [0, 0]
    const moonPos = [earthPos[0] + 1/5*finiteWidth, earthPos[1] + 1/5*finiteHeight];
    const [veloX,veloY] = computeEscapeVelocity(bodies.get("Earth").m, moonPos, earthPos);
    initState.set('Moon', {x: moonPos[0], y: moonPos[1], vx: veloX, vy: veloY});
    const moon = initState.get('Moon');
    const mEarth = bodies.get("Earth").m;
    const mMoon = bodies.get("Moon").m;
    initState.set('Earth', {x: earthPos[0], y: earthPos[1], vx: -1*(moon.vx) * mMoon / mEarth, vy: -1*(moon.vy) * mMoon / mEarth});

    state = new Map(initState);
    console.log("Initial State: ", state);
    console.log("Initial vehicle: ", selectedVehicle);
    console.log("Initial mission: ", selectedLocation);
    console.log("Initial control law: ", selectedControlLaw);

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

    resetBtn.addEventListener("click", () => {
        globalReset(startBtn);
    });

    const vehicleOptions = document.querySelectorAll(".vehicle-option");

    vehicleOptions.forEach(option => {
    option.addEventListener("click", () => {
        // Remove active from all
        vehicleOptions.forEach(o => o.classList.remove("active"));

        // Activate clicked
        option.classList.add("active");

        // Store selected vehicle
        selectedVehicle = option.dataset.vehicle;

        console.log("Selected vehicle:", selectedVehicle);
    });
    });

    const missionOptions = document.querySelectorAll(".mission-option");

    missionOptions.forEach(option => {
    option.addEventListener("click", () => {
        // Remove active from all
        missionOptions.forEach(o => o.classList.remove("active"));

        // Activate clicked
        option.classList.add("active");

        // Store selected mission
        selectedLocation = option.dataset.mission;

        console.log("Selected mission:", selectedLocation);
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
        controlOptions.forEach(o => o.classList.remove("active"));
        option.classList.add("active");

        selectedControlLaw = option.dataset.control;
        console.log("Selected control law:", selectedControlLaw);
    });
    });


    const launchBtn = document.getElementById("launch");
    launchBtn.addEventListener("click", () => {
        if (!isRunning){
            let errorMessage = "Initiate system first before launching " + selectedVehicle;
            showLaunchWarning(errorMessage);
            return;
            }
        else{
        console.log("===========================");
        console.log("||   Initiating launch   ||");
        console.log("===========================");
        // initiateLaunch() calls addMission() to log the mission then 
        // addMission() calls executeLaunch() to actually launch once initialized
        initiateLaunch(selectedVehicle, selectedLocation, selectedControlLaw);
        }
        });

    // Mission container
    missionsContainer = document.getElementById("missions-container");


    // Time controls
    timeDisplay = document.getElementById("time-display");

    // FPS display
    fpsDisplay = document.getElementById("fps-display");




   preloadVehicleImages(availableVehicles)
    .then(() => {
        console.log("All vehicle images loaded");
        render(); // safe to start
    })
    .catch(err => {
        console.error("Vehicle image load failed", err);
    });


    
});