
// Three-body simulation with simple Euler integration

let ctx;
let G = 1; // Gravitational constant scaled for visualization
const dt = 0.01;
let frameCount = 0;
let simulationTime = 0;
let animationId = null;
let running = false;
let width;
let height;
let isDragging = false;
let bodies = [];
let cnt = 0;
let multiplier = 1;
let zoomFactor = 1; // pixels per unit of distance
let centerX;
let centerY;
let maxTrailLength = 900;
let stepsPerFrame = 500;
let defaultSteps = 500;

const trailColorMap = new Map([
  ["earth", "green"],
  ["extraterrestrial", "red"],
  ["neptune", "blue"],
]);

const celestialObjects = new Map();
//0.0123/333
//i scaled down masses from 333,000 to 1000 (max) so divided by 333
celestialObjects.set('earth', {name: 'earth', stateVector: {}, size: 35, mass: 20, trail: [], trailColor: trailColorMap.get("earth"), inSimulation: false, image: Object.assign(new Image(), {src: "images/earth.png"})});
celestialObjects.set('neptune', {name: 'neptune', stateVector: {}, size: 35, mass: 25, trail: [], trailColor: trailColorMap.get("neptune"), inSimulation: false, image: Object.assign(new Image(), {src: "images/neptune.png"})});
celestialObjects.set('extraterrestrial', {name: 'extraterrestrial', stateVector: {}, size: 35, mass: 18, trail: [], trailColor: trailColorMap.get("extraterrestrial"), inSimulation: false, image: Object.assign(new Image(), {src: "images/randomPlanet.png"})});
let maxPlanetSize = Math.max(celestialObjects.get("earth").size, celestialObjects.get("neptune").size, celestialObjects.get("extraterrestrial").size);
let defaultEarthMass = 20;
let defaultNeptuneMass = 25;
let defaultExtratMass = 18;
let earthMass = defaultEarthMass;
let neptuneMass = defaultEarthMass;
let extratMass = defaultExtratMass;

const name2Mass = new Map();
name2Mass.set("earth", defaultEarthMass);
name2Mass.set("neptune", defaultNeptuneMass);
name2Mass.set("extraterrestrial", defaultExtratMass);

/*equations of motion:
For n-bodies, we have n-second order vector differential equations. Usually, vectors for 3D,
but I am simplifying and only considering planar trajectories so no z-dimension or forces.
So we have n-2nd order vector equations made up of two ODEs themselves. So, we actually
have 2*n second order ODEs, which break into 2*2*n = 4n first order ODEs.
Each body has 2 ODEs, and both are second order so can be broken into 2 ODE in place of that one.
So we have 4 ODEs per body. Each ODE depends on the state of every other body.

*/


function computeAcceleration(x, y, selfIndex) {
  let ax = 0;
  let ay = 0;

  for (let j = 0; j < bodies.length; j++) {
    if (j === selfIndex) continue;
    const other = bodies[j];

    const dx = other.stateVector.x - x;
    const dy = other.stateVector.y - y;
    const softening = maxPlanetSize * 4; // or 3x
    const distSq = dx * dx + dy * dy + softening * softening;
    const dist = Math.sqrt(distSq);



    const force = G * other.mass / (distSq * dist); // equivalent to Gm / r^3

    ax += force * dx;
    ay += force * dy;
  }

  return { ax, ay };
}

function updatePlanetsRK4() {
  for (let i = 0; i < bodies.length; i++) {
    const p = bodies[i];
    const { x, y, Xvelocity: vx, Yvelocity: vy } = p.stateVector;

    // k1
    const a1 = computeAcceleration(x, y, i);
    const k1vx = a1.ax * dt;
    const k1vy = a1.ay * dt;
    const k1x = vx * dt;
    const k1y = vy * dt;

    // k2
    const a2 = computeAcceleration(x + k1x / 2, y + k1y / 2, i);
    const k2vx = a2.ax * dt;
    const k2vy = a2.ay * dt;
    const k2x = (vx + k1vx / 2) * dt;
    const k2y = (vy + k1vy / 2) * dt;

    // k3
    const a3 = computeAcceleration(x + k2x / 2, y + k2y / 2, i);
    const k3vx = a3.ax * dt;
    const k3vy = a3.ay * dt;
    const k3x = (vx + k2vx / 2) * dt;
    const k3y = (vy + k2vy / 2) * dt;

    // k4
    const a4 = computeAcceleration(x + k3x, y + k3y, i);
    const k4vx = a4.ax * dt;
    const k4vy = a4.ay * dt;
    const k4x = (vx + k3vx) * dt;
    const k4y = (vy + k3vy) * dt;

    // Final position and velocity update
    p.stateVector.x += (k1x + 2 * k2x + 2 * k3x + k4x) / 6;
    p.stateVector.y += (k1y + 2 * k2y + 2 * k3y + k4y) / 6;
    p.stateVector.Xvelocity += (k1vx + 2 * k2vx + 2 * k3vx + k4vx) / 6;
    p.stateVector.Yvelocity += (k1vy + 2 * k2vy + 2 * k3vy + k4vy) / 6;

    //console.log("new position: ", p.stateVector.x, ", ", p.stateVector.y);
  }
}


