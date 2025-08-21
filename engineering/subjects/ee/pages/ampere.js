(() => {
  const canvas = document.getElementById("ampere-canvas");
  const ctx = canvas.getContext("2d");

  // ----- canvas sizing / DPR -----
  let width = 0, height = 0;
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.round(rect.width  * dpr);
    canvas.height = Math.round(rect.height * dpr);
    width = rect.width;
    height = rect.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS px
  }

  // ----- world box (like E-field sims) -----
  const xMin = -15, xMax = 15;
  const yMin = -15, yMax = 15;
  const xRange = xMax - xMin, yRange = yMax - yMin;

  const toCanvas = (x, y) => ({
    cx: (x - xMin) / xRange * width,
    cy: height - (y - yMin) / yRange * height
  });
  const toWorld = (cx, cy) => ({
    x: xMin + (cx / width) * xRange,
    y: yMin + ((height - cy) / height) * yRange
  });
  const pxToWorld = () => {
    const sx = xRange / width, sy = yRange / height;
    return (sx + sy) * 0.5;
  };

  // ----- simulation state -----
  // wire at (wx, wy); current I (sign = direction: + out of page ⨀, − into page ⨂)
  let wx = 0, wy = 0;
  let I = +6;               // arbitrary units; sign sets direction
  const mu0 = 1;            // visual scale (keep 1 so arrows look reasonable)
  let cols = 28, rows = 28; // arrow density
  const arrowGain = 140;    // scales vector length in pixels
  const chargeRadius = 18;  // visual radius for the wire handle (px)

  // amperian loop (center + radius in world units)
  let loop = { x: 5, y: 0, r: 5 };

  // interaction flags
  let draggingWire = false;
  let draggingLoop = false;
  let hoverWire = false;
  let hoverLoop = false;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // ----- field from an infinite straight wire perpendicular to page -----
  // Magnitude: |B| = mu0 * |I| / (2π r)
  // Direction: tangent to circle around (wx, wy); right-hand rule sets orientation
  function B_at(x, y) {
    const dx = x - wx, dy = y - wy;
    const r2 = dx*dx + dy*dy;
    const r = Math.sqrt(Math.max(r2, 1e-9));
    const mag = (mu0 * Math.abs(I)) / (2 * Math.PI * r); // |B|
    // tangent unit vector: rotate radial (dx,dy) by +90° => (-dy, dx) / r
    let tx = -dy / r, ty = dx / r;
    // orientation: I>0 (out of page ⨀) ⇒ tangent ( -dy, +dx ); I<0 ⇒ reverse
    const sign = I >= 0 ? 1 : -1;
    return { Bx: sign * mag * tx, By: sign * mag * ty };
  }

  // ----- draw helpers -----
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

  function drawWireHandle() {
    const { cx, cy } = toCanvas(wx, wy);
    // fill: current direction color (out=blue, in=red)
    ctx.fillStyle = I >= 0 ? "#1e3a8a" : "#b91c1c";
    ctx.beginPath();
    ctx.arc(cx, cy, chargeRadius, 0, Math.PI * 2);
    ctx.fill();

    // symbol ⨀ (out) or ⨂ (in)
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${chargeRadius * 1.2}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(I >= 0 ? "⨀" : "⨂", cx, cy);

    if (hoverWire && !draggingWire) {
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, chargeRadius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawLoop() {
    const { cx, cy } = toCanvas(loop.x, loop.y);
    const rPx = loop.r * (width / xRange); // approximate using x scale
    ctx.strokeStyle = "#1e3a8a"; 
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
    ctx.stroke();
  }


  function insideLoop() {
    // Is the wire position inside the Amperian loop? (centered circle)
    const dx = wx - loop.x, dy = wy - loop.y;
    return Math.hypot(dx, dy) <= loop.r;
    // Ampère’s law (for ideal infinite wire): ∮B·dl = μ0 * I_enc
  }

  // ----- main render -----
  function render() {
    // background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fdf8ecff";
    ctx.fillRect(0, 0, width, height);

    // vector field
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "#1b3a7a";
    const dxw = xRange / cols, dyw = yRange / rows;
    const pxPerX = width / xRange, pxPerY = height / yRange;

    for (let i = 0; i < cols; i++) {
      const x = xMin + (i + 0.5) * dxw;
      for (let j = 0; j < rows; j++) {
        const y = yMin + (j + 0.5) * dyw;
        const { Bx, By } = B_at(x, y);
        const { cx, cy } = toCanvas(x, y);
        const vx =  Bx * pxPerX * arrowGain;
        const vy = -By * pxPerY * arrowGain; // canvas y-down
        drawArrow(cx, cy, vx, vy, 16);
      }
    }

    // loop + wire
    //drawLoop();
    drawWireHandle();

    // readout
    const enc = insideLoop();
    const integral = enc ? mu0 * I : 0; // ∮B·dl = μ0 I_enc (0 if not enclosing)
    ctx.fillStyle = "#0f172a";
    ctx.font = "600 20px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`I = ${I.toFixed(1)}  (${I >= 0 ? "out ⨀" : "in ⨂"})`, 10, 10);
    ctx.fillText(`∮B·dl = μ₀ I_enc`, 10, 45);
    //ctx.fillText(`Encloses wire: ${enc ? "yes" : "no"}`, 10, 28);
    //ctx.fillText(`∮B·dl = μ₀ I_enc = ${integral.toFixed(1)}`, 10, 46);
  }

  // ----- loop -----
  let last = 0;
  function animate(t) {
    last = t;
    render();
    requestAnimationFrame(animate);
  }

  // ----- interaction -----
  function hitWireClient(cx, cy) {
    const { cx: wxp, cy: wyp } = toCanvas(wx, wy);
    const hitPx = chargeRadius + 8;
    return Math.hypot(cx - wxp, cy - wyp) <= hitPx;
  }
  function hitLoopClient(cx, cy) {
    const { cx: lcx, cy: lcy } = toCanvas(loop.x, loop.y);
    const rPx = loop.r * (width / xRange);
    return Math.hypot(cx - lcx, cy - lcy) <= rPx + 10; // 10px ring margin
  }

  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;

    if (hitWireClient(cx, cy)) {
      draggingWire = true;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
      return;
    }
    if (hitLoopClient(cx, cy)) {
      draggingLoop = true;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;

    if (!draggingWire && !draggingLoop) {
      hoverWire = hitWireClient(cx, cy);
      hoverLoop = !hoverWire && hitLoopClient(cx, cy);
      canvas.style.cursor = hoverWire || hoverLoop ? "grab" : "crosshair";
      return;
    }

    const p = toWorld(cx, cy);
    const marginX = 1 * (xRange / width);
    const marginY = 1 * (yRange / height);

    if (draggingWire) {
      wx = clamp(p.x, xMin + marginX, xMax - marginX);
      wy = clamp(p.y, yMin + marginY, yMax - marginY);
    } else if (draggingLoop) {
      loop.x = clamp(p.x, xMin + marginX, xMax - marginX);
      loop.y = clamp(p.y, yMin + marginY, yMax - marginY);
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    draggingWire = draggingLoop = false;
    canvas.releasePointerCapture?.(e.pointerId);
    canvas.style.cursor = "crosshair";
  });

  canvas.addEventListener("pointerleave", () => {
    hoverWire = hoverLoop = false;
    if (!draggingWire && !draggingLoop) canvas.style.cursor = "crosshair";
  });

  // wheel: adjust loop radius
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY);
    const step = Math.max(0.3, Math.abs(loop.r) * 0.08);
    loop.r = clamp(loop.r + delta * step, 0.5, Math.min(xRange, yRange) * 0.45);
  }, { passive: false });

  // right-click on wire toggles I sign
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    if (hitWireClient(cx, cy)) I = -I;
  });

  // keyboard: [ / ] change density, T toggles I
  window.addEventListener("keydown", (e) => {
    if (e.key === "[" && cols > 10 && rows > 10) {
      cols = Math.max(10, Math.floor(cols * 0.9));
      rows = Math.max(10, Math.floor(rows * 0.9));
    } else if (e.key === "]") {
      cols = Math.min(60, Math.ceil(cols * 1.1));
      rows = Math.min(60, Math.ceil(rows * 1.1));
    } else if (e.key.toLowerCase() === "t") {
      I = -I;
    }
  });

  // init
  document.addEventListener("DOMContentLoaded", () => {
    resizeCanvas();
    requestAnimationFrame(animate);
    window.addEventListener("resize", () => { resizeCanvas(); render(); });
  });
})();
