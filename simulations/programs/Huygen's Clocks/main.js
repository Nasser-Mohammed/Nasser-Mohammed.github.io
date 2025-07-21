
// Three-body simulation with simple Euler integration

let ctx;
const dt = 0.0001;
const g = 9.81;
let frameCount = 0;
let simulationTime = 0;
let animationId = null;
let running = false;
let width;
let height;
let isDragging = false;
let bodies = [];
let cnt = 0;
let centerX;
let centerY;
let maxTrailLength = 900;
let stepsPerFrame = 2500;
let defaultSteps = 2500;
let multiplier = 1;

let clockBoxWidth = 250;
let clockBoxHeight = 350;
let clockRadius = Math.floor(Math.min(clockBoxHeight, clockBoxWidth)/2);

let pendulumLength = 250;
let pendulumMass = 50;
let weightRadius = 50;

let clocks = [];
let xDot = 0;

let m = 5;
let M = m/2;
let L = pendulumLength;


class Beam{
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.acceleration = 0;
  }
}

class Clock{
  constructor(theta, angularVelo, length, mass, x, y){
    this.theta = theta;
    this.angularVelo = angularVelo;
    this.length = length;
    this.mass = mass;
    //these are in canvas coords
    this.x = x; //middle of clock box body
    this.y = y; //middle of clock box body
    //
    this.clockR = clockRadius;
    this.smallHandR = clockRadius/2;
    this.phase1 = Math.PI/2; //angle from vertical, should range from -pi/12 to pi/12
    this.phase2 = Math.PI/2;
    this.flag = false;
    // this.bigHandXstart = x;
    // this.bigHandYstart = y + clockBoxHeight/2;
    // this.bigHandXend = x;
    // this.bigHandYend = bigHandYstart - clockRadius;
    // this.smallHandXstart = x;
    // this.smallHandYstart = y + clockBoxHeight/2;
    // this.smallHandXend = x;
    // this.smallHandYend = bigHandYstart - clockRadius;
  }

}


/*equations of motion:
For n pendulums, we have 4n first order ODEs
*/

function getState(clocks, xDot) {
  // Returns a deep copy of current state variables
  const thetas = clocks.map(clock => clock.theta);
  const angularVelos = clocks.map(clock => clock.angularVelo);
  return { thetas, angularVelos, xDot };
}


function derivatives(state, M, m, L, g) {
  const { thetas, omegas, xDot } = state;
  const n = thetas.length;
  const thetaDoubleDots = new Array(n);

  const damping = 1.0; // Try values like 0.5, 1.0, 2.0
 // Beam damping coefficient

  // Compute denominator for beam equation
  let denominator = M;
  for (let i = 0; i < n; i++) {
    denominator += m * L * L * Math.cos(thetas[i]) ** 2;
  }

  // Compute numerator for beam acceleration
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += m * L * (
      omegas[i] * omegas[i] * Math.sin(thetas[i]) +
      g * Math.sin(thetas[i]) * Math.cos(thetas[i])
    );
  }

  //  Add damping force from beam velocity
  numerator -= damping * xDot;

  const xddot = numerator / denominator;

  // Pendulums: NO damping
  for (let i = 0; i < n; i++) {
    thetaDoubleDots[i] = (-g * Math.sin(thetas[i]) - xddot * Math.cos(thetas[i])) / L;
  }

  return {
    dThetas: omegas,
    dOmegas: thetaDoubleDots,
    dxDot: xddot
  };
}


