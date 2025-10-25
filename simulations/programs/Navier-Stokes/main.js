// === Canvas Setup ===
const canvas = document.getElementById("canvas2d");
const ctx = canvas.getContext("2d", { alpha: false });

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// === Simulation Parameters ===
const N = 150;
const iter = 16;
const dt = 0.1;

let diff = 0.0001;
let visc = 0.0001;

let size = (N + 2) * (N + 2);
let densR = new Float32Array(size);
let densG = new Float32Array(size);
let densB = new Float32Array(size);
let densPrevR = new Float32Array(size);
let densPrevG = new Float32Array(size);
let densPrevB = new Float32Array(size);

let u = new Float32Array(size);
let v = new Float32Array(size);
let uPrev = new Float32Array(size);
let vPrev = new Float32Array(size);

let isDown = false;
let lastX = 0, lastY = 0;

function IX(x, y) { return x + (N + 2) * y; }

// === Core Math ===
function addSource(x, s) {
  for (let i = 0; i < size; i++) x[i] += dt * s[i];
}

function diffuse(b, x, x0, diff) {
  let a = dt * diff * N * N;
  for (let k = 0; k < iter; k++) {
    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= N; j++) {
        x[IX(i,j)] = (x0[IX(i,j)] + a * (
          x[IX(i-1,j)] + x[IX(i+1,j)] + x[IX(i,j-1)] + x[IX(i,j+1)]
        )) / (1 + 4 * a);
      }
    }
    set_bnd(b, x);
  }
}

function advect(b, d, d0, u, v) {
  let dt0 = dt * N;
  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= N; j++) {
      let x = i - dt0 * u[IX(i,j)];
      let y = j - dt0 * v[IX(i,j)];
      if (x < 0.5) x = 0.5;
      if (x > N + 0.5) x = N + 0.5;
      if (y < 0.5) y = 0.5;
      if (y > N + 0.5) y = N + 0.5;
      const i0 = Math.floor(x), i1 = i0 + 1;
      const j0 = Math.floor(y), j1 = j0 + 1;
      const s1 = x - i0, s0 = 1 - s1;
      const t1 = y - j0, t0 = 1 - t1;
      d[IX(i,j)] =
        s0*(t0*d0[IX(i0,j0)] + t1*d0[IX(i0,j1)]) +
        s1*(t0*d0[IX(i1,j0)] + t1*d0[IX(i1,j1)]);
    }
  }
  set_bnd(b, d);
}

function project(u, v, p, div) {
  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= N; j++) {
      div[IX(i,j)] = -0.5*(u[IX(i+1,j)] - u[IX(i-1,j)] +
                           v[IX(i,j+1)] - v[IX(i,j-1)]) / N;
      p[IX(i,j)] = 0;
    }
  }
  set_bnd(0, div); set_bnd(0, p);

  for (let k = 0; k < iter; k++) {
    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= N; j++) {
        p[IX(i,j)] = (div[IX(i,j)] +
                      p[IX(i-1,j)] + p[IX(i+1,j)] +
                      p[IX(i,j-1)] + p[IX(i,j+1)]) / 4;
      }
    }
    set_bnd(0, p);
  }

  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= N; j++) {
      u[IX(i,j)] -= 0.5 * N * (p[IX(i+1,j)] - p[IX(i-1,j)]);
      v[IX(i,j)] -= 0.5 * N * (p[IX(i,j+1)] - p[IX(i,j-1)]);
    }
  }
  set_bnd(1, u); set_bnd(2, v);
}

function set_bnd(b, x) {
  for (let i = 1; i <= N; i++) {
    x[IX(0,i)]     = b===1 ? -x[IX(1,i)] : x[IX(1,i)];
    x[IX(N+1,i)]   = b===1 ? -x[IX(N,i)] : x[IX(N,i)];
    x[IX(i,0)]     = b===2 ? -x[IX(i,1)] : x[IX(i,1)];
    x[IX(i,N+1)]   = b===2 ? -x[IX(i,N)] : x[IX(i,N)];
  }
  x[IX(0,0)]       = 0.5 * (x[IX(1,0)] + x[IX(0,1)]);
  x[IX(0,N+1)]     = 0.5 * (x[IX(1,N+1)] + x[IX(0,N)]);
  x[IX(N+1,0)]     = 0.5 * (x[IX(N,0)] + x[IX(N+1,1)]);
  x[IX(N+1,N+1)]   = 0.5 * (x[IX(N,N+1)] + x[IX(N+1,N)]);
}

