// main.js

const canvas = document.getElementById("pendulumCanvas");
const ctx = canvas.getContext("2d");

// Parameters
const g = 9.81;
const l = 200; // length of rods
const m = 1; // mass (not used directly)

// Initial angles and velocities
let theta1 = Math.PI / 2;
let theta2 = Math.PI / 2;
let omega1 = 0;
let omega2 = 0;

const originX = canvas.width / 2;
const originY = 200;
const dt = 0.05;

function updatePendulum() {
  const delta = theta2 - theta1;

  const denom1 = (2 - Math.cos(2 * delta));
  const denom2 = (2 - Math.cos(2 * delta));

  const num1 = -g * (2 * Math.sin(theta1) + Math.sin(theta1 - 2 * theta2)) -
               2 * Math.sin(delta) * (omega2 * omega2 + omega1 * omega1 * Math.cos(delta));

  const num2 = 2 * Math.sin(delta) * (
    omega1 * omega1 + g * Math.cos(theta1) + omega2 * omega2 * Math.cos(delta)
  );

  const a1 = num1 / (l * denom1);
  const a2 = num2 / (l * denom2);

  omega1 += a1 * dt;
  omega2 += a2 * dt;

  theta1 += omega1 * dt;
  theta2 += omega2 * dt;
}

function drawPendulum() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const x1 = originX + l * Math.sin(theta1);
  const y1 = originY + l * Math.cos(theta1);

  const x2 = x1 + l * Math.sin(theta2);
  const y2 = y1 + l * Math.cos(theta2);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x1, y1, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x2, y2, 8, 0, Math.PI * 2);
  ctx.fill();
}

function animate() {
  updatePendulum();
  drawPendulum();
  requestAnimationFrame(animate);
}

animate();