function euclideanDistance(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}


function animate(){
  cnt++;
  if (cnt%280 === 0 || cnt >= 280){
    console.log("one month cycle");
    cnt = 0;
    multiplier++;
    if (multiplier < 12){
    document.getElementById("time-display").textContent = "Month: " + (Math.floor(multiplier)).toString();
    }
    else{
      if(Math.floor(multiplier/12) === 1){
        if (multiplier%12 === 1){
        document.getElementById("time-display").textContent = (Math.floor(multiplier/12)).toString() + " year and " + ((multiplier%12).toFixed()).toString() + " month";
        }
        else{
          document.getElementById("time-display").textContent = (Math.floor(multiplier/12)).toString() + " year and " + ((multiplier%12).toFixed()).toString() + " months";
        }
      }
      else{
        if (multiplier%12 ===1){
          document.getElementById("time-display").textContent = (Math.floor(multiplier/12)).toString() + " years and " + ((multiplier%12).toFixed()).toString() + " month";
        }
        else{
          document.getElementById("time-display").textContent = (Math.floor(multiplier/12)).toString() + " years and " + ((multiplier%12).toFixed()).toString() + " months";
        }
      }
    }
  }

    for (let i = 0; i < stepsPerFrame; i++) {
      updatePlanetsRK4();
    }

    let maxX = Math.max(...bodies.map(b => Math.abs(b.stateVector.x)));
    let maxY = Math.max(...bodies.map(b => Math.abs(b.stateVector.y)));

    const xWeight = 1.0;   
    const yWeight = 1.5;   

    let adjustedX = maxX * xWeight;
    let adjustedY = maxY * yWeight;


    const xMargin = 10;
    const yMargin = 10;

    let zoomX = width / (2 * adjustedX + xMargin);
    let zoomY = height / (2 * adjustedY + yMargin);


    let targetZoom = Math.min(1, zoomX, zoomY);
    zoomFactor = targetZoom;  



    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    for (const body of bodies) {
    updateTrail(body);
    drawTrail(ctx, body, body.trailColor);
  }

  drawBodies();
  //console.log("running......");
  animationId = requestAnimationFrame(animate);
}


