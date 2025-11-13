// === Canvas Setup ===
const canvas = document.getElementById("canvas2d");
const ctx = canvas.getContext("2d", { alpha: false });

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
window.addEventListener("resize", resizeCanvas);

// === Simulation Parameters ===
let N = 150;              // grid resolution (interior 1..N)
const iter = 12;          // diffusion solver sweeps
let dtBase = 0.02;        // base timestep (smaller => slower)
let speedFactor = 0.5;    // UI "Speed" multiplies dtBase
let D = 0.008;            // diffusion
let r = 0.80;             // growth
let K = 1.0;              // carrying capacity
let bc = "neumann";       // boundary condition
let cmapName = "tri";     // colormap

let size = (N + 2) * (N + 2);
let u = new Float32Array(size);
let u0 = new Float32Array(size);

// Interaction
let isDownLeft = false, isDownRight = false;

// Helpers
function IX(x, y) { return x + (N + 2) * y; }

function applyCircle(x0, y0, r, val) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x*x + y*y <= r*r) {
        u[IX(x0 + x, y0 + y)] = val;
      }
    }
  }
}

function applySquare(x0, y0, r, val) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      u[IX(x0 + x, y0 + y)] = val;
    }
  }
}

function applyTriangle(x0, y0, r, val) {
  // Upward triangle
  for (let y = 0; y < r; y++) {
    let half = Math.floor((y / r) * r);
    for (let x = -half; x <= half; x++) {
      u[IX(x0 + x, y0 + y)] = val;
    }
  }
}

function applyStar(x0, y0, r, val) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      let angle = Math.atan2(y, x);
      let dist = Math.sqrt(x*x + y*y);

      // Five-point star radius
      let k = Math.abs(Math.sin(5 * angle));
      let R = r * (0.5 + 0.5 * k);

      if (dist <= R) {
        u[IX(x0 + x, y0 + y)] = val;
      }
    }
  }
}

function applyOctagon(x0, y0, r, val) {
  const s = Math.floor(r / Math.sqrt(2)); // inner square
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (
        Math.abs(x) <= r &&
        Math.abs(y) <= r &&
        (Math.abs(x) <= s || Math.abs(y) <= s)
      ) {
        u[IX(x0 + x, y0 + y)] = val;
      }
    }
  }
}

function applyRandom(x0, y0, r, val) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (Math.random() < 0.5) {
        u[IX(x0 + x, y0 + y)] = Math.random();
      }
    }
  }
}

function applyBrush(ix, iy, val) {
  const brush = document.getElementById("brush").value;
  const r = 6; // brush radius in grid cells — change if needed

  switch (brush) {
    case "circle":   applyCircle(ix, iy, r, val); break;
    case "square":   applySquare(ix, iy, r, val); break;
    case "triangle": applyTriangle(ix, iy, r, val); break;
    case "star":     applyStar(ix, iy, r, val); break;
    case "octagon":  applyOctagon(ix, iy, r, val); break;
    case "random":   applyRandom(ix, iy, r, val); break;
  }
}


// === Reinit when fidelity changes ===
function reinit(newN) {
  N = newN;
  size = (N + 2) * (N + 2);
  u = new Float32Array(size);
  u0 = new Float32Array(size);
  reset();
}

// === Boundary Conditions ===
function set_bnd_scalar(x) {
  if (bc === "dirichlet") {
    for (let i = 0; i <= N + 1; i++) {
      x[IX(0, i)] = 0; x[IX(N + 1, i)] = 0;
      x[IX(i, 0)] = 0; x[IX(i, N + 1)] = 0;
    }
    x[IX(0, 0)] = x[IX(0, N + 1)] = x[IX(N + 1, 0)] = x[IX(N + 1, N + 1)] = 0;
    return;
  }

  if (bc === "periodic") {
    for (let i = 1; i <= N; i++) {
      x[IX(0, i)]       = x[IX(N, i)];
      x[IX(N + 1, i)]   = x[IX(1, i)];
      x[IX(i, 0)]       = x[IX(i, N)];
      x[IX(i, N + 1)]   = x[IX(i, 1)];
    }
    x[IX(0, 0)]           = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
    x[IX(0, N + 1)]       = 0.5 * (x[IX(1, N + 1)] + x[IX(0, N)]);
    x[IX(N + 1, 0)]       = 0.5 * (x[IX(N, 0)] + x[IX(N + 1, 1)]);
    x[IX(N + 1, N + 1)]   = 0.5 * (x[IX(N, N + 1)] + x[IX(N + 1, N)]);
    return;
  }

  // Neumann (no-flux)
  for (let i = 1; i <= N; i++) {
    x[IX(0, i)]       = x[IX(1, i)];
    x[IX(N + 1, i)]   = x[IX(N, i)];
    x[IX(i, 0)]       = x[IX(i, 1)];
    x[IX(i, N + 1)]   = x[IX(i, N)];
  }
  x[IX(0, 0)]           = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
  x[IX(0, N + 1)]       = 0.5 * (x[IX(1, N + 1)] + x[IX(0, N)]);
  x[IX(N + 1, 0)]       = 0.5 * (x[IX(N, 0)] + x[IX(N + 1, 1)]);
  x[IX(N + 1, N + 1)]   = 0.5 * (x[IX(N, N + 1)] + x[IX(N + 1, N)]);
}

