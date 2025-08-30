
//Equations of motion
//4/3*l*theta''_1 + 1/2*l*theta''_2*cos(theta_1-theta_2) + 
//1/2*l*(theta'_2)^2*sin(theta_1-theta_2) + 3/2*g*sin(theta_1) = 0

//1/3*l*theta''_2 + 1/2*l*theta''_1*cos(theta_1-theta_2) -
//1/2*l*(theta'_1)^2*sin(theta_1-theta_2) + 1/2*g*sin(theta_2) = 0

let p1 = {length: 250, mass: 11, theta: 0, velocity: 0, acceleration: 0, x: 0, y: 0};
let p2 = {length: 120, mass: 20, theta: 0, velocity: 0, acceleration: 0, x: 0, y: 0};
let midLineHeight;
let midLineWidth;

let bolt1Radius = 20;
let bolt2Radius = 25;

const pi = Math.PI;
const g = 9.81;
console.log("constants are: pi: ", pi, " and g: ", g);

let isRunning = false;


let trail = [];
const maxTrailLength = 10000;
let trail2 = [];
const MAX_TRAIL_LENGTH = 1000000;
let fullTrail = [];
let visibleTrail = [];
let visitedPoints = new Set();



//this means it will rotate within a circle of radius 310
//canvas height is 750 and anchorLine is at 333 (which is height/2.25)
//this is sufficient room for the pendulum

let initial_x1;
let initial_y1;
let initial_x2;
let initial_y2;

const fixedDt = 0.005;

let accumulatedTime = 0;
const SIMULATION_SPEED = 5;
let speedMultiplier = 10;

let canvas;
let ctx;
let height;
let width;

let animationId;
let lastTime = null

let dampingEnabled = false;
const dampingFactor = 0.00004;


function timeStep(dt) {
  let m1 = p1.mass, m2 = p2.mass;
  let l1 = p1.length, l2 = p2.length;
  let g = 9.81;

  function derivatives(state) {
    let [a1, w1, a2, w2] = state;

    let delta = a2 - a1;

    let denom1 = (m1 + m2) * l1 - m2 * l1 * Math.cos(delta) * Math.cos(delta);
    let denom2 = (l2 / l1) * denom1;

    let a1_acc = (m2 * l1 * w1 * w1 * Math.sin(delta) * Math.cos(delta) +
                  m2 * g * Math.sin(a2) * Math.cos(delta) +
                  m2 * l2 * w2 * w2 * Math.sin(delta) -
                  (m1 + m2) * g * Math.sin(a1)) / denom1;

    let a2_acc = (-m2 * l2 * w2 * w2 * Math.sin(delta) * Math.cos(delta) +
                  (m1 + m2) * g * Math.sin(a1) * Math.cos(delta) -
                  (m1 + m2) * l1 * w1 * w1 * Math.sin(delta) -
                  (m1 + m2) * g * Math.sin(a2)) / denom2;

    return [w1, a1_acc, w2, a2_acc];
  }

  let state = [p1.theta, p1.velocity, p2.theta, p2.velocity];

  let k1 = derivatives(state);
  let k2 = derivatives(state.map((s, i) => s + dt * k1[i] / 2));
  let k3 = derivatives(state.map((s, i) => s + dt * k2[i] / 2));
  let k4 = derivatives(state.map((s, i) => s + dt * k3[i]));

  let newState = state.map((s, i) => s + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));

  p1.theta = newState[0];
  p1.velocity = newState[1];
  p2.theta = newState[2];
  p2.velocity = newState[3];

  if (dampingEnabled) {
  p1.velocity *= (1 - dampingFactor);
  p2.velocity *= (1 - dampingFactor);
}


  // Convert angles to Cartesian
  let x1 = l1 * Math.sin(p1.theta);
  let y1 = -l1 * Math.cos(p1.theta);

  let totalTheta = p1.theta + p2.theta;
  let x2 = x1 + l2 * Math.sin(p2.theta);
  let y2 = y1 - l2 * Math.cos(p2.theta);

  [p1.x, p1.y] = convert_xy_2_coords(x1, y1);

  [p2.x, p2.y] = convert_xy_2_coords(x2, y2);
  //fullTrail.push([p2.x, p2.y]);
  fullTrail.push({ x: p2.x, y: p2.y });

const gridSize = 2; // pixel quantization

const key = `${Math.round(p2.x / gridSize)}_${Math.round(p2.y / gridSize)}`;

if (!visitedPoints.has(key)) {
  visitedPoints.add(key);
  visibleTrail.push({ x: p2.x, y: p2.y });
}


}

function drawTrail() {
  if (visibleTrail.length < 2) return;

  for (let i = 1; i < visibleTrail.length; i++) {
    const pt1 = visibleTrail[i - 1];
    const pt2 = visibleTrail[i];

    // Compute color based on progress through the trail
    const t = i / visibleTrail.length; // goes from 0 to 1

    const r = Math.floor(255 * t);     // red increases
    const g = Math.floor(255 * (1 - t)); // green decreases
    const b = 128;                     // fixed blue

    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(pt1.x, pt1.y);
    ctx.lineTo(pt2.x, pt2.y);
    ctx.stroke();
  }
}






const ZOOM = 1.41;  // 1.0 = no zoom, 1.25 = 25% larger

