// === Black Hole Simulator Enhancements ===

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
  polynomial: 4,
  node: 5,
  saddleNode: 6,
  vanderPol2: 7
};

const stars = [];
const numStars = 100;

function initStars() {
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2,
      alpha: Math.random(),
      flicker: Math.random() * 0.02 + 0.005
    });
  }
}

initStars();

function drawStars() {
  for (const star of stars) {
    star.alpha += (Math.random() - 0.5) * star.flicker;
    star.alpha = Math.max(0.2, Math.min(1, star.alpha));
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function foci(x, y) {
  const dt = 0.001;
  const dx = dt * (-x - 5 * y);
  const dy = dt * (5 * x - y);
  return [dx, dy, dt];
}

function vanderPol(x, y) {
  const dt = 0.0025;
  const mu = 0.75;
  const dx = dt * y;
  const dy = dt * (mu * (1 - (x * x + y * y)) * y - x);
  return [dx, dy, dt];
}

function radial(x, y) {
  const r = Math.sqrt(x * x + y * y);
  const dr = (r - 1) * (r - 2);
  const dt = 0.001;
  const dx = dt * ((x / r) * dr - y);
  const dy = dt * ((y / r) * dr + x);
  return [dx, dy, dt];
}

function polynomial(x, y) {
  const dt = 0.001;
  const dx = dt * (-(x * x) + 3 * y * y + x * y - 2 * x + 5 * y);
  const dy = dt * (x * x + 2 * y * y - x * y - 4 * y);
  return [dx / 15, dy / 15, dt];
}

function node(x, y) {
  const dt = 0.001;
  const dx = dt * (-3 * x);
  const dy = dt * (-7 * y);
  return [dx / 1.1, dy / 1.1, dt];
}

function saddleNode(x, y) {
  const strength = 1;
  const dx = strength * (x * x - y * y);
  const dy = 2 * strength * x * y;
  return [dx * 0.001, dy * 0.001, 0.001];
}

function vanderPol2(x, y) {
  const dt = 0.0025;
  const mu = 0.75;
  const dx = dt * (mu * (x - (1 / 3) * x * x * x - y));
  const dy = dt * ((1 / mu) * x);
  return [dx, dy, dt];
}

function decider(x, y, choice) {
  switch (choice) {
    case 1: return foci(x, y);
    case 2: return vanderPol(x, y);
    case 3: return radial(x, y);
    case 4: return polynomial(x, y);
    case 5: return node(x, y);
    case 6: return saddleNode(x, y);
    case 7: return vanderPol2(x, y);
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.timeNearOrigin = 0;
    this.offscreenTime = 0;
    this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
  }

  update(dt) {
    let [dx, dy, dtVal] = decider(this.x, this.y, choice);
    this.x += dx;
    this.y += dy;

    const r = Math.sqrt(this.x * this.x + this.y * this.y);
    if (r < 0.1) {
      this.timeNearOrigin += dtVal;
    } else {
      this.timeNearOrigin = 0;
    }

    const px = centerX + this.x * scale;
    const py = centerY + this.y * scale;
    if (px < 0 || px > ctx.canvas.width || py < 0 || py > ctx.canvas.height) {
      this.offscreenTime += dtVal;
    } else {
      this.offscreenTime = 0;
    }
  }

  draw(ctx) {
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(centerX + this.x * scale, centerY + this.y * scale, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
  }
}

const trajectoryPaths = [];

function generateTrajectories() {
  trajectoryPaths.length = 0;
  const steps = 7;
  const spacing = height / steps;

  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * 2 - 1;
    const xLeft = -width / (2 * scale);
    const xRight = width / (2 * scale);

    for (const x of [xLeft, xRight]) {
      const path = [];
      let px = x;
      let py = y * (height / (2 * scale));

      for (let j = 0; j < 200; j++) {
        const [dx, dy] = decider(px, py, choice);
        px += dx;
        py += dy;
        path.push([px, py]);
      }

      trajectoryPaths.push(path);
    }
  }

  const radiusSamples = 8;
  const outerRadius = 3;
  const innerRadius = 0.5;
  for (let i = 0; i < radiusSamples; i++) {
    const angle = (i / radiusSamples) * 2 * Math.PI;

    // Outer circle
    let px = outerRadius * Math.cos(angle);
    let py = outerRadius * Math.sin(angle);
    const outerPath = [];
    for (let j = 0; j < 200; j++) {
      const [dx, dy] = decider(px, py, choice);
      px += dx;
      py += dy;
      outerPath.push([px, py]);
    }
    trajectoryPaths.push(outerPath);

    // Inner circle
    px = innerRadius * Math.cos(angle);
    py = innerRadius * Math.sin(angle);
    const innerPath = [];
    for (let j = 0; j < 200; j++) {
      const [dx, dy] = decider(px, py, choice);
      px += dx;
      py += dy;
      innerPath.push([px, py]);
    }
    trajectoryPaths.push(innerPath);
  }
}

function drawTrajectories() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (const path of trajectoryPaths) {
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const [x, y] = path[i];
      const px = centerX + x * scale;
      const py = centerY + y * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

function simulationLoop() {
  requestAnimationFrame(simulationLoop);
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  drawStars(mouseX, mouseY);
  drawTrajectories();

  const radius = 50;
  const ringWidth = 1;

  ctx.strokeStyle = "rgba(255, 200, 0, 0.3)";
  ctx.lineWidth = 6;
  ctx.shadowColor = "rgba(255, 200, 0, 0.7)";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();

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
    particles = particles.filter(p => p.timeNearOrigin < 1 && p.offscreenTime < 2);
    for (let p of particles) {
      p.update(dt);
      p.draw(ctx);
    }
    simulationTime += dt;
    updateTimeDisplay();
  }

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
  showInstructions = true;
  updateTimeDisplay();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  generateTrajectories();
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("simCanvas");
  ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  generateTrajectories();
  simulationLoop();

  const select = document.getElementById("blackhole");
  choice = systemMap[select.value];

  select.addEventListener("change", (e) => {
    const val = e.target.value;
    choice = systemMap[val];
    stars.length = 0;
    initStars();
    resetSimulation();
  });

  canvas.addEventListener("mousedown", (event) => {
    isDragging = true;
    dragCount = 0;
    spawnParticle(event);
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
    const x = (cx - centerX) / scale;
    const y = (cy - centerY) / scale;
    particles.push(new Particle(x, y));
  }
});
