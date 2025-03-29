// Three-body simulation with simple Euler integration and collisions

let ctx;
const G = 1; // Gravitational constant scaled for visualization
const dt = 0.1;
let frameCount = 0;
let simulationTime = 0;
let animationId = null;
let running = false;
let currentPlanet = "earth";
let bodies = [];
let particles = [];

const planets = {
  mars: new Image(),
  earth: new Image(),
  jupiter: new Image(),
  saturn: new Image(),
  neptune: new Image(),
  moon: new Image(),
  sun: new Image()
};

planets.moon.src = "moon.png";
planets.sun.src = "sun.png";
planets.earth.src = "earth.png";
planets.jupiter.src = "jupiter.png";
planets.saturn.src = "saturn.png";
planets.mars.src = "mars.png";
planets.neptune.src = "neptune.png";

const planetSizes = {
  mars: 20,
  earth: 30,
  jupiter: 60,
  saturn: 50,
  neptune: 40,
  moon: 15,
  sun: 80
};

const planetMasses = {
  mars: 0.107,
  earth: 1,
  jupiter: 317.8,
  saturn: 95.2,
  neptune: 17.1,
  moon: 0.0123,
  sun: 333000
};

class Body {
  constructor(x, y, vx, vy, mass, imgKey) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.mass = mass;
    this.imgKey = imgKey;
  }

  updatePosition(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  applyForce(fx, fy, dt) {
    this.vx += (fx / this.mass) * dt;
    this.vy += (fy / this.mass) * dt;
  }

  draw(ctx) {
    const img = planets[this.imgKey];
    const size = planetSizes[this.imgKey] || 30;
    ctx.drawImage(img, this.x - size / 2, this.y - size / 2, size, size);
  }
}

class Particle {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = 50;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx) {
    if (this.life > 0) {
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

function handlePlanetChange() {
  const select = document.getElementById("planet-select");
  currentPlanet = select.value;
  document.getElementById("planet-preview").src = `${currentPlanet}.png`;
  resetSimulation();
}

function drawSystem() {
  const canvas = document.getElementById("simCanvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const body of bodies) {
    body.draw(ctx);
  }

  for (const p of particles) {
    p.draw(ctx);
  }

  document.getElementById("time-display").textContent = `Day: ${simulationTime.toFixed(0)}`;
}

function explode(x, y) {
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 4;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    particles.push(new Particle(x, y, vx, vy));
  }
}

function animate() {
  if (!running) return;
  animationId = requestAnimationFrame(animate);
  frameCount++;
  simulationTime += dt;

  const forces = bodies.map(() => ({ fx: 0, fy: 0 }));

  for (let i = 0; i < bodies.length; i++) {
    for (let j = 0; j < bodies.length; j++) {
      if (i === j) continue;
      const dx = bodies[j].x - bodies[i].x;
      const dy = bodies[j].y - bodies[i].y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq) + 1e-6;

      const F = (G * bodies[i].mass * bodies[j].mass) / distSq;
      const fx = F * dx / dist;
      const fy = F * dy / dist;

      forces[i].fx += fx;
      forces[i].fy += fy;

      const sizeSum = (planetSizes[bodies[i].imgKey] + planetSizes[bodies[j].imgKey]) / 2;
      if (dist < sizeSum * 0.5) {
        const smallerIndex = bodies[i].mass < bodies[j].mass ? i : j;
        explode(bodies[smallerIndex].x, bodies[smallerIndex].y);
        bodies.splice(smallerIndex, 1);
        return; // only handle one collision per frame
      }
    }
  }

  for (let i = 0; i < bodies.length; i++) {
    bodies[i].applyForce(forces[i].fx, forces[i].fy, dt);
    bodies[i].updatePosition(dt);
  }

  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => p.update());

  drawSystem();
}

function startSimulation() {
  animate();
}

function resetSimulation() {
  running = false;
  cancelAnimationFrame(animationId);
  simulationTime = 0;
  frameCount = 0;
  particles = [];
  document.getElementById("start-simulation").textContent = "Click to Start Simulation";

  const moonX = 350 + (Math.random() - 0.5) * 200;
  const moonY = 250 + (Math.random() - 0.5) * 200;
  const planetX = 350 + (Math.random() - 0.5) * 400;
  const planetY = 250 + (Math.random() - 0.5) * 400;

  const moonDist = Math.sqrt(Math.pow(moonX - 350, 2) + Math.pow(moonY - 250, 2));
  const planetDist = Math.sqrt(Math.pow(planetX - 350, 2) + Math.pow(planetY - 250, 2));

  const moonV = Math.sqrt(G * planetMasses.sun / moonDist) * (0.85 + Math.random() * 0.3);
  const planetV = Math.sqrt(G * planetMasses.sun / planetDist) * (0.85 + Math.random() * 0.3);

  const moonVx = -(moonY - 250) / moonDist * moonV;
  const moonVy =  (moonX - 350) / moonDist * moonV;
  const planetVx = -(planetY - 250) / planetDist * planetV;
  const planetVy =  (planetX - 350) / planetDist * planetV;

  bodies = [
    new Body(350, 250, 0, 0, planetMasses.sun, "sun"),
    new Body(moonX, moonY, moonVx, moonVy, planetMasses.moon, "moon"),
    new Body(planetX, planetY, planetVx, planetVy, planetMasses[currentPlanet], currentPlanet)
  ];

  drawSystem();
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("simCanvas");
  ctx = canvas.getContext("2d");

  resetSimulation();

  document.getElementById("add-planet").addEventListener("click", () => {
    document.getElementById("add-planet").textContent = "Added";
  });

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

  document.getElementById("reset").addEventListener("click", () => {
    const btn = document.getElementById("start-simulation");
    btn.textContent = "Click to Start Simulation";
    resetSimulation();
  });
});