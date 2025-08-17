// ==== Phase Portrait "Dust" with Engraved Background (RK4, no wrap/reseed) ====
// - RK4 particles with short fading trails (foreground)
// - Each step "burns" a faint, colored line into a persistent background layer
// - No wrapping: particles can drift off-screen naturally

// -------------------- Knobs --------------------
const NUM_PARTICLES = 150;    // dust count
const TRAIL_LEN     = 12;     // short fading trail per particle
const PARTICLE_STEP = 0.0025;  // RK4 step per frame (smaller = slower)
const TRAIL_ALPHA   = 0.65;   // head opacity of the trail
const TRAIL_FADE    = 0.86;   // per-segment fade along trail (0.8–0.95)
const BALL_SIZE     = 1.8;    // particle dot radius (px)
const BURN_ALPHA    = 0.09;   // opacity of the engraved background strokes
const MAX_WORLD_STEP = 0.12;  // safety clamp for rare large leaps

// -------------------- Globals --------------------
let ctx, W, H;
let bgCanvas, bgCtx; // persistent background layer

// === Two–Dimensional Systems (2D only) ===
class TwoDimensionalSystems {
  constructor() {
    this.choice = "lotka";
    this.options = new Map([
      ["lotka",            (x, y) => this.lotka(x, y)],
      ["vanDerPol",        (x, y) => this.vanDerPol(x, y)],
      ["fitzHugh_Nagumo",  (v, w) => this.fitzHugh_Nagumo(v, w)],
      ["spiral",           (x, y) => this.spiral(x, y)],
      ["saddle_node",      (x, y) => this.saddle_node(x, y)],
      ["brusselator",      (x, y) => this.brusselator(x, y)],
      ["rayleigh",         (x, y) => this.rayleigh(x, y)],
      ["hopf_normal",      (x, y) => this.hopf_normal(x, y)],
      ["morris_lecar",     (V, w) => this.morris_lecar(V, w)],
      ["oregonator",       (x, y) => this.oregonator(x, y)],
      ["relay",            (x, y) => this.relay(x, y)],
    ]);
  }

  getWorldBounds() {
    const c = this.choice;
    if (c === "lotka")                   return { xMin:0.1,  xMax:8,    yMin:0.1,  yMax:8 };
    if (c === "vanDerPol")               return { xMin:-6,   xMax:6,    yMin:-4,   yMax:4 };
    if (c === "fitzHugh_Nagumo" || c === "spiral")
                                         return { xMin:-4,   xMax:4,    yMin:-3,   yMax:3 };
    if (c === "saddle_node")             return { xMin:-13,  xMax:13,   yMin:-10,  yMax:10 };
    if (c === "brusselator")             return { xMin:-11,  xMax:11,   yMin:-8,   yMax:8 };
    if (c === "rayleigh" || c === "hopf_normal" || c === "oregonator" || c === "relay")
                                         return { xMin:-6,   xMax:6,    yMin:-4,   yMax:4 };
    if (c === "morris_lecar")            return { xMin:-300, xMax:300,  yMin:-285, yMax:285 };
    return { xMin:-12, xMax:12, yMin:-10, yMax:10 };
  }

  // world -> canvas
  wc(x, y) {
    const {xMin,xMax,yMin,yMax} = this.getWorldBounds();
    const sx = W / (xMax - xMin);
    const sy = H / (yMax - yMin);
    return [ (x - xMin) * sx, H - (y - yMin) * sy ];
  }

  // vector field
  f(x, y) {
    return this.options.get(this.choice)(x, y);
  }

