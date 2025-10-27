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
let N = 150;
const iter = 16;
const dt = 0.1;

let diff = 0.000;
let visc = 0.000;
let mode = "gas";

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
let isDownLeft = false;
let isDownRight = false;

// === Touch Interaction (mobile) ===
let isTouching = false;
let isTwoFinger = false;

function IX(x, y) { return x + (N + 2) * y; }


function reinitFluid(newN) {
  N = newN;
  size = (N + 2) * (N + 2);

  // recreate all field arrays
  densR = new Float32Array(size);
  densG = new Float32Array(size);
  densB = new Float32Array(size);
  densPrevR = new Float32Array(size);
  densPrevG = new Float32Array(size);
  densPrevB = new Float32Array(size);
  u = new Float32Array(size);
  v = new Float32Array(size);
  uPrev = new Float32Array(size);
  vPrev = new Float32Array(size);

  reset(); // clear all
  console.log(`Reinitialized fluid at N=${N}`);
}


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

function getCanvasPosFromTouch(t) {
  const rect = canvas.getBoundingClientRect();
  return { x: t.clientX - rect.left, y: t.clientY - rect.top, rect };
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
  mode = value;

  switch (value){
    
    case "gas":
      diff = 0;
      visc = 0.0000;
      break;

      case "water":
      diff = 0.00004;
      visc = 0.00025;
      break;

      case "honey":
      diff = 0.000002;
      visc = 0.001;
      break;

      default:
      diff = 0.0001;
      visc = 0.0002;
      break;
  }

    const diffLabel = document.getElementById("diff-val");
    const viscLabel = document.getElementById("visc-val");
    const diffSlider = document.getElementById("diff");
    const viscSlider = document.getElementById("visc");
    
    if (diffSlider) diffSlider.value = diff;
    if (viscSlider) viscSlider.value = visc;
    if (diffLabel) diffLabel.textContent = diff.toFixed(5);
    if (viscLabel) viscLabel.textContent = visc.toFixed(5);
}

  const fidelitySlider = document.getElementById("fidelity");
  const fidelityLabel = document.getElementById("fidelity-val");

  fidelitySlider.addEventListener("change", e => {
    const newN = parseInt(e.target.value);
    fidelityLabel.textContent = newN;
    reinitFluid(newN);
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());



// === Mouse Interaction ===
canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;

  if (e.button === 2) {        // right button
    isDownRight = true;
  } else if (e.button === 0) { // left button
    isDownLeft = true;
  }
});

canvas.addEventListener("mouseup", e => {
  if (e.button === 2) isDownRight = false;
  if (e.button === 0) isDownLeft = false;
});
canvas.addEventListener("mouseleave", () => {
  isDownLeft = false;
  isDownRight = false;
});

canvas.addEventListener("mousemove", e => {
  if (!isDownLeft && !isDownRight) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const gridX = Math.floor((x / rect.width) * N);
  const gridY = Math.floor((y / rect.height) * N);
  const idx = IX(gridX, gridY);

  const dx = x - lastX;
  const dy = y - lastY;
  lastX = x;
  lastY = y;

  // smooth rainbow color for left-drag dye
  const hue = (Date.now() * 0.05) % 360;
  const c = hsvToRgb(hue / 360, 1.0, 1.0);

  if (isDownRight) {
    // === RIGHT DRAG: velocity only (no dye) ===
    u[idx] += dx * 2.0;
    v[idx] += dy * 2.0;
  } else if (isDownLeft) {
    if (e.shiftKey) {
      // === SHIFT + LEFT DRAG: dye only ===
      densR[idx] += c[0] * 40.0;
      densG[idx] += c[1] * 40.0;
      densB[idx] += c[2] * 40.0;
    } else {
      // === LEFT DRAG: velocity + light dye ===
      u[idx] += dx * 2.0;
      v[idx] += dy * 2.0;
      densR[idx] += c[0] * 10.0;
      densG[idx] += c[1] * 10.0;
      densB[idx] += c[2] * 10.0;
    }
  }
});

canvas.addEventListener("touchstart", (e) => {
  // we need to prevent default scrolling/zooming
  e.preventDefault();
  if (e.touches.length === 0) return;

  isTouching = true;
  isTwoFinger = e.touches.length >= 2;

  const { x, y } = getCanvasPosFromTouch(e.touches[0]);
  lastX = x;
  lastY = y;
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!isTouching || e.touches.length === 0) return;

  const { x, y, rect } = getCanvasPosFromTouch(e.touches[0]);

  const gridX = Math.floor((x / rect.width) * N);
  const gridY = Math.floor((y / rect.height) * N);
  const idx = IX(gridX, gridY);

  const dx = x - lastX;
  const dy = y - lastY;
  lastX = x;
  lastY = y;

  const hue = (Date.now() * 0.05) % 360;
  const c = hsvToRgb(hue / 360, 1.0, 1.0);

  if (isTwoFinger) {
    // === TWO FINGERS: velocity only (mobile equivalent of right-drag) ===
    u[idx] += dx * 2.0;
    v[idx] += dy * 2.0;
  } else {
    // === ONE FINGER: velocity + light dye (like normal left-drag) ===
    u[idx] += dx * 2.0;
    v[idx] += dy * 2.0;
    densR[idx] += c[0] * 10.0;
    densG[idx] += c[1] * 10.0;
    densB[idx] += c[2] * 10.0;
  }
}, { passive: false });

function endTouch() {
  isTouching = false;
  isTwoFinger = false;
}
canvas.addEventListener("touchend", endTouch, { passive: false });
canvas.addEventListener("touchcancel", endTouch, { passive: false });


  reset();

  console.log("Starting simulation loop");
  step();



});
