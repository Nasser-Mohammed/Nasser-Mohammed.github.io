(() => {
  const canvas = document.getElementById("mono-canvas");
  const ctx = canvas.getContext("2d");

  // --- canvas / DPR ---
  let width = 0, height = 0;
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.round(rect.width  * dpr);
    canvas.height = Math.round(rect.height * dpr);
    width  = rect.width;
    height = rect.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- world box ---
  const xMin = -15, xMax = 15;
  const yMin = -15, yMax = 15;
  const xRange = xMax - xMin, yRange = yMax - yMin;

  const worldToCanvas = (x, y) => ({
    cx: (x - xMin) / xRange * width,
    cy: height - (y - yMin) / yRange * height
  });
  const canvasToWorld = (cx, cy) => ({
    x: xMin + (cx / width) * xRange,
    y: yMin + ((height - cy) / height) * yRange
  });

  // --- state ---
  let sourceX = 0, sourceY = 0, sourceQ = -5;
  let k = 1;                    // visual scale
  let cols = 27, rows = 27;     // arrow density
  let chargeRadius = 20;        // px
  let dragging = false, hoverMono = false;

  // --- render-on-demand scheduler ---
  let rafId = null;
  let needsRender = true;
  function scheduleRender() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => { rafId = null; if (!needsRender) return; needsRender = false; render(); });
  }
  function invalidate() { needsRender = true; scheduleRender(); }

  // --- helpers ---
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function pxToWorldScale() {
    const sx = xRange / width, sy = yRange / height;
    return (sx + sy) * 0.5;
  }
  function hitWorldRadius(extraPx = 8) {
    return (chargeRadius + extraPx) * pxToWorldScale();
  }

  function drawArrow(cx, cy, vx, vy, maxLenPx = 16) {
    const len = Math.hypot(vx, vy) || 1e-9;
    const s = Math.min(maxLenPx / len, 1);
    const dx = vx * s, dy = vy * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + dx, cy + dy);
    ctx.stroke();
    const head = 5, a = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(cx + dx, cy + dy);
    ctx.lineTo(cx + dx + head * Math.cos(a + 2.6), cy + dy + head * Math.sin(a + 2.6));
    ctx.moveTo(cx + dx, cy + dy);
    ctx.lineTo(cx + dx + head * Math.cos(a - 2.6), cy + dy + head * Math.sin(a - 2.6));
    ctx.stroke();
  }

  // --- render ---
  function render() {
    // bg
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fdf8ecff";
    ctx.fillRect(0, 0, width, height);

    // grid & style
    const dxw = xRange / cols, dyw = yRange / rows;
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "#1b3a7a";

    const pxPerX = width / xRange, pxPerY = height / yRange;
    const gain = 120;

    // draw field
    for (let i = 0; i < cols; i++) {
      const x = xMin + (i + 0.5) * dxw;
      for (let j = 0; j < rows; j++) {
        const y = yMin + (j + 0.5) * dyw;

        // E = k q r / |r|^3
        const rx = x - sourceX, ry = y - sourceY;
        const r2 = rx*rx + ry*ry;
        const invr3 = 1 / Math.pow(Math.max(r2, 1e-6), 1.5);
        const Ex = k * sourceQ * rx * invr3;
        const Ey = k * sourceQ * ry * invr3;

        const { cx, cy } = worldToCanvas(x, y);
        const vx =  Ex * pxPerX * gain;
        const vy = -Ey * pxPerY * gain; // canvas y-down
        drawArrow(cx, cy, vx, vy, 16);
      }
    }

    // charge
    const { cx: sx, cy: sy } = worldToCanvas(sourceX, sourceY);
    ctx.fillStyle = sourceQ >= 0 ? "#1e3a8a" /* blue */ : "#b91c1c" /* red */;
    ctx.beginPath();
    ctx.arc(sx, sy, chargeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.round(chargeRadius * 1.1)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sourceQ >= 0 ? "+" : "−", sx, sy);

    // hover ring
    if (hoverMono && !dragging) {
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, chargeRadius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // --- events ---
  window.addEventListener("resize", () => { resizeCanvas(); invalidate(); });

  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const { x, y } = canvasToWorld(cx, cy);
    const hit = Math.hypot(x - sourceX, y - sourceY) < hitWorldRadius(8);
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
      const { x, y } = canvasToWorld(cx, cy);
      hoverMono = Math.hypot(x - sourceX, y - sourceY) < hitWorldRadius(8);
      canvas.style.cursor = hoverMono ? "grab" : "crosshair";
      // only redraw if hover visual changed
      invalidate();
      return;
    }

    const p = canvasToWorld(cx, cy);
    const marginX = 1 * (xRange / width);
    const marginY = 1 * (yRange / height);
    sourceX = clamp(p.x, xMin + marginX, xMax - marginX);
    sourceY = clamp(p.y, yMin + marginY, yMax - marginY);
    invalidate();
  });

  canvas.addEventListener("pointerup", (e) => {
    dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
    hoverMono = false;
    canvas.style.cursor = "crosshair";
    invalidate();
  });
  canvas.addEventListener("pointerleave", () => { hoverMono = false; if (!dragging) canvas.style.cursor = "crosshair"; invalidate(); });

  canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); sourceQ = -sourceQ; invalidate(); });

  window.addEventListener("keydown", (e) => {
    if (e.key === "t") { sourceQ = -sourceQ; invalidate(); }
    if (e.key === "[" && cols > 8 && rows > 8) { cols = Math.max(8, Math.floor(cols * 0.85)); rows = Math.max(8, Math.floor(rows * 0.85)); invalidate(); }
    if (e.key === "]") { cols = Math.min(80, Math.ceil(cols * 1.15)); rows = Math.min(80, Math.ceil(rows * 1.15)); invalidate(); }
  });

  // --- init ---
  document.addEventListener("DOMContentLoaded", () => { resizeCanvas(); invalidate(); });
})();
