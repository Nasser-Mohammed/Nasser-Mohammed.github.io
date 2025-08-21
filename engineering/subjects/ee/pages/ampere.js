(() => {
  const canvas = document.getElementById("ampere-canvas");
  const ctx = canvas.getContext("2d");

  // --- canvas / DPR ---
  let width = 0, height = 0;
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.round(rect.width  * dpr);
    canvas.height = Math.round(rect.height * dpr);
    width = rect.width;
    height = rect.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- world box ---
  const xMin = -15, xMax = 15;
  const yMin = -15, yMax = 15;
  const xRange = xMax - xMin, yRange = yMax - yMin;

  const toCanvas = (x, y) => ({ cx: (x - xMin) / xRange * width, cy: height - (y - yMin) / yRange * height });
  const toWorld  = (cx, cy) => ({ x: xMin + (cx / width) * xRange, y: yMin + ((height - cy) / height) * yRange });
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // --- state ---
  let wx = 0, wy = 0;     // wire position
  let I  = +6;            // current; sign sets direction (out ⨀ / in ⨂)
  const mu0 = 1;
  let cols = 28, rows = 28;
  const arrowGain = 140;
  const handleR = 18;     // px
  let draggingWire = false, hoverWire = false;

  // note: you previously hid the dashed/hover loop; keeping loop data for wheel/teaching if needed
  let loop = { x: 5, y: 0, r: 5 }; // not drawn by default

  // --- render-on-demand scheduler ---
  let rafId = null, needsRender = true;
  const scheduleRender = () => { if (rafId !== null) return; rafId = requestAnimationFrame(() => { rafId = null; if (!needsRender) return; needsRender = false; render(); }); };
  const invalidate = () => { needsRender = true; scheduleRender(); };

  // --- field from infinite straight wire ---
  function B_at(x, y) {
    const dx = x - wx, dy = y - wy;
    const r2 = dx*dx + dy*dy;
    const r = Math.sqrt(Math.max(r2, 1e-9));
    const mag = (mu0 * Math.abs(I)) / (2 * Math.PI * r);
    // tangent unit vector (rotate radial by +90°)
    const tx = -dy / r, ty = dx / r;
    const s = I >= 0 ? 1 : -1; // out of page (⨀) vs into page (⨂)
    return { Bx: s * mag * tx, By: s * mag * ty };
  }

  function drawArrow(cx, cy, vx, vy, maxLenPx = 16) {
    const len = Math.hypot(vx, vy) || 1e-9;
    const s = Math.min(maxLenPx / len, 1);
    const dx = vx * s, dy = vy * s;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx, cy + dy); ctx.stroke();
    const head = 5, a = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(cx + dx, cy + dy);
    ctx.lineTo(cx + dx + head * Math.cos(a + 2.6), cy + dy + head * Math.sin(a + 2.6));
    ctx.moveTo(cx + dx, cy + dy);
    ctx.lineTo(cx + dx + head * Math.cos(a - 2.6), cy + dy + head * Math.sin(a - 2.6));
    ctx.stroke();
  }

  function drawWireHandle() {
    const { cx, cy } = toCanvas(wx, wy);
    ctx.fillStyle = I >= 0 ? "#1e3a8a" /* out ⨀ */ : "#b91c1c" /* in ⨂ */;
    ctx.beginPath(); ctx.arc(cx, cy, handleR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.round(handleR * 1.2)}px system-ui, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(I >= 0 ? "⨀" : "⨂", cx, cy);
    if (hoverWire && !draggingWire) {
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, handleR + 4, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // (kept if you ever want to show the loop again)
  function drawLoop() {
    const { cx, cy } = toCanvas(loop.x, loop.y);
    const rPx = loop.r * (width / xRange);
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, rPx, 0, Math.PI * 2); ctx.stroke();
  }

  // --- render ---
  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fdf8ecff";
    ctx.fillRect(0, 0, width, height);

    const dxw = xRange / cols, dyw = yRange / rows;
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "#1b3a7a";
    const pxPerX = width / xRange, pxPerY = height / yRange;

    for (let i = 0; i < cols; i++) {
      const x = xMin + (i + 0.5) * dxw;
      for (let j = 0; j < rows; j++) {
        const y = yMin + (j + 0.5) * dyw;
        const { Bx, By } = B_at(x, y);
        const { cx, cy } = toCanvas(x, y);
        const vx =  Bx * pxPerX * arrowGain;
        const vy = -By * pxPerY * arrowGain;
        drawArrow(cx, cy, vx, vy, 16);
      }
    }

    // drawLoop(); // (left disabled per your preference)
    drawWireHandle();

    // legend
    ctx.fillStyle = "#0f172a";
    ctx.font = "600 16px system-ui, sans-serif";
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(`I = ${I.toFixed(1)}  (${I >= 0 ? "out ⨀" : "in ⨂"})`, 10, 10);
    ctx.fillText(`∮B·dl = μ₀ I_enc`, 10, 32);
  }

  // --- ROD events ---
  window.addEventListener("resize", () => { resizeCanvas(); invalidate(); });

  function hitWireClient(cx, cy) {
    const { cx: wxp, cy: wyp } = toCanvas(wx, wy);
    const hitPx = handleR + 8;
    return Math.hypot(cx - wxp, cy - wyp) <= hitPx;
  }

  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    if (hitWireClient(cx, cy)) {
      draggingWire = true;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;

    if (!draggingWire) {
      hoverWire = hitWireClient(cx, cy);
      canvas.style.cursor = hoverWire ? "grab" : "crosshair";
      invalidate(); // to show hover ring instantly
      return;
    }

    const p = toWorld(cx, cy);
    const marginX = 1 * (xRange / width);
    const marginY = 1 * (yRange / height);
    wx = clamp(p.x, xMin + marginX, xMax - marginX);
    wy = clamp(p.y, yMin + marginY, yMax - marginY);
    invalidate();
  });

  canvas.addEventListener("pointerup", (e) => {
    draggingWire = false;
    canvas.releasePointerCapture?.(e.pointerId);
    canvas.style.cursor = "crosshair";
    invalidate();
  });

  canvas.addEventListener("pointerleave", () => { hoverWire = false; if (!draggingWire) canvas.style.cursor = "crosshair"; invalidate(); });

  // wheel: adjust loop radius (even if not drawing it)


  // toggle current direction on right-click (over wire)
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    if (hitWireClient(cx, cy)) { I = -I; invalidate(); }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "[" && cols > 10 && rows > 10) { cols = Math.max(10, Math.floor(cols * 0.9)); rows = Math.max(10, Math.floor(rows * 0.9)); invalidate(); }
    if (e.key === "]") { cols = Math.min(60, Math.ceil(cols * 1.1)); rows = Math.min(60, Math.ceil(rows * 1.1)); invalidate(); }
    if (e.key.toLowerCase() === "t") { I = -I; invalidate(); }
  });

  // --- init ---
  document.addEventListener("DOMContentLoaded", () => { resizeCanvas(); invalidate(); });
})();