function draw(){
  // clear background at native scale
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  // draw everything scaled about the hinge line
  ctx.save();
  ctx.translate(width/2, midLineHeight);  // center pivot
  ctx.scale(ZOOM, ZOOM);
  ctx.translate(-width/2, -midLineHeight);

  const lw = 1 / ZOOM; // keep line widths visually consistent

  drawMidline(); // existing midline function:contentReference[oaicite:0]{index=0}

  // trail
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
  ctx.lineWidth = 2 * lw;
  drawTrail(); // existing trail renderer:contentReference[oaicite:1]{index=1}

  // top arm
  ctx.lineWidth = 15 * lw;
  ctx.strokeStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(Math.floor(width/2), midLineHeight);
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();

  // bottom arm
  ctx.lineWidth = 22 * lw;
  ctx.strokeStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // bolts (will scale with the scene; keep as-is)
  drawBolt(Math.floor(p1.x), Math.floor(p1.y), bolt2Radius);
  drawBolt(Math.floor(width/2), Math.floor(midLineHeight), bolt1Radius);

  ctx.restore();
}



function animate(currentTime) {
  if (!lastTime) lastTime = currentTime;
  let delta = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  accumulatedTime += delta;

  // Scale steps based on speedMultiplier (e.g., 1–100)
  let steps = Math.floor((accumulatedTime / fixedDt) * speedMultiplier);
  for (let i = 0; i < steps; i++) {
    timeStep(fixedDt);
  }

  // Subtract actual simulated time (account for speed multiplier)
  accumulatedTime -= (steps / speedMultiplier) * fixedDt;

  draw();
  animationId = requestAnimationFrame(animate);
}




function drawBolt(x, y, radius){
  ctx.beginPath();
  ctx.arc(x,y, radius, 0, Math.PI*2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

function convert_xy_2_coords(x, y){

  //x will come from a circle of radius l1 centered at (0,0)
  //we want it to be centered at width/2, midlineHeight
  //so send 0 ->width/2 and 0 -> midlineHeight
  //
  //same for y1 except we also need to invert it
  x1 = x + Math.floor(width/2);
  y1 = -y + midLineHeight;

  return [x1,y1]
}



function initializePendulums(){
  p1.theta = pi + Math.random()*1/2-0.25;
  p2.theta = p1.theta + pi/2*Math.random()-0.78;

  p1.x = p1.length*Math.sin(p1.theta);
  p1.y = -p1.length*Math.cos(p1.theta);

  let totalTheta = p1.theta+p2.theta;

  p2.x = p1.x + p2.length*Math.sin(p2.theta);
  p2.y = p1.y - p2.length*Math.cos(p2.theta);

  const [x1, y1] = convert_xy_2_coords(p1.x, p1.y);
  p1.x = x1;
  p1.y = y1;

  const [x2, y2] = convert_xy_2_coords(p2.x, p2.y);
  p2.x = x2;
  p2.y = y2;

  console.log("Starting position for top pendulum: x: ", p1.x , " y: ", p1.y);
  console.log("Starting position for bottom pendulum: x: ", p2.x, " y: ", p2.y);


  p1.acceleration = 0;
  p1.velocity = 0;

  p2.acceleration = 0;
  p2.velocity = 0;

}

function drawMidline(){
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(0, midLineHeight);
    ctx.lineTo(midLineWidth, midLineHeight);
    ctx.stroke();
}

function startSimulation(){
  console.log("Starting simulation.........")
  animationId = requestAnimationFrame(animate);
}

function resetSimulation(){
  cancelAnimationFrame(animationId);
  lastTime = null;
  fullTrail = [];
  visibleTrail = [];
  visitedPoints = new Set();
  console.log("Reset simulation");
  ctx.fillStyle = "black";
  ctx.fillRect(0,0, width, height);
  p1.x = 0;
  p1.y = 0;
  p1.theta = 0;
  p1.acceleration = 0;
  p1.velocity = 0;
  p2.x = 0;
  p2.y = 0;
  p2.theta = 0;
  p2.acceleration = 0;
  p2.velocity = 0;
  trail2 = [];
  const slider = document.getElementById("speedSlider");
  const label = document.getElementById("speedValue");
  slider.value = 10;
  label.textContent = "10";
  speedMultiplier = 10;
  initCanvas();
  draw();
  dampingEnabled = false;
  dampenBtn.style.display = "inline-block";

}

function initCanvas(){
  drawMidline();
  initializePendulums();
  draw();
}


document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("pendulumCanvas");
  ctx = canvas.getContext("2d");
  width = canvas.width;
  height = canvas.height;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  midLineHeight = Math.floor((1/2.25)*height);
  midLineWidth = width;
  initCanvas();
  const speedSlider = document.getElementById("speedSlider");
  const speedValueDisplay = document.getElementById("speedValue");

  const stopBtn = document.getElementById("stopBtn");
  const startBtn = document.getElementById("startBtn");
  const dampenBtn = document.getElementById("dampenBtn");

  speedSlider.addEventListener("input", () => {
    speedMultiplier = parseInt(speedSlider.value);
    speedValueDisplay.textContent = speedMultiplier;
});

  startBtn.addEventListener("click", () => {
    
    if (!isRunning) {
    startSimulation();
    startBtn.textContent = "Pause";
    startBtn.style.backgroundColor = "#007bff"; // blue
    isRunning = true;
  } else {
    cancelAnimationFrame(animationId);
    lastTime = null;
    startBtn.textContent = "Start";
    startBtn.style.backgroundColor = "#28a745"; // green
    isRunning = false;
  }

  });

  stopBtn.addEventListener("click", () => {
      resetSimulation();
      startBtn.textContent = "Click to start";
      startBtn.style.backgroundColor = "#28a745";
      isRunning = false;
  })

  dampenBtn.addEventListener("click", () => {
  dampingEnabled = true;
  dampenBtn.style.display = "none";
});
  const clearTrailBtn = document.getElementById("clearTrailBtn");
  clearTrailBtn.addEventListener("click", () => {
    fullTrail = [];
    visibleTrail = [];
    visitedPoints = new Set();
    console.log("Trajectory cleared");

  });


});