// === Fluid Steps ===
function velStep(u,v,u0,v0,visc) {
  addSource(u, u0); addSource(v, v0);
  [u0,u] = [u,u0]; diffuse(1,u,u0,visc);
  [v0,v] = [v,v0]; diffuse(2,v,v0,visc);
  project(u,v,u0,v0);
  [u0,u] = [u,u0]; [v0,v] = [v,v0];
  advect(1,u,u0,u0,v0);
  advect(2,v,v0,u0,v0);
  project(u,v,u0,v0);
}

function densStep(x, x0, u, v, diff) {
  addSource(x, x0);
  [x0,x] = [x,x0]; diffuse(0,x,x0,diff);
  [x0,x] = [x,x0]; advect(0,x,x0,u,v);
}

// === Rendering ===
function renderDens() {
  const img = ctx.createImageData(N, N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const idx = (i + j * N) * 4;
      const r = densR[IX(i+1,j+1)];
      const g = densG[IX(i+1,j+1)];
      const b = densB[IX(i+1,j+1)];
      img.data[idx+0] = Math.min(255, r * 255);
      img.data[idx+1] = Math.min(255, g * 255);
      img.data[idx+2] = Math.min(255, b * 255);
      img.data[idx+3] = 255;
    }
  }
  const simCanvas = document.createElement("canvas");
    simCanvas.width = N;
    simCanvas.height = N;
    const simCtx = simCanvas.getContext("2d");
    simCtx.putImageData(img, 0, 0);

    // Now scale-draw to main canvas
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(simCanvas, 0, 0, canvas.width, canvas.height);
}

  function hsvToRgb(h, s, v) {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    return [r, g, b];
  }

  // === Main Loop ===
function step() {
  velStep(u, v, uPrev, vPrev, visc);
  densStep(densR, densPrevR, u, v, diff);
  densStep(densG, densPrevG, u, v, diff);
  densStep(densB, densPrevB, u, v, diff);

  renderDens();
  uPrev.fill(0); vPrev.fill(0);
  densPrevR.fill(0);
  densPrevG.fill(0);
  densPrevB.fill(0);

  requestAnimationFrame(step);
}

// === Reset ===
function reset() {
  densR.fill(0); densG.fill(0); densB.fill(0);
  u.fill(0); v.fill(0);
  uPrev.fill(0); vPrev.fill(0);
  densPrevR.fill(0);
  densPrevG.fill(0);
  densPrevB.fill(0);

}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

// === UI Controls ===
document.getElementById("diff").oninput = e => {
  diff = parseFloat(e.target.value);
  document.getElementById("diff-val").textContent = diff.toFixed(4);
};
document.getElementById("visc").oninput = e => {
  visc = parseFloat(e.target.value);
  document.getElementById("visc-val").textContent = visc.toFixed(4);
};
document.getElementById("reset-btn").onclick = reset;

document.getElementById("presets").onclick = e => {
  const value = e.target.value;

  switch (value){
    
    case "gas":
      diff = 0;
      visc = 0.0000;
      break;

      case "water":
      diff = 0.00005;
      visc = 0.00054;
      break;

      case "honey":
      diff = 0.000002;
      visc = 0.0015;
      break;

      default:
      diff = 0.0001;
      visc = 0.0005;
      break;
  }

    const diffLabel = document.getElementById("diff-val");
    const viscLabel = document.getElementById("visc-val");
    if (diffLabel) diffLabel.textContent = diff.toFixed(5);
    if (viscLabel) viscLabel.textContent = visc.toFixed(5);
}


// === Mouse Interaction ===
canvas.addEventListener("mousedown", e => {
  isDown = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
});
canvas.addEventListener("mouseup", () => isDown = false);
canvas.addEventListener("mouseleave", () => isDown = false);
canvas.addEventListener("mousemove", e => {
  if (!isDown) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const gridX = Math.floor((x / rect.width) * N);
  const gridY = Math.floor((y / rect.height) * N);
  const idx = IX(gridX, gridY);
  const dx = x - lastX;
  const dy = y - lastY;
  lastX = x; lastY = y;

  // Add velocity
  u[idx] += dx * 0.95;
  v[idx] += dy * 0.95;

  // Add density (rainbow hue)
  const hue = (Date.now() * 0.05) % 360;
  const c = hsvToRgb(hue / 360, 1.0, 1.0);
  densR[idx] += c[0] * 40.0;
  densG[idx] += c[1] * 40.0;
  densB[idx] += c[2] * 40.0;
});

  reset();

  console.log("Starting simulation loop");
  step();



});
