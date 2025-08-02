
// Three-body simulation with simple Euler integration

let ctx;
let G = 5; // Gravitational constant scaled for visualization
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

let earthPos;
let moonPos;
let earthMass = 100;
let moonMass = 50;
let rocketMass = 0.5
let moonRadius = 175;
let earthRadius = 300;

let earthImg = new Image();
earthImg.src = "images/earth.png";

let moonImg = new Image();
moonImg.src = "images/moon.png";

let rocketImg = new Image();
rocketImg.src = "images/rocket.png";

const earthImgWidth = 450;
const earthImgHeight = 450;

const moonImgWidth = 200;
const moonImgHeight = 200;

const rocketSize = 30;

let padding = earthImgWidth + 400;

let state = {x: 0, y: 150, xVelo: 0, yVelo: 0, theta: 0};

const a = 1000;         // scale of figure-8

const a_x = 2200; // wider horizontal scale
const a_y = 650; // shorter vertical scale
const numPoints = 500;
const trajectory = [];

const rightLoopScale = 0.6; // scale down right loop

const xOffset = 380; // how far right you want to shift

let thrustersOn = false;

for (let i = 0; i <= numPoints; i++) {
  const t = (2 * Math.PI * i) / numPoints;
  const baseX = Math.sin(t);
  const baseY = Math.sin(t) * Math.cos(t);

  const scale = baseX > 0 ? rightLoopScale : 1;

  const x = xOffset + a_x * baseX * scale;  // shift right here
  const y = a_y * baseY * scale;
  trajectory.push({ x, y });
}


function closestPoint2Trajectory(){
  let shortestDist = Number.MAX_VALUE;
  let point = {};
  let dist;
  for(let i = 0; i < trajectory.length; i++){
    const x = trajectory[i].x;
    const y = trajectory[i].y;
    dist = euclideanDistance(state.x, state.y, x, y);
    if (dist < shortestDist){
      shortestDist = dist;
      point.x = x;
      point.y = y;
    }
  }
  //console.log("closest point: ", point.x, point.y);
  //console.log("with distance: ", shortestDist);
  return [dist, point.x, point.y];
}


function controller(){

  const [distance, x, y] = closestPoint2Trajectory();

  if (distance > 200){
    //initiate thrusters
    const xDist = x - state.x;
    const yDist = y - state.y;

    const xAccel = xDist/50000;
    const yAccel = yDist/50000;

    return [xAccel, yAccel];
  }

  else{
    return [0, 0]; // x acceleration, y acceleration
  }
  

}


function computeAcceleration(x, y) {
  let ax = 0;
  let ay = 0;

  const softening = 5;

  //earth force on rocket
  const force1 = -G * earthMass / ((softening + euclideanDistance(x, y, earthPos[0], earthPos[1]))**3); // equivalent to Gm / r^3

  const earthDx = state.x - earthPos[0];
  const earthDy = state.y - earthPos[1];

  ax += force1 * earthDx;
  ay += force1 * earthDy;

  const force2 = -G * moonMass / ((softening + euclideanDistance(x, y, moonPos[0], moonPos[1]))**3); // equivalent to Gm / r^3

  const moonDx = x- moonPos[0];
  const moonDy = y - moonPos[1];

  ax += force2 * moonDx;
  ay += force2 * moonDy;

  const [xAccel, yAccel] = controller();

  ax += xAccel;
  ay += yAccel;

  return { ax, ay };
}