  // ----- systems -----
  lotka(x, y) { const a=2,b=1,g=1,d=0.5; return [a*x - b*x*y, -g*y + d*x*y]; }
  vanDerPol(x, y) { const mu=0.5; return [y, mu*(1 - x*x)*y - x]; }
  fitzHugh_Nagumo(v, w) {
    const I=0.5,R=0.1,a=0.7,b=0.8,eps=0.8;
    return [v - (v*v*v)/3 - w + R*I, eps*(v + a - b*w)];
  }
  spiral(x, y) { const r2=x*x+y*y; return [x - y - x*r2, x + y - y*r2]; }
  saddle_node(x, y) { const mu=0.5; return [y, x*x - mu]; }
  brusselator(x, y) { const A=1,B=3; return [A-(B+1)*x + x*x*y, B*x - x*x*y]; }
  rayleigh(x, y) { const mu=0.1; return [y, mu*(1 - y*y)*y - x]; }
  hopf_normal(x, y) { const mu=10, r2=x*x+y*y; return [mu*x - y - x*r2, x + mu*y - y*r2]; }
  morris_lecar(V, w) {
    const C=20,gca=4.4,gk=8,gl=2, Vca=120,Vk=-84,Vl=-60,
          V1=-1.2,V2=18,V3=12,V4=17.4, phi=0.04,I=95;
    const mV=0.5*(1+Math.tanh((V-V1)/V2));
    const wV=0.5*(1+Math.tanh((V-V3)/V4));
    const tau=1/Math.cosh((V-V3)/(2*V4));
    const dV=I - gca*mV*(V-Vca) - gk*w*(V-Vk) - gl*(V-Vl);
    const dw=phi*(wV - w)/tau;
    return [dV, dw];
  }
  oregonator(x, y) { const q=0.002,f=1.2,s=77.27; return [s*(q*y - x*y + x*(1-x)), (1/s)*(-q*y - x*y + f)]; }
  relay(x, y) { const dy = (x>0)? -2*x+5 : -2*x-5; return [y, dy]; }

  // RK4 step for 2D
  rk4(x, y, h) {
    const f1 = this.f(x, y);
    const f2 = this.f(x + 0.5*h*f1[0], y + 0.5*h*f1[1]);
    const f3 = this.f(x + 0.5*h*f2[0], y + 0.5*h*f2[1]);
    const f4 = this.f(x + h*f3[0],     y + h*f3[1]);
    const nx = x + (h/6)*(f1[0] + 2*f2[0] + 2*f3[0] + f4[0]);
    const ny = y + (h/6)*(f1[1] + 2*f2[1] + 2*f3[1] + f4[1]);
    return [nx, ny];
  }
}

const system = new TwoDimensionalSystems();

// -------------------- Particles --------------------
class Particle {
  constructor(x, y, hue) {
    this.x = x; this.y = y; // world
    const [cx, cy] = system.wc(x, y);
    this.cx = cx; this.cy = cy; // canvas
    this.h = hue;              // color hue
    this.trail = new Float32Array(TRAIL_LEN * 2);
    for (let i=0;i<TRAIL_LEN;i++){ this.trail[2*i]=cx; this.trail[2*i+1]=cy; }
    this.head = 0;
  }
}
let particles = [];

function seedParticles() {
  particles.length = 0;
  const {xMin,xMax,yMin,yMax} = system.getWorldBounds();
  const cols = Math.floor(Math.sqrt(NUM_PARTICLES));
  const rows = Math.ceil(NUM_PARTICLES / Math.max(1, cols));
  for (let i=0;i<NUM_PARTICLES;i++){
    const c = i % cols, r = Math.floor(i/cols);
    const rx = (c + 0.25 + 0.5*Math.random()) / Math.max(1, cols-1);
    const ry = (r + 0.25 + 0.5*Math.random()) / Math.max(1, rows-1);
    const x = xMin + rx*(xMax-xMin);
    const y = yMin + ry*(yMax-yMin);
    const hue = (i / NUM_PARTICLES) * 360; // evenly cycle hues
    particles.push(new Particle(x, y, hue));
  }
}

// Engrave a faint colored segment into the persistent background
const GAP_FRAC = 0.60; // ignore absurd jumps (shouldn't happen w/o wrap)
function burnSegment(ox, oy, nx, ny, hue) {
  // Skip if the segment is too large (likely numerical hiccup)
  if (Math.abs(nx - ox) > W*GAP_FRAC || Math.abs(ny - oy) > H*GAP_FRAC) return;

  bgCtx.strokeStyle = `hsla(${hue}, 90%, 65%, ${BURN_ALPHA})`;
  bgCtx.beginPath();
  bgCtx.moveTo(ox, oy);
  bgCtx.lineTo(nx, ny);
  bgCtx.stroke();
}