function drawTrail(ctx, body, color) {
  ctx.beginPath();
  for (let i = 0; i < body.trail.length - 1; i++) {
    const p1 = body.trail[i];
    const p2 = body.trail[i + 1];

    const s1 = worldToScreen(p1.x, p1.y);
    const s2 = worldToScreen(p2.x, p2.y);
    ctx.moveTo(s1.screenX, s1.screenY);
    ctx.lineTo(s2.screenX, s2.screenY);

  }
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawBodies(){
  for(let i = 0; i < bodies.length; i++){
    const planet = bodies[i];
    //console.log(planet.image.src);
    const screen = worldToScreen(planet.stateVector.x, planet.stateVector.y);
    console.log("drawing: ", screen);
    ctx.drawImage(
      planet.image,
      screen.screenX - planet.size / 2,
      screen.screenY - planet.size / 2,
      planet.size,
      planet.size
    );



  }
}

function updateTrail(body) {
  //const maxTrailLength = 15000; // adjust for performance/appearance
  body.trail.push({ x: body.stateVector.x, y: body.stateVector.y });

  if (body.trail.length > maxTrailLength) {
    body.trail.shift();
  }
}

function worldToScreen(x, y) {
    return {
        screenX: centerX + x * zoomFactor,
        screenY: centerY - y * zoomFactor
    };
}



function body2Simulation(bodyName, xCoord, yCoord) {
    //convert canvas coords to x,y cartesian coords
    //we want x = 0 to correspond to width/2 (the middle, so our graph is centered in the middle of the canvas)

    let newX = xCoord - width/2;
    let newY = -yCoord + height/2;

    const body = celestialObjects.get(bodyName);
    body.stateVector.x = newX;
    body.stateVector.y = newY;
    body.stateVector.Xvelocity = 0;
    body.stateVector.Yvelocity = 0; 
    body.mass = name2Mass.get(bodyName);
    bodies.push(body);
    drawBodies();

}

function toggleMassInputs(disabled) {
  document.getElementById("earth-mass").disabled = disabled;
  document.getElementById("neptune-mass").disabled = disabled;
  document.getElementById("alien-mass").disabled = disabled;
}



function startSimulation() {
  toggleMassInputs(true);
  animate();
}

function applyMassInputs() {
  const earthMass = parseFloat(document.getElementById("earth-mass").value);
  const neptuneMass = parseFloat(document.getElementById("neptune-mass").value);
  const alienMass = parseFloat(document.getElementById("alien-mass").value);

  if (!isNaN(earthMass)) celestialObjects.get("earth").mass = earthMass;
  if (!isNaN(neptuneMass)) celestialObjects.get("neptune").mass = neptuneMass;
  if (!isNaN(alienMass)) celestialObjects.get("extraterrestrial").mass = alienMass;
}


function resetStates(){
  for(let i = 0; i < bodies.length; i++){
    const body = bodies[i];
    body.stateVector = {};
    body.trail = [];
    console.log("reset state for: ", body);
  }
  bodies = [];
  let earthX = width/2 + Math.random()*120 - 60;
  let earthY = height - (1/2.5)*height + Math.random()*120 - 60;
  let neptuneX = (1/2.5)*width + Math.random()*120 - 60;
  let neptuneY = (1/2.5)*height + Math.random()*120 - 60;
  let alienX = width - (1/2.5)*width + Math.random()*120 - 60;
  let alienY =  (1/2.5)*height + Math.random()*120 - 60;


  body2Simulation('earth', earthX, earthY, true);
  body2Simulation('neptune', neptuneX, neptuneY, true);
  body2Simulation('extraterrestrial', alienX, alienY, true);
}

function resetSimulation() {
  running = false;
  if (animationId !== null){
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  toggleMassInputs(false);
  simulationTime = 0;
  frameCount = 0;
  zoomFactor = 1;
  stepsPerFrame = defaultSteps;
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");
  speedSlider.value = Math.floor(defaultSteps/100);
  speedValue.textContent = speedSlider.value;
  stepsPerFrame = defaultSteps;
  document.getElementById("earth-mass").value = defaultEarthMass;
  document.getElementById("neptune-mass").value = defaultNeptuneMass;
  document.getElementById("alien-mass").value = defaultExtratMass;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  resetStates();
  console.log('rewrote canvas');
  cnt = 0;
  multiplier = 1;
  document.getElementById("time-display").textContent = "Month: 1";
  G = 1;
  document.getElementById("start-simulation").textContent = "Click to Start Simulation";
}

function preloadAllPlanetImages(callback) {
  const planetNames = ['extraterrestrial', 'earth', 'neptune'];
  let loaded = 0;

  for (const name of planetNames) {
    const obj = celestialObjects.get(name);
    const img = new Image();
    img.src = obj.image.src;
    img.onload = () => {
      obj.image = img;
      loaded++;
      if (loaded === planetNames.length) {
        callback(); // all images are ready
      }
    };
    img.onerror = () => console.error(`Failed to load image for ${name}`);
  }
}



document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("simCanvas");
  ctx = canvas.getContext("2d");
  height = ctx.canvas.height;
  width = ctx.canvas.width;
  centerX = width/2;
  centerY = height/2
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  preloadAllPlanetImages(() => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    resetStates();
  });


//   document.getElementById("modeSelect").addEventListener("change", function (e) {
//   G = parseFloat(e.target.value);
// });

    document.getElementById("start-simulation").addEventListener("click", () => {
      const btn = document.getElementById("start-simulation");
      if (!running) {
        applyMassInputs(); 
        running = true;
        btn.textContent = "Pause";
        startSimulation();
      } else {
        running = false;
        cancelAnimationFrame(animationId);
        btn.textContent = "Resume";
      }
    });


  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");
  stepsPerFrame = Math.floor(parseInt(speedSlider.value)*100)

  speedSlider.addEventListener("input", () => {
    stepsPerFrame = Math.floor(parseInt(speedSlider.value)*100);
    speedValue.textContent = Math.floor(stepsPerFrame/100);
  });

  // document.getElementById("start-simulation").addEventListener("click", () => {
  //   const btn = document.getElementById("start-simulation");
  //   if (!running) {
  //     running = true;
  //     btn.textContent = "Pause";
  //     startSimulation();
  //   } else {
  //     running = false;
  //     cancelAnimationFrame(animationId);
  //     btn.textContent = "Resume";
  //   }
  // });

  document.getElementById("reset").addEventListener("click", () => {
    resetSimulation();
  });
});