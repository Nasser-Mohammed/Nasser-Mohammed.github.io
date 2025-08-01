
// Three-body simulation with simple Euler integration

let ctx;
const dt = 0.005;
let frameCount = 0;
let simulationTime = 0;
let animationId = null;
let running = false;
let width;
let height;
let isDragging = false;
let cnt = 0;
let centerX;
let centerY;
let stepsPerFrame = 50;
let defaultSteps = 50;
const g = 9.81;

const pendulumLength = 245;
let state = {theta: 0, omega: 0};
const PI = Math.PI;
let angleSlider;
let angleValue;
let trailLength = 5000;
let statePoints = [];
let phaseTrail = [];
let startHeight;
let damping = 0;
let dampingEnabled = false;

function computeAcceleration(theta) {

  //dOmega = -g/L*sin(theta)

  return - (g / pendulumLength) * Math.sin(theta) - damping * state.omega;
}

function updateState() {

    let v = state.omega;
    let x = state.theta;

    updateTrail([x, v]);

    // k1
    const a1 = computeAcceleration(x);
    const k1v = a1 * dt;
    const k1x = v * dt;

    // k2
    const a2 = computeAcceleration(x + k1x / 2);
    const k2v = a2 * dt;
    const k2x = (v + k1v / 2) * dt;


    // k3
    const a3 = computeAcceleration(x + k2x / 2);
    const k3v = a3 * dt;
    const k3x = (v + k2v / 2) * dt;

    // k4
    const a4 = computeAcceleration(x + k3x);
    const k4v = a4 * dt;
    const k4x = (v + k3v) * dt;

    // Final position and velocity update
    state.theta += (k1x + 2 * k2x + 2 * k3x + k4x) / 6;
    state.omega += (k1v + 2 * k2v + 2 * k3v + k4v) / 6;
}


function euclideanDistance(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}


function animate(){
    for (let i = 0; i < stepsPerFrame; i++) {
      updateState();
    }

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  drawMidLine();
  drawPendulum();
  drawPhase();
  //console.log("running......");
  animationId = requestAnimationFrame(animate);
}

function updateTrail(newPoint) {
  statePoints.push(newPoint); // add the latest point

  if (statePoints.length > trailLength) {
    statePoints.shift(); // remove the oldest point
  }
}

function drawPhase(){
  ctx.lineWidth = 5;
  const heightRange = height - startHeight;

  //ctx.moveTo(firstX, firstY);
  if (statePoints.length <=2) return;
  ctx.beginPath();
  const [tmpTheta, tmpOmega] = statePoints[0];
  const x0 = 20 + (tmpTheta + PI) * ((width - 40) / (2 * PI));
  const y0 = startHeight + 10 + (tmpOmega + 0.5) * (height - startHeight - 20);
  ctx.moveTo(x0, y0);

  for (let i = 1; i < statePoints.length - 1; i++) {
    const a = i / statePoints.length;
    ctx.strokeStyle = `rgba(0, 255, 0, ${a})`; // Fading still works
    // Convert points
    const [theta1, omega1] = statePoints[i];
    const [theta2, omega2] = statePoints[i + 1];
    const x1 = 20 + (theta1 + PI) * ((width - 40) / (2 * PI));
    const y1 = startHeight + 10 + (omega1 + 0.5) * (height - startHeight - 20);
    const x2 = 20 + (theta2 + PI) * ((width - 40) / (2 * PI));
    const y2 = startHeight + 10 + (omega2 + 0.5) * (height - startHeight - 20);
    ctx.lineTo(x2, y2); // keep stroke here only if each segment must have a different alpha
  }
  ctx.stroke();

}

function drawMidLine(){
  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "white";
  ctx.moveTo(0, Math.floor((1/4)*height));
  ctx.lineTo(width, Math.floor((1/4)*height));
  ctx.stroke();
}

function drawPendulum(){
  ctx.beginPath();
  ctx.lineWidth = 12;
  ctx.strokeStyle = "red";
  ctx.moveTo(width/2, Math.floor((1/4)*height));
  //now convert the theta and length of pendulum to x,y and then convert to canvas coords
  //x = rcos(theta), y = rsin(theta), but here theta points down so really theta in those equations is our theta + pi/2
  let x = pendulumLength*Math.cos(state.theta - PI/2);
  let y = pendulumLength*Math.sin(state.theta - PI/2);
  //now convert to canvas coords, x=0 --> width/2 and y = 0 --> height/2 but it grows downward, so y > 0 --> [0, height/2)
  //and y < 0 --> (height/2, height]
  x = x + width/2;
  y = height/4- y;
  ctx.lineTo(x,y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x,y, 25, 0, 2*PI, false);
  ctx.fillStyle = "blue";
  ctx.fill();
  //console.log("x: ", x, " y: ", y);

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
  stepsPerFrame = defaultSteps;
  stepsPerFrame = defaultSteps;
  angleSlider.value = 0;
  angleValue.textContent = "0";
  state.theta = 0;
  state.omega = 0;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  drawMidLine();
  drawPendulum();
  console.log('rewrote canvas');
  damping = 0;
  dampingEnabled = false;
  cnt = 0;
  angleSlider.style.pointerEvents = "auto"; 
  phaseTrail = [];
  statePoints = [];
  document.getElementById("speed-slider").value = 5;
  document.getElementById("speed-value").textContent = "5";
  document.getElementById("start-simulation").textContent = "Click to Start Simulation";
  document.getElementById("dampingToggle").textContent = "Enable Damping";
}


document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("simCanvas");
  ctx = canvas.getContext("2d");
  height = ctx.canvas.height;
  width = ctx.canvas.width;
  centerX = width/2;
  centerY = height/2
  startHeight = height/4 + pendulumLength + 30;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  drawMidLine();
  drawPendulum();

  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");
  stepsPerFrame = Math.floor(parseInt(speedSlider.value)*10);

  angleSlider = document.getElementById("angle-slider");
  angleValue = document.getElementById("angle-value");

    document.getElementById("start-simulation").addEventListener("click", () => {
      const btn = document.getElementById("start-simulation");

      if (!running) {
        running = true;
        btn.textContent = "Pause";
        angleSlider.style.pointerEvents = "none"; 
        startSimulation();
      } else {
        running = false;
        cancelAnimationFrame(animationId);
        btn.textContent = "Resume";
      }
    });


  speedSlider.addEventListener("input", () => {
    stepsPerFrame = Math.floor(parseInt(speedSlider.value)*10);
    speedValue.textContent = Math.floor(stepsPerFrame/10);
  });

  angleSlider.addEventListener("input", () => {
    state.theta = parseFloat(angleSlider.value);
    angleValue.textContent = Math.round(100*angleSlider.value)/100;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    drawMidLine();
    drawPendulum();

  });

  document.getElementById("dampingToggle").addEventListener("click", () => {
  dampingEnabled = !dampingEnabled;
  damping = dampingEnabled ? 0.05 : 0;
  document.getElementById("dampingToggle").textContent = dampingEnabled ? "Disable Damping" : "Enable Damping";
});


  document.getElementById("reset").addEventListener("click", () => {
    resetSimulation();
  });
});