function stepParticles() {
  for (let i=0;i<particles.length;i++){
    const p = particles[i];

    // previous canvas pos for engraving
    const ox = p.cx, oy = p.cy;

    // propose next world position via RK4
    let [nx, ny] = system.rk4(p.x, p.y, PARTICLE_STEP);

    // optional: clamp very large steps before accepting
    const dxw = nx - p.x, dyw = ny - p.y;
    const dlen = Math.hypot(dxw, dyw);
    if (dlen > MAX_WORLD_STEP) {
      const s = MAX_WORLD_STEP / dlen;
      nx = p.x + dxw * s;
      ny = p.y + dyw * s;
    }

    // accept new position (even if off-screen/world)
    p.x = nx; p.y = ny;

    // project to canvas
    const [cx, cy] = system.wc(p.x, p.y);
    p.cx = cx; p.cy = cy;

    // engrave this small step into the background
    burnSegment(ox, oy, cx, cy, p.h);

    // update fading trail
    p.head = (p.head + 1) % TRAIL_LEN;
    p.trail[2*p.head]   = cx;
    p.trail[2*p.head+1] = cy;
  }
}

function drawParticles() {
  ctx.lineJoin = "round";
  ctx.lineCap  = "round";
  ctx.lineWidth = 1.4;

  for (let i=0;i<particles.length;i++){
    const p = particles[i];

    // colored fading trail
    ctx.beginPath();
    let a = TRAIL_ALPHA;
    for (let k=0;k<TRAIL_LEN;k++){
      const j = (p.head - k + TRAIL_LEN) % TRAIL_LEN;
      const x = p.trail[2*j], y = p.trail[2*j+1];
      ctx.strokeStyle = `hsla(${p.h}, 90%, 65%, ${a})`;
      if (k === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      a *= TRAIL_FADE;
    }
    ctx.stroke();

    // head dot (same hue, full opacity)
    ctx.fillStyle = `hsl(${p.h}, 90%, 70%)`;
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, BALL_SIZE, 0, Math.PI*2);
    ctx.fill();
  }
}

// -------------------- Animation --------------------
function animate(){
  requestAnimationFrame(animate);

  // 1) draw the persistent background history
  ctx.drawImage(bgCanvas, 0, 0);

  // 2) advance particles & engrave their infinitesimal steps
  stepParticles();

  // 3) draw current fading trails / heads on top
  drawParticles();
}

// -------------------- Boot --------------------
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas2d");
  ctx = canvas.getContext("2d", { willReadFrequently: true });
  W = canvas.width; H = canvas.height;

  // persistent background layer (accumulates engraved lines)
  bgCanvas = document.createElement("canvas");
  bgCanvas.width = W; bgCanvas.height = H;
  bgCtx = bgCanvas.getContext("2d");
  bgCtx.fillStyle = "black";
  bgCtx.fillRect(0,0,W,H);
  bgCtx.lineWidth = 1.2;
  bgCtx.lineJoin = "round";
  bgCtx.lineCap  = "round";

  // clear main canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,W,H);

  // seed particles
  seedParticles();

  // system switch (if you have a <select>)
  const sysSelect = document.getElementById("system-select-2d");
  if (sysSelect){
    sysSelect.addEventListener("change", (e) => {
      system.choice = e.target.value;
      // wipe background history for new system
      bgCtx.fillStyle = "black";
      bgCtx.fillRect(0,0,W,H);
      // clear main canvas and reseed for new bounds
      ctx.fillStyle = "black";
      ctx.fillRect(0,0,W,H);
      seedParticles();
    });
  }

  // reset button (optional)
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn){
    resetBtn.addEventListener("click", () => {
      // wipe background & foreground
      bgCtx.fillStyle = "black";
      bgCtx.fillRect(0,0,W,H);
      ctx.fillStyle = "black";
      ctx.fillRect(0,0,W,H);
      seedParticles();
    });
  }

  animate();
});
