(() => {
  // ===== Dipole field for <canvas id="dipole-canvas"> =====
  const dCanvas = document.getElementById("dipole-canvas");
  const dCtx = dCanvas.getContext("2d");

  // --- canvas / DPR ---
  let dWidth = 0, dHeight = 0;
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = dCanvas.getBoundingClientRect();
    dCanvas.width  = Math.round(rect.width  * dpr);
    dCanvas.height = Math.round(rect.height * dpr);
    dWidth  = rect.width;
    dHeight = rect.height;
    dCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- world box ---
  const xMin = -15, xMax = 15;
  const yMin = -15, yMax = 15;
  const xRange = xMax - xMin, yRange = yMax - yMin;

  const worldToCanvas = (x, y) => ({ cx: (x - xMin) / xRange * dWidth, cy: dHeight - (y - yMin) / yRange * dHeight });
  const canvasToWorld = (cx, cy) => ({ x: xMin + (cx / dWidth) * xRange, y: yMin + ((dHeight - cy) / dHeight) * yRange });

  // --- state ---
  const charges = [ { x: -5, y: 0, q: +5 }, { x: +5, y: 0, q: -5 } ];
  let k = 1, cols = 27, rows = 27, chargeRadius = 20, draggingIdx = -1;

  // --- render-on-demand scheduler ---
  let rafId = null, needsRender = true;
  const scheduleRender = () => { if (rafId !== null) return; rafId = requestAnimationFrame(() => { rafId = null; if (!needsRender) return; needsRender = false; render(); }); };
  const invalidate = () => { needsRender = true; scheduleRender(); };

  // --- helpers ---
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function whichChargeAtClient(cx, cy) {
    const hitPx = chargeRadius + 8;
    for (let i = 0; i < charges.length; i++) {
      const { cx: sx, cy: sy } = worldToCanvas(charges[i].x, charges[i].y);
      if (Math.hypot(cx - sx, cy - sy) <= hitPx) return i;
    }
    return -1;
  }

  function drawArrow(cx, cy, vx, vy, maxLenPx = 16) {
    const len = Math.hypot(vx, vy) || 1e-9;
    const s = Math.min(maxLenPx / len, 1);
    const dx = vx * s, dy = vy * s;
    dCtx.beginPath(); dCtx.moveTo(cx, cy); dCtx.lineTo(cx + dx, cy + dy); dCtx.stroke();
    const head = 5, a = Math.atan2(dy, dx);
    dCtx.beginPath();
    dCtx.moveTo(cx + dx, cy + dy);
    dCtx.lineTo(cx + dx + head * Math.cos(a + 2.6), cy + dy + head * Math.sin(a + 2.6));
    dCtx.moveTo(cx + dx, cy + dy);
    dCtx.lineTo(cx + dx + head * Math.cos(a - 2.6), cy + dy + head * Math.sin(a - 2.6));
    dCtx.stroke();
  }

  // --- render ---
  function render() {
    dCtx.clearRect(0, 0, dWidth, dHeight);
    dCtx.fillStyle = "#fdf8ecff";
    dCtx.fillRect(0, 0, dWidth, dHeight);

    const dxw = xRange / cols, dyw = yRange / rows;
    dCtx.lineWidth = 1.2;
    dCtx.strokeStyle = "#1b3a7a";
    const pxPerX = dWidth / xRange, pxPerY = dHeight / yRange;
    const gain = 120;

    for (let i = 0; i < cols; i++) {
      const x = xMin + (i + 0.5) * dxw;
      for (let j = 0; j < rows; j++) {
        const y = yMin + (j + 0.5) * dyw;

        let Ex = 0, Ey = 0;
        for (const c of charges) {
          const rx = x - c.x, ry = y - c.y;
          const r2 = rx*rx + ry*ry;
          const invr3 = 1 / Math.pow(Math.max(r2, 1e-6), 1.5);
          Ex += k * c.q * rx * invr3;
          Ey += k * c.q * ry * invr3;
        }

        const { cx, cy } = worldToCanvas(x, y);
        const vx =  Ex * pxPerX * gain;
        const vy = -Ey * pxPerY * gain;
        drawArrow(cx, cy, vx, vy, 16);
      }
    }

    // charges
    for (const c of charges) {
      const { cx, cy } = worldToCanvas(c.x, c.y);
      dCtx.fillStyle = c.q >= 0 ? "#1e3a8a" /* blue */ : "#b91c1c" /* red */;
      dCtx.beginPath(); dCtx.arc(cx, cy, chargeRadius, 0, Math.PI*2); dCtx.fill();
      dCtx.fillStyle = "#fff";
      dCtx.font = `bold ${Math.round(chargeRadius * 1.1)}px system-ui, sans-serif`;
      dCtx.textAlign = "center"; dCtx.textBaseline = "middle";
      dCtx.fillText(c.q >= 0 ? "+" : "−", cx, cy);
    }
  }

  // --- events ---
  window.addEventListener("resize", () => { resizeCanvas(); invalidate(); });

  dCanvas.addEventListener("pointerdown", (e) => {
    const r = dCanvas.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    const idx = whichChargeAtClient(cx, cy);
    if (idx !== -1) {
      draggingIdx = idx;
      dCanvas.setPointerCapture(e.pointerId);
      dCanvas.style.cursor = "grabbing";
    }
  });

  dCanvas.addEventListener("pointermove", (e) => {
    const r = dCanvas.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;

    if (draggingIdx === -1) {
      dCanvas.style.cursor = whichChargeAtClient(cx, cy) !== -1 ? "grab" : "crosshair";
      invalidate(); // if you later add hover rings, this ensures they show
      return;
    }
    const p = canvasToWorld(cx, cy);
    const marginX = 1 * (xRange / dWidth);
    const marginY = 1 * (yRange / dHeight);
    charges[draggingIdx].x = clamp(p.x, xMin + marginX, xMax - marginX);
    charges[draggingIdx].y = clamp(p.y, yMin + marginY, yMax - marginY);
    invalidate();
  });

  dCanvas.addEventListener("pointerup", (e) => {
    draggingIdx = -1;
    dCanvas.releasePointerCapture?.(e.pointerId);
    dCanvas.style.cursor = "crosshair";
    invalidate();
  });

  dCanvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const r = dCanvas.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    const idx = whichChargeAtClient(cx, cy);
    if (idx !== -1) { charges[idx].q = -charges[idx].q; invalidate(); }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "[" && cols > 8 && rows > 8) { cols = Math.max(8, Math.floor(cols * 0.85)); rows = Math.max(8, Math.floor(rows * 0.85)); invalidate(); }
    if (e.key === "]") { cols = Math.min(80, Math.ceil(cols * 1.15)); rows = Math.min(80, Math.ceil(rows * 1.15)); invalidate(); }
    if (e.key.toLowerCase() === "t") {
      // toggle whichever is closer to canvas center
      let best=-1, bestD=1e9;
      for (let i=0;i<charges.length;i++){ const p=worldToCanvas(charges[i].x,charges[i].y); const d=Math.hypot(p.cx-dWidth/2,p.cy-dHeight/2); if(d<bestD){bestD=d;best=i;} }
      if (best!==-1){ charges[best].q = -charges[best].q; invalidate(); }
    }
  });

  // --- init ---
  document.addEventListener("DOMContentLoaded", () => { resizeCanvas(); invalidate(); });
})();
