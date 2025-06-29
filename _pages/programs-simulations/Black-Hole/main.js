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

const systemMap = {
  foci: 1,
  vanderPol: 2,
  radial: 3
}

function foci(x,y){
  const dt = 0.0025;
  const dx = dt*(-x - 5*y);
  const dy = dt*(5*x - y);
  return [dx, dy];
}

function vanderPol(x,y){
  const dt = 0.01
  const mu = 0.5;
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

function decider(x,y, choice){
  if (choice === 1) {
    return foci(x,y);
  } else if (choice === 2) {
    return vanderPol(x,y);
  }
  else if (choice === 3) {
    return radial(x,y);
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

  ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.arc(centerX + this.x * scale, centerY + this.y * scale, 2, 0, 2 * Math.PI);
  ctx.fill();
}

}

// Simulation loop using requestAnimationFrame
function simulationLoop() {
  if (!simRunning) return;

  requestAnimationFrame(simulationLoop); // 👈 move this to the top

  // Then check again to avoid running the body if sim has stopped
  if (!simRunning) return;

  // New fading trail clear
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";  // Adjust alpha (0.05–0.2) for trail length
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);


  particles = particles.filter(p => p.timeNearOrigin < 1); // remove if > 1 sec near origin

  for (let p of particles) {
    p.update(dt);
    p.draw(ctx);
  }

  simulationTime += dt;
  updateTimeDisplay();
}


function startSimulation() {
  if (simRunning) return;
  simRunning = true;
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
  stopSimulation();           // Stop the animation loop
  particles = [];             // Clear all particles
  simulationTime = 0;         // Reset simulation time
  updateTimeDisplay();        // Update UI display

  // Clear the canvas completely
  ctx.fillStyle = "black";   
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}




document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("simCanvas");
  ctx = canvas.getContext("2d");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  spawnParticle(event); // ✅ always spawn one immediately
  startSimulation();
  });

  canvas.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    dragCount++;
    if (dragCount % 5 === 0) {
      spawnParticle(event); // ✅ spawn only every 5th move
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

    const centerX = 400;
    const centerY = 400;
    const scale = 50;

    const x = (cx - centerX) / scale;
    const y = (cy - centerY) / scale;

    particles.push(new Particle(x, y));
  }




  // Your existing UI event listeners and other code here...
});