function updateRocket() {
  for (let i = 0; i < 2; i++) {

    const x = state.x;
    const y = state.y;
    const vx = state.xVelo;
    const vy = state.yVelo;

    // k1
    const a1 = computeAcceleration(x, y);
    const k1vx = a1.ax * dt;
    const k1vy = a1.ay * dt;
    const k1x = vx * dt;
    const k1y = vy * dt;

    // k2
    const a2 = computeAcceleration(x + k1x / 2, y + k1y / 2);
    const k2vx = a2.ax * dt;
    const k2vy = a2.ay * dt;
    const k2x = (vx + k1vx / 2) * dt;
    const k2y = (vy + k1vy / 2) * dt;

    // k3
    const a3 = computeAcceleration(x + k2x / 2, y + k2y / 2);
    const k3vx = a3.ax * dt;
    const k3vy = a3.ay * dt;
    const k3x = (vx + k2vx / 2) * dt;
    const k3y = (vy + k2vy / 2) * dt;

    // k4
    const a4 = computeAcceleration(x + k3x, y + k3y);
    const k4vx = a4.ax * dt;
    const k4vy = a4.ay * dt;
    const k4x = (vx + k3vx) * dt;
    const k4y = (vy + k3vy) * dt;

    // Final position and velocity update
    state.x += (k1x + 2 * k2x + 2 * k3x + k4x) / 6;
    state.y += (k1y + 2 * k2y + 2 * k3y + k4y) / 6;
    state.xVelo += (k1vx + 2 * k2vx + 2 * k3vx + k4vx) / 6;
    state.yVelo += (k1vy + 2 * k2vy + 2 * k3vy + k4vy) / 6;
    state.theta = Math.atan2(state.yVelo, state.xVelo);  // in radians

    console.log("new position: ", state.x, ", ", state.y);
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

    for (let i = 0; i < 250; i++) {
      updateRocket();
    }

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  drawTrajectory();
  drawPlanets();
  drawRocket();
  //console.log("running......");
  animationId = requestAnimationFrame(animate);
}

function getClosestTrajectoryPoint(x, y, trajectory) {
  let minDist = Infinity;
  let closest = null;
  for (const point of trajectory) {
    const dx = point.x - x;
    const dy = point.y - y;
    const dist = dx * dx + dy * dy;
    if (dist < minDist) {
      minDist = dist;
      closest = point;
    }
  }
  return closest;
}

function computeControlForce(state, target, Kp = 1.5, Kd = 1.0) {
  const ep_x = target.x - state.x;
  const ep_y = target.y - state.y;

  const ev_x = target.vx - state.vx;
  const ev_y = target.vy - state.vy;

  return {
    fx: Kp * ep_x + Kd * ev_x,
    fy: Kp * ep_y + Kd * ev_y,
  };
}



function drawTrail(ctx, body, color) {
}

function updateTrail(body) {

}

function figure8Position(t) {
  return {
    x: a * Math.sin(t),
    y: a * Math.sin(t) * Math.cos(t),
  };
}

function figure8Velocity(t) {
  return {
    vx: a * Math.cos(t),
    vy: a * Math.cos(2 * t),
  };
}

function drawTrajectory() {
  ctx.strokeStyle = 'rgba(211, 255, 211, 0.39)';  // semi-transparent green
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i < trajectory.length; i++) {
    const [cx, cy] = space2canvas(trajectory[i].x, trajectory[i].y);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }

  ctx.stroke();
}


function space2canvas(x, y){
  let coordX;
  let coordY;

  const xMax = Math.abs(earthPos[0]) + padding;


  //convert [-xMax, xMax] --> [0, width] so add xMax to get [0, 2*xMax] then divide by (2*xMax) and multiply by width
  //convert [-height/2, height/2] --> [0, height] 

  coordX = ((x+xMax)/(2*xMax))*width;
  coordY = (height/2 - y);

  return [coordX, coordY];
}

function drawRocket() {
  const [cx, cy] = space2canvas(state.x, state.y); // canvas coords
  const angle = state.theta;

  const Rwidth = rocketSize;
  const Rheight = rocketSize * 1.5;

  ctx.save();
  ctx.translate(cx, cy); // use canvas coordinates here
  ctx.rotate(angle + Math.PI / 2);
  ctx.drawImage(rocketImg, -Rwidth / 2, -Rheight / 2, Rwidth, Rheight); // scaled
  ctx.restore();
}




function drawPlanets() {
  if (earthImg.complete) {
    const [x, y] = space2canvas(earthPos[0], earthPos[1]);
    ctx.drawImage(earthImg, x - earthImgWidth/2, y - earthImgHeight/2, earthImgWidth, earthImgHeight);
  }

  if (moonImg.complete) {
    const [x, y] = space2canvas(moonPos[0], moonPos[1]);
    ctx.drawImage(moonImg, x - moonImgWidth/2, y - moonImgHeight/2, moonImgWidth, moonImgHeight);
  }
}


function startSimulation() {
  animate();
}

function resetSimulation() {
  running = false;
  if (animationId !== null){
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  simulationTime = 0;
  frameCount = 0;
  zoomFactor = 1;
  stepsPerFrame = defaultSteps;
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");
  speedSlider.value = Math.floor(defaultSteps/100);
  speedValue.textContent = speedSlider.value;
  stepsPerFrame = defaultSteps;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  state = {x: 350, y: 150, xVelo: 0, yVelo: 0, theta: 0};
  drawPlanets();
  drawRocket();
  drawTrajectory();
  console.log('rewrote canvas');
  cnt = 0;
  multiplier = 1;
  document.getElementById("time-display").textContent = "Month: 1";
  G = 1;
  document.getElementById("start-simulation").textContent = "Click to Start Simulation";
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}




document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("simCanvas");
  ctx = canvas.getContext("2d");
  height = ctx.canvas.height;
  width = ctx.canvas.width;
  centerX = width/2;
  centerY = height/2;

  earthPos = [-(earthRadius + 750), 0];
  moonPos = [earthRadius + 1000, 0];

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  
  [earthImg, moonImg, rocketImg] = await Promise.all([
    loadImage("images/earth.png"),
    loadImage("images/moon.png"),
    loadImage("images/rocket.png"),
  ]);
  drawTrajectory();
  drawPlanets();
  drawRocket();

  document.getElementById("start-simulation").addEventListener("click", () => {
    const btn = document.getElementById("start-simulation");
    if (!running) {
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

  document.getElementById("reset").addEventListener("click", () => {
    resetSimulation();
  });
});