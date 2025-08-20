
(() => {
// ===== Dipole field for <canvas id="dipole-canvas"> =====
const dCanvas = document.getElementById("dipole-canvas");
const dCtx = dCanvas.getContext("2d");

let dWidth = 0, dHeight = 0;
let lastTime = 0;

// World box (same as monopole so visuals match)
const xMin = -15, xMax = 15;
const yMin = -15, yMax = 15;
const xRange = xMax - xMin, yRange = yMax - yMin;

// Two charges (world coords)
const charges = [
  { x: -5, y: 0, q: +5 },  // +q
  { x: +5, y: 0, q: -5 },  // -q
];

let k = 1;                 // visual scale
let cols = 32, rows = 32;  // arrow density
let chargeRadius = 25;     // drawn radius (CSS px)
const arrowGain = 120;     // arrow length scale

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = dCanvas.getBoundingClientRect();
  dCanvas.width  = Math.round(rect.width * dpr);
  dCanvas.height = Math.round(rect.height * dpr);
  dWidth  = rect.width;
  dHeight = rect.height;
  dCtx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS px
}

function worldToCanvas(x, y) {
  const cx = (x - xMin) / xRange * dWidth;
  const cy = dHeight - (y - yMin) / yRange * dHeight;
  return { cx, cy };
}
function canvasToWorld(cx, cy) {
  const x = xMin + (cx / dWidth) * xRange;
  const y = yMin + ((dHeight - cy) / dHeight) * yRange;
  return { x, y };
}

function drawArrow(cx, cy, vx, vy, maxLenPx = 16) {
  const len = Math.hypot(vx, vy) || 1e-9;
  const s = Math.min(maxLenPx / len, 1);
  const dx = vx * s, dy = vy * s;

  dCtx.beginPath();
  dCtx.moveTo(cx, cy);
  dCtx.lineTo(cx + dx, cy + dy);
  dCtx.stroke();

  const head = 5, a = Math.atan2(dy, dx);
  dCtx.beginPath();
  dCtx.moveTo(cx + dx, cy + dy);
  dCtx.lineTo(cx + dx + head * Math.cos(a + 2.6), cy + dy + head * Math.sin(a + 2.6));
  dCtx.moveTo(cx + dx, cy + dy);
  dCtx.lineTo(cx + dx + head * Math.cos(a - 2.6), cy + dy + head * Math.sin(a - 2.6));
  dCtx.stroke();
}

function update() {
  // bg
  dCtx.clearRect(0, 0, dWidth, dHeight);
  dCtx.fillStyle = "#fdf8ecff";
  dCtx.fillRect(0, 0, dWidth, dHeight);

  const dxw = xRange / cols, dyw = yRange / rows;
  dCtx.lineWidth = 1.2;
  dCtx.strokeStyle = "#1b3a7a";

  const pxPerWorldX = dWidth / xRange;
  const pxPerWorldY = dHeight / yRange;

  for (let i = 0; i < cols; i++) {
    const x = xMin + (i + 0.5) * dxw;
    for (let j = 0; j < rows; j++) {
      const y = yMin + (j + 0.5) * dyw;

      // Sum fields from both charges: E = Σ k q r / |r|^3
      let Ex = 0, Ey = 0;
      for (const c of charges) {
        const rX = x - c.x, rY = y - c.y;
        const r2 = rX*rX + rY*rY;
        const invr3 = 1 / Math.pow(Math.max(r2, 1e-6), 1.5);
        Ex += k * c.q * rX * invr3;
        Ey += k * c.q * rY * invr3;
      }

      const { cx, cy } = worldToCanvas(x, y);
      const vx = Ex * pxPerWorldX * arrowGain;
      const vy = -Ey * pxPerWorldY * arrowGain; // canvas y-down

      drawArrow(cx, cy, vx, vy, 16);
    }
  }

  // draw charges
  for (const c of charges) {
    const { cx, cy } = worldToCanvas(c.x, c.y);
    dCtx.fillStyle = c.q >= 0 ? "#0a6b2e" : "#b91c1c";
    dCtx.beginPath();
    dCtx.arc(cx, cy, chargeRadius, 0, Math.PI * 2);
    dCtx.fill();
    dCtx.fillStyle = "#fff";
    dCtx.font = "bold 22px system-ui, sans-serif";
    dCtx.textAlign = "center";
    dCtx.textBaseline = "middle";
    dCtx.fillText(c.q >= 0 ? "+" : "−", cx, cy);
  }
}

function animate(t) {
  const dt = (t - lastTime) / 1000;
  lastTime = t;
  update();
  requestAnimationFrame(animate);
}

// --- interaction ---
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// return index of hovered charge (or -1) using hit radius in CSS px
function whichChargeAtClient(cx, cy) {
  // expand hit target slightly beyond radius
  const hitPx = chargeRadius*1.25;
  for (let i = 0; i < charges.length; i++) {
    const { cx: sx, cy: sy } = worldToCanvas(charges[i].x, charges[i].y);
    if (Math.hypot(cx - sx, cy - sy) <= hitPx) return i;
  }
  return -1;
}

let draggingIdx = -1;

document.addEventListener("DOMContentLoaded", () => {
  resizeCanvas();
  requestAnimationFrame(animate);

  window.addEventListener("resize", () => { resizeCanvas(); update(); });

  dCanvas.addEventListener("pointerdown", (e) => {
    const rect = dCanvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const idx = whichChargeAtClient(cx, cy);
    if (idx !== -1) {
      draggingIdx = idx;
      dCanvas.setPointerCapture(e.pointerId);
      dCanvas.style.cursor = "grabbing";
    }
  });

  dCanvas.addEventListener("pointermove", (e) => {
    const rect = dCanvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;

    // hover cursor
    if (draggingIdx === -1) {
      dCanvas.style.cursor = whichChargeAtClient(cx, cy) !== -1 ? "grab" : "crosshair";
    }

    if (draggingIdx === -1) return;

    // map pointer to world, then clamp within 1px margin
    const { x, y } = canvasToWorld(cx, cy);
    const marginWorldX = 1 * (xRange / dWidth);
    const marginWorldY = 1 * (yRange / dHeight);

    charges[draggingIdx].x = clamp(x, xMin + marginWorldX, xMax - marginWorldX);
    charges[draggingIdx].y = clamp(y, yMin + marginWorldY, yMax - marginWorldY);
  });

  dCanvas.addEventListener("pointerup", (e) => {
    draggingIdx = -1;
    dCanvas.releasePointerCapture?.(e.pointerId);
    dCanvas.style.cursor = "crosshair";
  });

  // Right-click to toggle the hovered charge
  dCanvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const rect = dCanvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const idx = whichChargeAtClient(cx, cy);
    if (idx !== -1) {
      charges[idx].q = -charges[idx].q;
    }
  });

  // Optional keyboard shortcuts:
  // T: toggle closest charge under the mouse; [ / ]: density down/up
  window.addEventListener("keydown", (e) => {
    if (e.key === "[" && cols > 8 && rows > 8) {
      cols = Math.max(8, Math.floor(cols * 0.85));
      rows = Math.max(8, Math.floor(rows * 0.85));
    }
    if (e.key === "]") {
      cols = Math.min(80, Math.ceil(cols * 1.15));
      rows = Math.min(80, Math.ceil(rows * 1.15));
    }
    if (e.key.toLowerCase() === "t") {
      // toggle whichever charge is closer to center of canvas
      const centerIdx = (({cx,cy})=>{
        let best = -1, bestD = 1e9;
        for (let i=0;i<charges.length;i++){
          const p = worldToCanvas(charges[i].x, charges[i].y);
          const d = Math.hypot(p.cx-cx, p.cy-cy);
          if (d < bestD) { bestD = d; best = i; }
        }
        return best;
      })({ cx: dWidth/2, cy: dHeight/2 });
      if (centerIdx !== -1) charges[centerIdx].q = -charges[centerIdx].q;
    }
  });
});

})();