// === Diffusion: (I - a∇²) u = u0 via Gauss–Seidel ===
function diffuse_scalar(x, x0, Dcoef, dt) {
  const a = dt * Dcoef * N * N;
  for (let k = 0; k < iter; k++) {
    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= N; j++) {
        x[IX(i, j)] = (x0[IX(i, j)] + a * (
          x[IX(i - 1, j)] + x[IX(i + 1, j)] +
          x[IX(i, j - 1)] + x[IX(i, j + 1)]
        )) / (1 + 4 * a);
      }
    }
    set_bnd_scalar(x);
  }
}

// === Reaction (explicit) ===
function react_scalar(x, dt) {
  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= N; j++) {
      const idx = IX(i, j);
      const val = x[idx];
      const dudt = r * val * (1 - val / K);
      x[idx] = val + dt * dudt;
    }
  }
  // clamp
  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= N; j++) {
      const idx = IX(i, j);
      if (x[idx] < 0) x[idx] = 0;
      if (x[idx] > K) x[idx] = K;
    }
  }
  set_bnd_scalar(x);
}

// === Full step ===
function stepFisherKPP(dt) {
  u0.set(u);
  diffuse_scalar(u, u0, D, dt);
  react_scalar(u, dt);
}

// === Colormaps ===
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(x) { return Math.max(0, Math.min(1, x)); }
function rgb(r, g, b) { return [r|0, g|0, b|0]; }

// Blue (0) -> Green (0.5) -> Red (1)
function cmapTri(g) {
  g = clamp01(g);

  if (g < 0.5) {
    // 0..0.5: Blue → Green
    const t = g / 0.5;
    return rgb(
      lerp(0,   0,   t),   // R: stays 0
      lerp(0,   255, t),   // G: 0 → 255
      lerp(255, 0,   t)    // B: 255 → 0
    );
  } else {
    // 0.5..1: Green → Red
    const t = (g - 0.5) / 0.5;
    return rgb(
      lerp(0,   255, t),   // R: 0 → 255
      lerp(255, 0,   t),   // G: 255 → 0
      lerp(0,   0,   t)    // B: stays 0
    );
  }
}


// ocean: navy -> cyan -> white
function cmapOcean(g) {
  g = clamp01(g);
  if (g < 0.5) {
    const t = g / 0.5;
    return rgb(
      lerp(10,  0,   t),
      lerp(20,  180, t),
      lerp(60,  200, t)
    );
  } else {
    const t = (g - 0.5) / 0.5;
    return rgb(
      lerp(0,   200, t),
      lerp(180, 255, t),
      lerp(200, 255, t)
    );
  }
}

// viridis-like (approx)
function cmapViridis(g) {
  g = clamp01(g);
  // piecewise mix: dark purple -> green -> yellow
  const c1 = [68, 1, 84];
  const c2 = [32, 144, 140];
  const c3 = [253, 231, 37];
  if (g < 0.5) {
    const t = g / 0.5;
    return rgb(
      lerp(c1[0], c2[0], t),
      lerp(c1[1], c2[1], t),
      lerp(c1[2], c2[2], t)
    );
  } else {
    const t = (g - 0.5) / 0.5;
    return rgb(
      lerp(c2[0], c3[0], t),
      lerp(c2[1], c3[1], t),
      lerp(c2[2], c3[2], t)
    );
  }
}

function cmapGray(g) {
  const c = (clamp01(g) * 255) | 0;
  return [c, c, c];
}

function getColor(valNorm) {
  switch (cmapName) {
    case "tri": return cmapTri(valNorm);
    case "ocean": return cmapOcean(valNorm);
    case "viridis": return cmapViridis(valNorm);
    case "gray": default: return cmapGray(valNorm);
  }
}

// === Rendering ===
function renderField() {
  const img = ctx.createImageData(N, N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const val = u[IX(i + 1, j + 1)] / K; // normalize
      const [rC, gC, bC] = getColor(val);
      const idx = (i + j * N) * 4;
      img.data[idx + 0] = rC;
      img.data[idx + 1] = gC;
      img.data[idx + 2] = bC;
      img.data[idx + 3] = 255;
    }
  }
  // Draw pixelated
  const simCanvas = document.createElement("canvas");
  simCanvas.width = N;
  simCanvas.height = N;
  const sctx = simCanvas.getContext("2d");
  sctx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(simCanvas, 0, 0, canvas.width, canvas.height);
}