function rk4Step(clocks, xDot, dt, M, m, L, g) {
  const n = clocks.length;

  // Initial state
  const theta0 = clocks.map(c => c.theta);
  const omega0 = clocks.map(c => c.angularVelo);
  const xDot0 = xDot;

  function getState(theta, omega, xDotVal) {
    return { thetas: theta, omegas: omega, xDot: xDotVal };
  }

  // k1
  const k1 = derivatives(getState(theta0, omega0, xDot0), M, m, L, g);

  // k2 input
  const theta1 = theta0.map((t, i) => t + dt * k1.dThetas[i] / 2);
  const omega1 = omega0.map((w, i) => w + dt * k1.dOmegas[i] / 2);
  const xDot1 = xDot0 + dt * k1.dxDot / 2;
  const k2 = derivatives(getState(theta1, omega1, xDot1), M, m, L, g);

  // k3 input
  const theta2 = theta0.map((t, i) => t + dt * k2.dThetas[i] / 2);
  const omega2 = omega0.map((w, i) => w + dt * k2.dOmegas[i] / 2);
  const xDot2 = xDot0 + dt * k2.dxDot / 2;
  const k3 = derivatives(getState(theta2, omega2, xDot2), M, m, L, g);

  // k4 input
  const theta3 = theta0.map((t, i) => t + dt * k3.dThetas[i]);
  const omega3 = omega0.map((w, i) => w + dt * k3.dOmegas[i]);
  const xDot3 = xDot0 + dt * k3.dxDot;
  const k4 = derivatives(getState(theta3, omega3, xDot3), M, m, L, g);

  // Final update
  for (let i = 0; i < n; i++) {
    clocks[i].theta += dt / 6 * (
      k1.dThetas[i] + 2 * k2.dThetas[i] + 2 * k3.dThetas[i] + k4.dThetas[i]
    );

    clocks[i].angularVelo += dt / 6 * (
      k1.dOmegas[i] + 2 * k2.dOmegas[i] + 2 * k3.dOmegas[i] + k4.dOmegas[i]
    );
  }

  // Update xDot
  return xDot + dt / 6 * (k1.dxDot + 2 * k2.dxDot + 2 * k3.dxDot + k4.dxDot);
}


function euclideanDistance(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}


function animate(){

    for (let i = 0; i < stepsPerFrame; i++) {
      xDot = rk4Step(clocks, xDot, dt, M, m, L, g);
    }
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  updateHands();

  drawStructure(false);
  //console.log("running......");
  animationId = requestAnimationFrame(animate);
}

function updateHands(){
  for(let i = 0; i < clocks.length; i++){
    const clock = clocks[i];
    if(clock.theta < 0 && clock.flag === false){
      clock.flag = true;
      clock.phase1 += Math.PI/60;
      clock.phase2 += Math.PI/(60**2);
    }
    if(clock.theta >= 0){
      clock.flag = false;
    }
  }

}

function drawPendulums(){
  for(let i = 0; i < clocks.length; i++){
    const clock = clocks[i];
    //bottom x,y point of box where pendulum will connect
    const pointX = clock.x;
    const pointY = clock.y + clockBoxHeight;

    const length = clock.length;
    const theta = clock.theta;

    const visualScale = 15;
    const displayTheta = clock.theta * visualScale;

    //theta is angle from vertical so
    //theta = theta_x - pi/2
    //where theta_x is natural theta from x-axis
    //then cos(theta) = cos(theta_x - pi/2) = sin(theta)
    //similarly sin(theta) = sin(theta_x - pi/2) = -cos(theta)
    const endX = pointX + length*Math.sin(displayTheta);
    
    //this would be the correct equation for y: const endY = pointY - length*Math.cos(theta);
    //except y is flipped on the canvas, so
    const endY = pointY + length*Math.cos(displayTheta);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    //draw weighted blob at end
    ctx.beginPath();
    ctx.fillStyle = "#9e7e38";
    ctx.moveTo(endX, endY);
    ctx.arc(endX, endY, weightRadius, 0, 2*Math.PI, true);
    ctx.fill();
  }
}

//will work on initialization or in animation loop
function drawClockHands(){
  for(let i = 0; i < clocks.length; i++){
    const clock = clocks[i];
    const centerX = clock.x;
    const centerY = clock.y + clockBoxHeight/2;
    const bigX = clock.clockR*Math.cos(clock.phase1);
    const bigY = clock.clockR*Math.sin(clock.phase1);
    const smallX = clock.smallHandR*Math.cos(clock.phase2);
    const smallY = clock.smallHandR*Math.sin(clock.phase2);

    ctx.beginPath();
    ctx.lineWidth = 2
    ctx.strokeStyle = "black";
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - bigX, centerY - bigY);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - smallX, centerY - smallY);
    ctx.stroke()
  }
}

function drawHook(x, y) {
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 6;
  const straightLength = 180;
  const radius = 20;
  ctx.beginPath();
  ctx.moveTo(x, y);             // Top of the hook
  ctx.lineTo(x, y + straightLength);        // Vertical stem
  ctx.arc(x, y + straightLength + radius, radius, -Math.PI / 2, Math.PI / 2, false); // Curve to right
  ctx.stroke();
  return [x, y + straightLength + radius*2, radius];
}

