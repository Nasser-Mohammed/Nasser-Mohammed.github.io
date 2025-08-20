
(() => {
const canvas = document.getElementById("mono-canvas");
const ctx = canvas.getContext("2d");

let lastTime = 0;

// Canvas draw-space (CSS px)
let width = 0, height = 0;

// World box
const xMin = -15, xMax = 15;
const yMin = -15, yMax = 15;
const xRange = xMax - xMin;
const yRange = yMax - yMin;

// Monopole (world coords)
let sourceX = 0;
let sourceY = 0;
let sourceQ = -5;

// Visual scale (not physical)
let k = 1;

// === GRID DENSITY (lower numbers = fewer arrows) ===
let cols = 15;   // was 50
let rows = 15;   // was 50

// Charge drawing size (CSS px)
let chargeRadius = 16; // was 6 — bigger dot

let hoverMono = false;   
let dragging = false;    


function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}


function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  width  = rect.width;
  height = rect.height;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function worldToCanvas(x, y) {
  const cx = (x - xMin) / xRange * width;
  const cy = height - (y - yMin) / yRange * height;
  return { cx, cy };
}
function canvasToWorld(cx, cy) {
  const x = xMin + (cx / width) * xRange;
  const y = yMin + ((height - cy) / height) * yRange;
  return { x, y };
}

function pxToWorldScale() {
  // convert px → world (averaged for a circular hit area)
  const sx = xRange / width;
  const sy = yRange / height;
  return (sx + sy) * 0.5;
}

function hitWorldRadius(extraPx = 8) {
  // chargeRadius (px) + margin (px), converted to world units
  return (chargeRadius + extraPx) * pxToWorldScale();
}

function drawArrow(cx, cy, vx, vy, maxLenPx = 16) {
  const len = Math.hypot(vx, vy) || 1e-9;
  const scale = Math.min(maxLenPx / len, 1);
  const dx = vx * scale, dy = vy * scale;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + dx, cy + dy);
  ctx.stroke();
  const head = 5;
  const a = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(cx + dx, cy + dy);
  ctx.lineTo(cx + dx + head * Math.cos(a + 2.6), cy + dy + head * Math.sin(a + 2.6));
  ctx.moveTo(cx + dx, cy + dy);
  ctx.lineTo(cx + dx + head * Math.cos(a - 2.6), cy + dy + head * Math.sin(a - 2.6));
  ctx.stroke();
}

function update(dt) {
  // background
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fdf8ecff";
  ctx.fillRect(0, 0, width, height);

  // grid step in world units
  const dxw = xRange / cols;
  const dyw = yRange / rows;

  // arrow style
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#1b3a7a";

  const pxPerWorldX = width / xRange;
  const pxPerWorldY = height / yRange;
  const gain = 120;

  for (let i = 0; i < cols; i++) {
    const x = xMin + (i + 0.5) * dxw;
    for (let j = 0; j < rows; j++) {
      const y = yMin + (j + 0.5) * dyw;

      // E = k q r / |r|^3
      const rX = x - sourceX, rY = y - sourceY;
      const r2 = rX*rX + rY*rY;
      const invr3 = 1 / Math.pow(Math.max(r2, 1e-6), 1.5);
      const Ex = k * sourceQ * rX * invr3;
      const Ey = k * sourceQ * rY * invr3;

      const { cx, cy } = worldToCanvas(x, y);
      const vx = Ex * pxPerWorldX * gain;
      const vy = -Ey * pxPerWorldY * gain; // canvas y-down
      drawArrow(cx, cy, vx, vy, 16);
    }
  }

  // draw the charge (bigger)
  const { cx: sx, cy: sy } = worldToCanvas(sourceX, sourceY);
  ctx.fillStyle = sourceQ >= 0 ? "#0a6b2e" : "#b91c1c";
  ctx.beginPath();
  ctx.arc(sx, sy, chargeRadius, 0, Math.PI * 2);
  ctx.fill();

  // sign glyph
  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sourceQ >= 0 ? "+" : "−", sx, sy);
}

function animate(t) {
  const dt = (t - lastTime) / 1000;
  lastTime = t;
  update(dt);
  requestAnimationFrame(animate);
}

document.addEventListener("DOMContentLoaded", () => {
  resizeCanvas();
  requestAnimationFrame(animate);
  window.addEventListener("resize", () => { resizeCanvas(); update(0); });

  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const { x, y } = canvasToWorld(cx, cy);

    const hit = Math.hypot(x - sourceX, y - sourceY) < hitWorldRadius(8); // +8px margin
    if (hit) {
        dragging = true;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
    }
    });

  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;

    if (!dragging) {
        // Hover check in world space
        const { x, y } = canvasToWorld(cx, cy);
        hoverMono = Math.hypot(x - sourceX, y - sourceY) < hitWorldRadius(8);
        canvas.style.cursor = hoverMono ? "grab" : "crosshair";
        return;
    }

    // Dragging branch
    const p = canvasToWorld(cx, cy);

    // clamp so charge stays visible, ~1 px margin
    const marginWorldX = 1 * (xRange / width);
    const marginWorldY = 1 * (yRange / height);

    sourceX = clamp(p.x, xMin + marginWorldX, xMax - marginWorldX);
    sourceY = clamp(p.y, yMin + marginWorldY, yMax - marginWorldY);
    });

  canvas.addEventListener("pointerup", (e) => {
    dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
    // recompute cursor state immediately
    hoverMono = false;
    canvas.style.cursor = "crosshair";
    });
  canvas.addEventListener("pointerleave", () => {
    hoverMono = false;
    if (!dragging) canvas.style.cursor = "crosshair";
    });


  // right-click toggles sign (no extra UI)
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    sourceQ = -sourceQ;
  });

  // optional: keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.key === "t") sourceQ = -sourceQ;              // 't' to toggle sign
    if (e.key === "[" && cols > 8 && rows > 8) {        // decrease density
      cols = Math.max(8, Math.floor(cols * 0.85));
      rows = Math.max(8, Math.floor(rows * 0.85));
    }
    if (e.key === "]") {                                 // increase density
      cols = Math.min(80, Math.ceil(cols * 1.15));
      rows = Math.min(80, Math.ceil(rows * 1.15));
    }
  });
});
})();