const canvas = document.getElementById("canvas2d");
const ctx = canvas.getContext("2d");

const size = 256;
canvas.width = size;
canvas.height = size;

let Du = 0.16, Dv = 0.08, F = 0.037, k = 0.06;
const dt = 1.0;

let U, V, nextU, nextV;

function initialize() {
  U = new Float32Array(size * size).fill(1);
  V = new Float32Array(size * size).fill(0);
  nextU = new Float32Array(size * size);
  nextV = new Float32Array(size * size);

  const r = 10;
  for (let y = size / 2 - r; y < size / 2 + r; y++) {
    for (let x = size / 2 - r; x < size / 2 + r; x++) {
      const i = x + y * size;
      U[i] = 0.5;
      V[i] = 0.25;
    }
  }
}

function lap(arr, x, y) {
  const i = x + y * size;
  let sum = 0;
  sum += arr[(x + 1) % size + y * size];
  sum += arr[(x - 1 + size) % size + y * size];
  sum += arr[x + ((y + 1) % size) * size];
  sum += arr[x + ((y - 1 + size) % size) * size];
  sum += arr[(x + 1) % size + ((y + 1) % size) * size];
  sum += arr[(x - 1 + size) % size + ((y + 1) % size) * size];
  sum += arr[(x + 1) % size + ((y - 1 + size) % size) * size];
  sum += arr[(x - 1 + size) % size + ((y - 1 + size) % size) * size];
  sum -= 8 * arr[i];
  return sum;
}

function update() {
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const i = x + y * size;
      const u = U[i];
      const v = V[i];

      const du = Du * lap(U, x, y) - u * v * v + F * (1 - u);
      const dv = Dv * lap(V, x, y) + u * v * v - (F + k) * v;

      nextU[i] = u + du * dt;
      nextV[i] = v + dv * dt;
    }
  }

  [U, nextU] = [nextU, U];
  [V, nextV] = [nextV, V];
}

function draw() {
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const u = U[i];
    const v = V[i];
    // color mapping for dark mode
    const r = Math.floor((u - v) * 255);
    const g = Math.floor(v * 255);
    const b = Math.floor((1 - u) * 255);
    const idx = i * 4;
    image.data[idx] = Math.max(0, Math.min(255, r));
    image.data[idx + 1] = Math.max(0, Math.min(255, g));
    image.data[idx + 2] = Math.max(0, Math.min(255, b));
    image.data[idx + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}

function step() {
  for (let i = 0; i < 10; i++) update();
  draw();
  requestAnimationFrame(step);
}

initialize();
step();

// --- Controls ---
document.getElementById("feed").oninput = e => {
  F = parseFloat(e.target.value);
  document.getElementById("feed-val").textContent = F.toFixed(3);
};
document.getElementById("kill").oninput = e => {
  k = parseFloat(e.target.value);
  document.getElementById("kill-val").textContent = k.toFixed(3);
};
document.getElementById("du").oninput = e => {
  Du = parseFloat(e.target.value);
  document.getElementById("du-val").textContent = Du.toFixed(2);
};
document.getElementById("dv").oninput = e => {
  Dv = parseFloat(e.target.value);
  document.getElementById("dv-val").textContent = Dv.toFixed(2);
};
document.getElementById("reset-btn").onclick = initialize;