// === Loop ===
function loop() {
  const dt = dtBase * speedFactor;
  stepFisherKPP(dt);
  renderField();
  requestAnimationFrame(loop);
}

// === Utilities ===
function reset() {
  u.fill(0);
  u0.fill(0);
}

function seedLeftHalf() {
  for (let i = 1; i <= Math.floor(N / 3); i++) {
    for (let j = 1; j <= N; j++) {
      u[IX(i, j)] = 0.8 * K;
    }
  }
}

function addNoise(strength = 0.05) {
  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= N; j++) {
      const idx = IX(i, j);
      u[idx] = Math.max(0, Math.min(K, u[idx] + (Math.random() - 0.5) * 2 * strength));
    }
  }
}

// === Mouse Interaction (corrected to interior indices 1..N) ===
canvas.addEventListener("contextmenu", e => e.preventDefault());

canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (e.button === 0) isDownLeft = true;
  if (e.button === 2) isDownRight = true;
  paintAt(x, y, e.shiftKey);
});

canvas.addEventListener("mouseup", e => {
  if (e.button === 0) isDownLeft = false;
  if (e.button === 2) isDownRight = false;
});

canvas.addEventListener("mouseleave", () => { isDownLeft = false; isDownRight = false; });

canvas.addEventListener("mousemove", e => {
  if (!isDownLeft && !isDownRight) return;
  const rect = canvas.getBoundingClientRect();
  paintAt(e.clientX - rect.left, e.clientY - rect.top, e.shiftKey);
});

function paintAt(x, y, heavy) {
  // Convert canvas coordinates → grid indices
  const rect = canvas.getBoundingClientRect();
  const gx = Math.floor((x / rect.width) * N) + 1;
  const gy = Math.floor((y / rect.height) * N) + 1;

  if (gx < 1 || gx > N || gy < 1 || gy > N) return;

  // Brush radius: bigger if Shift is held
  const r = heavy ? 10 : 6;

  if (isDownLeft) {
    // LEFT MOUSE: draw (u = 1)
    applyBrush(gx, gy, r, 1.0);
  }

  if (isDownRight) {
    // RIGHT MOUSE: erase (u = 0)
    applyBrush(gx, gy, r, 0.0);
  }
}



// === Touch (one finger add, two erase) ===
let touchTwo = false;
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  touchTwo = (e.touches.length >= 2);
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (e.touches.length === 0) return;
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  paintAt(t.clientX - rect.left, t.clientY - rect.top, false);
  if (touchTwo) {
    // quick erase ring around point
    const gridX = Math.floor(((t.clientX - rect.left) / rect.width) * N);
    const gridY = Math.floor(((t.clientY - rect.top) / rect.height) * N);
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
      const i = Math.min(Math.max(1, gridX + 1 + di), N);
      const j = Math.min(Math.max(1, gridY + 1 + dj), N);
      u[IX(i, j)] = Math.max(0, u[IX(i, j)] - 0.10 * K);
    }
  }
}, { passive: false });

canvas.addEventListener("touchend", () => { touchTwo = false; }, { passive: false });

// === UI Bindings ===
document.addEventListener("DOMContentLoaded", () => {
  resizeCanvas();

  const dSlider = document.getElementById("diff");
  const rSlider = document.getElementById("growth");
  const kSlider = document.getElementById("cap");
  const dVal = document.getElementById("diff-val");
  const rVal = document.getElementById("growth-val");
  const kVal = document.getElementById("cap-val");

  dSlider.oninput = e => { D = parseFloat(e.target.value); dVal.textContent = D.toFixed(4); };
  rSlider.oninput = e => { r = parseFloat(e.target.value); rVal.textContent = r.toFixed(2); };
  kSlider.oninput = e => { K = parseFloat(e.target.value); kVal.textContent = K.toFixed(2); };

  const bcSelect = document.getElementById("bc-select");
  bcSelect.addEventListener("change", e => { bc = e.target.value; });

  const speed = document.getElementById("speed");
  const speedVal = document.getElementById("speed-val");
  speed.addEventListener("input", e => {
    speedFactor = parseFloat(e.target.value);
    speedVal.textContent = speedFactor.toFixed(2) + "×";
  });

  const cmap = document.getElementById("cmap");
  cmap.addEventListener("change", e => { cmapName = e.target.value; });

  const fidelitySlider = document.getElementById("fidelity");
  const fidelityLabel = document.getElementById("fidelity-val");
  fidelitySlider.addEventListener("change", e => {
    const newN = parseInt(e.target.value);
    fidelityLabel.textContent = newN;
    reinit(newN);
  });

  document.getElementById("seed-front").onclick = () => seedLeftHalf();
  document.getElementById("randomize").onclick = () => addNoise(0.2);
  document.getElementById("reset-btn").onclick = () => reset();

  reset();
  requestAnimationFrame(loop);
});