function drawClock(x,y, radius){
  //make many clock bodies
  ctx.fillStyle = "#44270cff";
  const clockWidth = clockBoxWidth;
  const clockHeight = clockBoxHeight;
  ctx.fillRect(x -clockWidth/2, y , clockWidth, clockHeight);

  //make small hook for spring hook above
  ctx.strokeStyle = "#4B2E14";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - radius/2,y)
  ctx.arc(x, y, radius/2, Math.PI, 0, false);
  ctx.stroke();

  //draw clock 
  const clockR = clockRadius
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y + clockHeight/2, clockR, 0, 2*Math.PI, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = "black"
  ctx.arc(x, y + clockHeight/2, 10, 0, 2*Math.PI, false);
  ctx.fill();
}


function drawStructure(init){
  //clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  //draw side supports for the plank
  const supportWidth = 85;
  const leftX = 180;
  const supportY = 225;
  const rightX = width - leftX - supportWidth;

  const supportHeight = height - supportY;

  ctx.fillStyle = "#4B2E14";
  ctx.fillRect(leftX, supportY, supportWidth, supportHeight);
  ctx.fillRect(rightX, supportY, supportWidth, supportHeight);

  //now draw the plank the clocks hang from
  const extraSideSapce = 250;
  const plankWidth = rightX - leftX + supportWidth + extraSideSapce;
  const plankHeight = 50;
  const plankX = leftX - extraSideSapce/2;
  const plankY = supportY - plankHeight;
  ctx.fillStyle = "	#81673dff";
  ctx.fillRect(plankX, plankY, plankWidth, plankHeight);

  //draw three hooks onto the plank at even intervals
  const space = (rightX - leftX - supportWidth)/3
  const x1 = leftX + supportWidth + space/2;
  const y1 = plankY;
  const x2 = x1 + space;
  const y2 = y1;
  const x3 = x2 + space;
  const y3 = y1;
  
  const [endX1, endY1, r1] = drawHook(x1,y1);
  const [endX2, endY2, r2] = drawHook(x2,y2);
  const [endX3, endY3, r3] = drawHook(x3,y3);
  drawClock(endX1, endY1, r1);
  drawClock(endX2, endY2, r2);
  drawClock(endX3, endY3, r3);
  if (init) {
    const clock1 = new Clock((Math.random() - Math.PI/36) * Math.PI/36, 0, pendulumLength, pendulumMass, endX1, endY1);
    const clock2 = new Clock((Math.random() - Math.PI/36) * Math.PI/36, 0, pendulumLength, pendulumMass, endX2, endY2);
    const clock3 = new Clock((Math.random() - Math.PI/36) * Math.PI/36, 0, pendulumLength, pendulumMass, endX3, endY3);
    clocks.push(clock1);
    clocks.push(clock2);
    clocks.push(clock3);
   }
  drawClockHands();
  drawPendulums();
}

function startSimulation() {
  animate();
}


function resetStates(){
  clocks = [];
  drawStructure(true);
}

function resetSimulation() {
  running = false;
  if (animationId !== null){
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  simulationTime = 0;
  frameCount = 0;
  stepsPerFrame = defaultSteps;
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");
  speedSlider.value = Math.floor(defaultSteps/500);
  speedValue.textContent = speedSlider.value;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  resetStates();
  console.log('rewrote canvas');
  cnt = 0;
  multiplier = 1;
  document.getElementById("time-display").textContent = "Month: 1";
  document.getElementById("start-simulation").textContent = "Click to Start Simulation";
}


document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("simCanvas");
  ctx = canvas.getContext("2d");
  height = ctx.canvas.height;
  width = ctx.canvas.width;
  centerX = width/2;
  centerY = height/2
  drawStructure(true);

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
  stepsPerFrame = Math.floor(parseInt(speedSlider.value))*500

  speedSlider.addEventListener("input", () => {
    stepsPerFrame = Math.floor(parseInt(speedSlider.value)*500);
    speedValue.textContent = Math.floor(stepsPerFrame/500);
  });

  document.getElementById("reset").addEventListener("click", () => {
    resetSimulation();
  });
});