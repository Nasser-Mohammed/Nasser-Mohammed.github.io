let ctx;

const dt = 0.0025;
let simulationTime = 0;

let isDragging = false;
let simRunning = false;

let particles = [];

let scale = 50;

let choice = 1;

let centerX = 500;
let centerY = 400;
let width = 1000;
let height = 800;

let mouseX = 0;
let mouseY = 0;


let showInstructions = true;


const systemMap = {
  foci: 1,
  vanderPol: 2,
  radial: 3,
  polynomial: 4
}



const stars = [];
const numStars = 100;

function initStars() {
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2,
      baseX: 0, // for parallax offset later
      baseY: 0
    });
  }
}

initStars();

function drawStars() {
  ctx.fillStyle = "white";
  for (const star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}


function foci(x,y){
  const dt = 0.001;
  const dx = dt*(-x - 5*y);
  const dy = dt*(5*x - y);
  return [dx, dy];
}

function vanderPol(x,y){
  const dt = 0.0025
  const mu = 0.75;
  const dx = dt*y;
  const dy = dt*(mu * (1-(x*x + y*y))*y - x);
  return [dx, dy];
}

function radial(x,y){
  // Radial flow towards r=1, away from r=2
    const r = Math.sqrt(x * x + y * y);
    const dr = (r - 1) * (r - 2);  // drives flow toward r=1 from outside, and away from r=2

  // Convert radial flow back to dx/dy:
    const dt = 0.001;
    const dx = dt*((x / r) * dr - y);
    const dy = dt*((y / r) * dr + x);
    return [dx, dy];
  }

function polynomial(x,y){
  // Example polynomial flow: dx = x^2 - y, dy = y^2 - x
  const dt = 0.001;
  const dx = dt*(-(x*x) + 3*y*y + x*y -2*x + 5*y);
  const dy = dt*(x*x + 2*y*y - x*y - 4*y);
  return [dx/15, dy/15];
}

function decider(x,y, choice){
  if (choice === 1) {
    return foci(x,y);
  } else if (choice === 2) {
    return vanderPol(x,y);
  }
  else if (choice === 3) {
    return radial(x,y);
  }
  else if (choice === 4) {
    return polynomial(x,y);
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.timeNearOrigin = 0;
    this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
  }

  update(dt) {
  let [dx, dy] = decider(this.x, this.y, choice);
  dt = 0.01

  this.x += dx;
  this.y += dy;

  const r = Math.sqrt(this.x * this.x + this.y * this.y);
  if (r < 0.1) {
    this.timeNearOrigin += dt;
  } else {
    this.timeNearOrigin = 0; // reset if it moves away
  }
}

  draw(ctx) {
  const scale = 50;
  const centerX = 500;
  const centerY = 400;

  ctx.shadowColor = this.color;
  ctx.shadowBlur = 10;  // Adjust for glow radius

  ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.arc(centerX + this.x * scale, centerY + this.y * scale, 2, 0, 2 * Math.PI);
  ctx.fill();

  // Reset shadows to avoid affecting other drawings
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}


}

// Simulation loop using requestAnimationFrame
function simulationLoop() {
  requestAnimationFrame(simulationLoop); // always keep the loop going

  // Fading trail clear
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  drawStars(mouseX, mouseY);

  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;
  const radius = 50;
  const ringWidth = 1;

  // Outer glow ring
  ctx.strokeStyle = "rgba(255, 200, 0, 0.3)";
  ctx.lineWidth = 6;
  ctx.shadowColor = "rgba(255, 200, 0, 0.7)";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Inner normal ring on top (the one with your gradient)
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  const gradient = ctx.createRadialGradient(
    centerX, centerY, radius - ringWidth,
    centerX, centerY, radius + ringWidth
  );

  gradient.addColorStop(0, "rgba(255, 200, 0, 0)");
  gradient.addColorStop(0.5, "rgba(255, 200, 0, 0.8)");
  gradient.addColorStop(1, "rgba(255, 200, 0, 0)");

  ctx.strokeStyle = gradient;
  ctx.lineWidth = ringWidth;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();





  if (simRunning) {
    particles = particles.filter(p => p.timeNearOrigin < 1);

    for (let p of particles) {
      p.update(dt);
      p.draw(ctx);
    }

    simulationTime += dt;
    updateTimeDisplay();
  }

  // Always draw instructions if flag is true
  if (showInstructions) {
    ctx.font = "18px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Click or drag to spawn debris", ctx.canvas.width / 2, 30);
  }
}



function startSimulation() {
  if (simRunning) return;
  simRunning = true;
  showInstructions = false; 
  simulationLoop();
}

function stopSimulation() {
  simRunning = false;
}


function updateTimeDisplay() {
  const display = document.getElementById("time-display");
  if (display) {
    display.textContent = `Time: ${simulationTime.toFixed(2)}s`;
  }
}

function resetSimulation() {
  stopSimulation();
  particles = [];
  simulationTime = 0;
  showInstructions = true;  // Show again
  updateTimeDisplay();

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}





document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("simCanvas");
  ctx = canvas.getContext("2d");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  simulationLoop();

  const select = document.getElementById("blackhole");
  choice = systemMap[select.value];

  select.addEventListener("change", (e) => {
    const val = e.target.value;
    choice = systemMap[val];

    // Optional: reset simulation when system changes
    resetSimulation();
  });

  canvas.addEventListener("mousedown", (event) => {
    isDragging = true;
    dragCount = 0;

    spawnParticle(event); // spawn one immediately
    startSimulation();
  
});


    canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left - canvas.width / 2;
    mouseY = e.clientY - rect.top - canvas.height / 2;

    if (!isDragging) return;

    dragCount++;
    if (dragCount % 3 === 0) {
      spawnParticle(e);
    }
  });



  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  canvas.addEventListener("mouseleave", () => {
    isDragging = false;
  });


  document.getElementById("reset-simulation").addEventListener("click", resetSimulation);


  let dragCount = 0;

  function spawnParticle(event) {
    const rect = canvas.getBoundingClientRect();
    const cx = event.clientX - rect.left;
    const cy = event.clientY - rect.top;

    const centerX = 500;
    const centerY = 400;
    const scale = 50;

    const x = (cx - centerX) / scale;
    const y = (cy - centerY) / scale;

    particles.push(new Particle(x, y));
  }




  // Your existing UI event listeners and other code here...
});
