
//Equations of motion
//4/3*l*theta''_1 + 1/2*l*theta''_2*cos(theta_1-theta_2) + 
//1/2*l*(theta'_2)^2*sin(theta_1-theta_2) + 3/2*g*sin(theta_1) = 0

//1/3*l*theta''_2 + 1/2*l*theta''_1*cos(theta_1-theta_2) -
//1/2*l*(theta'_1)^2*sin(theta_1-theta_2) + 1/2*g*sin(theta_2) = 0

let p1 = {length: 185, mass: 15, theta: 0, velocity: 0, acceleration: 0, x: 0, y: 0};
let p2 = {length: 135, mass: 7, theta: 0, velocity: 0, acceleration: 0, x: 0, y: 0};
let midLineHeight;
let midLineWidth;

const pi = Math.PI;
const g = 9.81;
console.log("constants are: pi: ", pi, " and g: ", g);

let isRunning = false;


let trail = [];
const maxTrailLength = 1000;
let trail2 = [];
const MAX_TRAIL_LENGTH = 10000;


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

  // Convert angles to Cartesian
  let x1 = l1 * Math.sin(p1.theta);
  let y1 = -l1 * Math.cos(p1.theta);

  let totalTheta = p1.theta + p2.theta;
  let x2 = x1 + l2 * Math.sin(p2.theta);
  let y2 = y1 - l2 * Math.cos(p2.theta);

  [p1.x, p1.y] = convert_xy_2_coords(x1, y1);

  [p2.x, p2.y] = convert_xy_2_coords(x2, y2);
  trail2.push([p2.x, p2.y]);
  if (trail2.length > MAX_TRAIL_LENGTH) trail2.shift();

}

function drawTrail(trail) {
  for (let i = 0; i < trail.length - 1; i++) {
    const [x1, y1] = trail[i];
    const [x2, y2] = trail[i + 1];

    // Color cycling — strong in cyan/magenta spectrum
    const t = i / trail.length;
    const r = Math.floor(100 + 155 * Math.sin(2 * Math.PI * t));
    const g = Math.floor(200 + 55 * Math.cos(4 * Math.PI * t)); // green boost for cyan
    const b = Math.floor(255 - 100 * Math.sin(2 * Math.PI * t + Math.PI / 3));

    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`; // full opacity
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}





function draw(){
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height)
  drawMidline();
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  drawTrail(trail2); // Yellow-ish trail from pendulum 2




  ctx.lineWidth = 15;
  ctx.strokeStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(Math.floor((1/2)*width), midLineHeight)
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke()

  ctx.lineWidth = 22;
  ctx.strokeStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  drawBolt(Math.floor(p1.x), Math.floor(p1.y), 15);
  drawBolt(Math.floor(width/2), Math.floor(midLineHeight), 15);
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

  ctx.lineWidth = 15;
  ctx.strokeStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(Math.floor((1/2)*width), midLineHeight)
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke()

  ctx.lineWidth = 22;
  ctx.strokeStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  drawBolt(p1.x, p1.y, 15);
  drawBolt(Math.floor(width/2), midLineHeight, 15);

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
}

function initCanvas(){
  drawMidline();
  initializePendulums();
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

});