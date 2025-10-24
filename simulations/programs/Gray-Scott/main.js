const canvas = document.getElementById("canvas2d");
const ctx = canvas.getContext("2d", { alpha: false });

// --- retina + crisp scaling ---
function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;

  // get the *CSS* size that the browser actually draws at
  const rect = canvas.getBoundingClientRect();
  const displayWidth = Math.round(rect.width);
  const displayHeight = Math.round(rect.height);

  // set the internal pixel buffer to match CSS × device scale
  canvas.width = displayWidth * scale;
  canvas.height = displayHeight * scale;

  // reset transform so drawing uses logical pixel coords
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // run once at start

// --- simulation setup ---
const size = 400;
let paletteMode = "bluered";

let Du = 0.16, Dv = 0.08, F = 0.037, k = 0.060;
const dt = 0.75;

let U, V, nextU, nextV;
let painting = false;
let paintButton = 0; // 0 = left(V), 2 = right(U)

function initialize() {
  console.log("initializing");
  U = new Float32Array(size * size).fill(1);
  V = new Float32Array(size * size).fill(0);
  nextU = new Float32Array(size * size);
  nextV = new Float32Array(size * size);
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
  // draw simulation to offscreen buffer
  const offscreen = new OffscreenCanvas(size, size);
  const offctx = offscreen.getContext("2d");
  const image = offctx.createImageData(size, size);
  const d = image.data;

  for (let i = 0; i < size * size; i++) {
    const u = U[i];
    const v = V[i];
    const idx = i * 4;

    let r, g, b;
    switch (paletteMode) {
      case "bluered":
        r = (u - v) * 255;
        g = v * 255;
        b = (1 - u) * 255;
        break;
      case "purplegreen":
        r = v * 255;
        g = (u - v) * 128;
        b = (1 - u) * 255;
        break;
      case "redyellow":
        r = (1 - v) * 255;
        g = (u - v) * 255;
        b = u * 100;
        break;
      case "bluegreen":
        r = v * 255;
        g = (1 - u) * 255;
        b = (u - v) * 64;
        break;
      default:
        r = (u - v) * 255;
        g = v * 255;
        b = (1 - u) * 255;
        break;
    }

    d[idx]     = Math.max(0, Math.min(255, r));
    d[idx + 1] = Math.max(0, Math.min(255, g));
    d[idx + 2] = Math.max(0, Math.min(255, b));
    d[idx + 3] = 255;
  }

  offctx.putImageData(image, 0, 0);

  // --- clear and draw sharply ---
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); // clear raw pixel space
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  ctx.imageSmoothingEnabled = false;
  const scale = window.devicePixelRatio || 1;
  ctx.drawImage(offscreen, 0, 0, canvas.width / scale, canvas.height / scale);
}

// --- blowup detection ---
let blowupDetected = false;
let blowupThreshold = 5.0; // values beyond this are unrealistic

function detectBlowup() {
  // scan a few random samples to save time
  for (let i = 0; i < 500; i++) {
    const idx = Math.floor(Math.random() * U.length);
    const u = U[idx];
    const v = V[idx];
    if (!isFinite(u) || !isFinite(v) || Math.abs(u) > blowupThreshold || Math.abs(v) > blowupThreshold) {
      return true;
    }
  }
  return false;
}

function handleBlowup() {
  blowupDetected = true;
  console.warn(" Infinite blowup detected — resetting simulation!");
  initialize();

  // create overlay message
  const overlay = document.createElement("div");
  overlay.textContent = " Infinite blowup detected — simulation reset";
  Object.assign(overlay.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    color: "black",
    fontWeight: "bold",
    fontFamily: "Segoe UI, sans-serif",
    padding: "14px 20px",
    borderRadius: "10px",
    boxShadow: "0 0 15px rgba(0,0,0,0.4)",
    zIndex: 1000,
    textAlign: "center",
    pointerEvents: "none",
    opacity: "0",
    transition: "opacity 0.5s ease"
  });

  // find the canvas container and place it there
  const container = document.getElementById("canvas-container");
  container.style.position = "relative"; // ensure proper overlay positioning
  container.appendChild(overlay);

  // fade in and out
  requestAnimationFrame(() => overlay.style.opacity = "1");
  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 1000);
  }, 2500);
}



// --- main loop ---
function step() {
  for (let i = 0; i < 10; i++) {
    update();
    if (detectBlowup()) {
      handleBlowup();
      break;
    }
  }

  if (!blowupDetected) {
    draw();
  } else {
    blowupDetected = false; // clear flag after reset
  }

  requestAnimationFrame(step);
}


initialize();
step();

// --- Painting ---
function paint(x, y, button) {
  const radius = 8;
  for (let j = -radius; j <= radius; j++) {
    for (let i = -radius; i <= radius; i++) {
      const dx = x + i, dy = y + j;
      if (dx >= 0 && dx < size && dy >= 0 && dy < size && i * i + j * j < radius * radius) {
        const idx = dx + dy * size;
        if (button === 0) {
          V[idx] = 1.0; // left-click adds V
        } else if (button === 2) {
          U[idx] = 1.0; // right-click resets
          V[idx] = 0.0;
        }
      }
    }
  }
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((e.clientX - rect.left) / rect.width) * size);
  const y = Math.floor(((e.clientY - rect.top) / rect.height) * size);
  return { x, y };
}

canvas.addEventListener("mousedown", e => {
  e.preventDefault();
  painting = true;
  paintButton = e.button;
  const { x, y } = getMousePos(e);
  paint(x, y, e.button);
});
canvas.addEventListener("mouseup", () => painting = false);
canvas.addEventListener("mouseleave", () => painting = false);
canvas.addEventListener("mousemove", e => {
  if (!painting) return;
  const { x, y } = getMousePos(e);
  paint(x, y, paintButton);
});
canvas.addEventListener("contextmenu", e => e.preventDefault());

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

document.getElementById("preset").onchange = e => {
  const p = e.target.value;
  console.log("Chose: ", p);
  if (p === "spots") { F = 0.026; k = 0.06; Du = 0.15; Dv = 0.08}
  else if (p === "maze") {  F = 0.037; k = 0.06; Du = 0.16; Dv =0.08 }
  else if (p === "worms") { F = 0.07; k = 0.06; Du=.15; Dv=0.1 }
  else if (p === "waves") { F = 0.023; k = 0.051; Du = 0.16; Dv=0.13}
  else if (p === "chaos") { F = 0.026; k = 0.052; Du = 0.16; Dv=0.11}
  else { F = 0.037; k = 0.06; Du = 0.16; Dv =0.08}
  console.log("Set: ", Du);

  document.getElementById("feed").value = F;
  document.getElementById("kill").value = k;
  document.getElementById("du").value = Du;
  document.getElementById("dv").value = Dv;
  document.getElementById("feed-val").textContent = F.toFixed(3);
  document.getElementById("kill-val").textContent = k.toFixed(3);
  document.getElementById("du-val").textContent = Du.toFixed(3);
  document.getElementById("dv-val").textContent = Dv.toFixed(3);
};

document.getElementById("palette").onchange = e => {
  paletteMode = e.target.value;
};
