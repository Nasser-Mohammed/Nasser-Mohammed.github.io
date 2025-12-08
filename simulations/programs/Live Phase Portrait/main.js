// ==== Phase Portrait "Dust" with Engraved Background (RK4, no wrap/reseed) ====
// - RK4 particles with short fading trails (foreground)
// - Each step "burns" a faint, colored line into a persistent background layer
// - No wrapping: particles can drift off-screen naturally
// - ODE parameters are live-adjustable via window.SIM API
// - Responsive canvas with HiDPI support

// -------------------- Knobs (display) --------------------
let NUM_PARTICLES = 250;
let TRAIL_LEN     = 12;
let PARTICLE_STEP = 0.0035; // user default
let TRAIL_ALPHA   = 0.85;
let TRAIL_FADE    = 0.93;
let BALL_SIZE     = 2.6;
let BURN_ALPHA    = 0.75;   // user default
let MAX_WORLD_STEP = 0.12;
let SHOW_DOTS = true;  // toggle ball (head) visibility


// -------------------- Globals --------------------
let ctx, W, H, dpr;
let bgCanvas, bgCtx; // persistent background layer

// -------------------- ODE Parameter Defaults --------------------
const DEFAULT_PARAMS = {
  lotka:            { alpha: 2.0,  beta: 1.0,  gamma: 1.0,  delta: 0.5 },
  vanDerPol:        { mu: 0.5 },
  fitzHugh_Nagumo:  { I: 0.5, R: 0.1, a: 0.7, b: 0.8, epsilon: 0.8 },
  gray_scott:       { F: 0.037, k: 0.06 },
  my_model:         {
                    g: 10.0, // growth rate
                    m: 4.0, // death rate
                    k1: 12.0, // growth steepness
                    k2: 12.0, // death steepness
                    vc: 0.4, // growth threshold
                    vk: 0.55, // death threshold
                    r: 12.0, // env growth rate
                    gamma: 0.6, // recovery rate
                    beta: 6.0 // env loss rate
                    },
  spiral:           { k: 1.0 },
  saddle_node:      { mu: 0.5 },
  brusselator:      { A: 1.0, B: 3.0 },
  rayleigh:         { mu: 0.1 },
  hopf_normal:      { mu: 10.0 },
  morris_lecar:     { I: 95.0, phi: 0.04 },
  oregonator:       { q: 0.002, f: 1.2, s: 77.27 },
  relay:            { k: 2.0, b: 5.0 }
};

// === Two–Dimensional Systems (2D only) ===
class TwoDimensionalSystems {
  constructor() {
    this.choice = "lotka";
    this.params = JSON.parse(JSON.stringify(DEFAULT_PARAMS));
  }
  get p(){ return this.params[this.choice]; }

  getWorldBounds() {
    const c = this.choice;
    if (c === "lotka")                   return { xMin:0.1,  xMax:8,    yMin:0.1,  yMax:8 };
    if (c === "vanDerPol")               return { xMin:-6,   xMax:6,    yMin:-4,   yMax:4 };
    if (c === "fitzHugh_Nagumo" || c === "spiral")
                                         return { xMin:-4,   xMax:4,    yMin:-3,   yMax:3 };
    if (c === "gray_scott") return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };         
    if(c === "my_model") return {xMin: 0, xMax: 1, yMin: 0, yMax: 1};                           
    if (c === "saddle_node")             return { xMin:-13,  xMax:13,   yMin:-10,  yMax:10 };
    if (c === "brusselator")             return { xMin:-11,  xMax:11,   yMin:-8,   yMax:8 };
    if (c === "rayleigh" || c === "hopf_normal" || c === "oregonator" || c === "relay")
                                         return { xMin:-6,   xMax:6,    yMin:-4,   yMax:4 };
    if (c === "morris_lecar")            return { xMin:-300, xMax:300,  yMin:-285, yMax:285 };
    return { xMin:-12, xMax:12, yMin:-10, yMax:10 };
  }

  wc(x, y) {
    const {xMin,xMax,yMin,yMax} = this.getWorldBounds();
    const sx = W / (xMax - xMin);
    const sy = H / (yMax - yMin);
    return [ (x - xMin) * sx, H - (y - yMin) * sy ];
  }

  f(x, y) {
    const c = this.choice;
    if (c === "lotka")            return this.lotka(x,y);
    if (c === "vanDerPol")        return this.vanDerPol(x,y);
    if (c === "fitzHugh_Nagumo")  return this.fitzHugh_Nagumo(x,y);
    if (c === "gray_scott")       return this.gray_scott(x, y);
    if (c === "my_model")         return this.my_model(x,y);
    if (c === "spiral")           return this.spiral(x,y);
    if (c === "saddle_node")      return this.saddle_node(x,y);
    if (c === "brusselator")      return this.brusselator(x,y);
    if (c === "rayleigh")         return this.rayleigh(x,y);
    if (c === "hopf_normal")      return this.hopf_normal(x,y);
    if (c === "morris_lecar")     return this.morris_lecar(x,y);
    if (c === "oregonator")       return this.oregonator(x,y);
    if (c === "relay")            return this.relay(x,y);
    return [0,0];
  }

  // Systems using live params
  lotka(x, y){ const {alpha,beta,gamma,delta}=this.p; return [alpha*x - beta*x*y, -gamma*y + delta*x*y]; }
  vanDerPol(x, y){ const {mu}=this.p; return [y, mu*(1 - x*x)*y - x]; }
  fitzHugh_Nagumo(v, w){
    const {I,R,a,b,epsilon}=this.p;
    return [v - (v*v*v)/3 - w + R*I, epsilon*(v + a - b*w)];
  }
  gray_scott(u, v) {
  const { F, k } = this.p;
  const du = F * (1 - u) - u * v * v;
  const dv = u * v * v - (F + k) * v;
  return [du, dv];
}

  my_model(x, y) {
  const p = this.p;
  const G1 = 1 / (1 + Math.exp(-p.k1 * (y - p.vc)));
  const G2 = 1 / (1 + Math.exp(-p.k2 * (p.vk - y)));

  const dx = p.g * x * (1 - x) * G1 - p.m * x * G2;
  const dy = p.r * y * (1 - y) * (y - p.vc) + p.gamma * (1 - y) - p.beta * x * y;

  return [dx, dy];
}

  spiral(x, y){ const {k}=this.p; const r2=x*x+y*y; return [x - y - k*x*r2, x + y - k*y*r2]; }
  saddle_node(x, y){ const {mu}=this.p; return [y, x*x - mu]; }
  brusselator(x, y){ const {A,B}=this.p; return [A - (B+1)*x + x*x*y, B*x - x*x*y]; }
  rayleigh(x, y){ const {mu}=this.p; return [y, mu*(1 - y*y)*y - x]; }
  hopf_normal(x, y){ const {mu}=this.p; const r2=x*x+y*y; return [mu*x - y - x*r2, x + mu*y - y*r2]; }
  morris_lecar(V, w){
    const C=20,gca=4.4,gk=8,gl=2, Vca=120,Vk=-84,Vl=-60, V1=-1.2,V2=18,V3=12,V4=17.4;
    const {I,phi}=this.p;
    const mV=0.5*(1+Math.tanh((V-V1)/V2));
    const wV=0.5*(1+Math.tanh((V-V3)/V4));
    const tau=1/Math.cosh((V-V3)/(2*V4));
    const dV=I - gca*mV*(V-Vca) - gk*w*(V-Vk) - gl*(V-Vl);
    const dw=phi*(wV - w)/tau;
    return [dV, dw];
  }
  oregonator(x, y){ const {q,f,s}=this.p; return [s*(q*y - x*y + x*(1 - x)), (1/s)*(-q*y - x*y + f)]; }
  relay(x, y){ const {k,b}=this.p; const dy = (x>0)? (-k*x + b) : (-k*x - b); return [y, dy]; }

  // RK4 step
  rk4(x, y, h){
    const f1=this.f(x,y);
    const f2=this.f(x+0.5*h*f1[0], y+0.5*h*f1[1]);
    const f3=this.f(x+0.5*h*f2[0], y+0.5*h*f2[1]);
    const f4=this.f(x+h*f3[0],     y+h*f3[1]);
    const nx=x+(h/6)*(f1[0]+2*f2[0]+2*f3[0]+f4[0]);
    const ny=y+(h/6)*(f1[1]+2*f2[1]+2*f3[1]+f4[1]);
    return [nx, ny];
  }

  setChoice(name){ this.choice = name; }
  setParams(partial){ Object.assign(this.params[this.choice], partial); }
  setSystemParams(name, partial){ Object.assign(this.params[name], partial); }
  getSystemParams(name){ return {...this.params[name]}; }
}

const system = new TwoDimensionalSystems();

// -------------------- Particles --------------------
class Particle {
  constructor(x, y, hue) {
    this.x = x; this.y = y;
    const [cx, cy] = system.wc(x, y);
    this.cx = cx; this.cy = cy;
    this.h = hue;
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
    const hue = (i / Math.max(1, NUM_PARTICLES-1)) * 360;
    particles.push(new Particle(x, y, hue));
  }
}

// Engrave a faint colored segment into the persistent background
const GAP_FRAC = 0.60;
function burnSegment(ox, oy, nx, ny, hue) {
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
    const ox = p.cx, oy = p.cy;

    let [nx, ny] = system.rk4(p.x, p.y, PARTICLE_STEP);

    const dxw = nx - p.x, dyw = ny - p.y;
    const dlen = Math.hypot(dxw, dyw);
    if (dlen > MAX_WORLD_STEP) {
      const s = MAX_WORLD_STEP / dlen;
      nx = p.x + dxw * s;
      ny = p.y + dyw * s;
    }

    p.x = nx; p.y = ny;

    const [cx, cy] = system.wc(p.x, p.y);
    p.cx = cx; p.cy = cy;

    burnSegment(ox, oy, cx, cy, p.h);

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

    // head dot (same hue)
    if (SHOW_DOTS && BALL_SIZE > 0) {
      ctx.fillStyle = `hsl(${p.h}, 90%, 70%)`;
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, BALL_SIZE, 0, Math.PI * 2);
      ctx.fill();
    }

  }
}

// -------------------- Responsive sizing --------------------
function getDPR(){ return Math.min(window.devicePixelRatio || 1, 2); } // cap for memory
function resizeCanvases(){
  const canvas = document.getElementById("canvas2d");
  const overlay = document.getElementById("canvas3d");

  // CSS sizes are controlled by the container; read them
  const rect = canvas.getBoundingClientRect();
  const cssW = Math.max(320, Math.floor(rect.width));
  const cssH = Math.max(320, Math.floor(rect.height));

  dpr = getDPR();
  const pxW = Math.floor(cssW * dpr);
  const pxH = Math.floor(cssH * dpr);

  // Only resize buffers if changed
  if (canvas.width !== pxW || canvas.height !== pxH) {
    canvas.width = pxW;  canvas.height = pxH;
    if (overlay){ overlay.width = pxW; overlay.height = pxH; }
    W = pxW; H = pxH;

    // rebuild background buffer to match
    bgCanvas.width = W; bgCanvas.height = H;
    bgCtx.fillStyle = "black"; bgCtx.fillRect(0,0,W,H);

    // clear main canvas & reseed for new scale
    ctx.fillStyle = "black"; ctx.fillRect(0,0,W,H);
    seedParticles();
  }
}

// simple debounce for resize events
let _rAF = null;
function queueResize(){
  if (_rAF !== null) cancelAnimationFrame(_rAF);
  _rAF = requestAnimationFrame(() => { _rAF = null; resizeCanvases(); });
}

// -------------------- Animation --------------------
function animate(){
  requestAnimationFrame(animate);
  ctx.drawImage(bgCanvas, 0, 0);
  stepParticles();
  drawParticles();
}

// -------------------- Boot --------------------
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas2d");
  ctx = canvas.getContext("2d", { willReadFrequently: true });

  // persistent background layer
  bgCanvas = document.createElement("canvas");
  bgCtx = bgCanvas.getContext("2d", { willReadFrequently: true });

  // Initial sizing based on CSS size of container/canvas
  resizeCanvases();

  // system switch
  const sysSelect = document.getElementById("system-select-2d");
  if (sysSelect){
    sysSelect.addEventListener("change", (e) => {
      system.setChoice(e.target.value);
      // wipe background & reseed
      bgCtx.fillStyle = "black"; bgCtx.fillRect(0,0,W,H);
      ctx.fillStyle = "black";  ctx.fillRect(0,0,W,H);
      seedParticles();
      window.SIM?._onSystemChange?.(e.target.value);
    });
  }

  // Reset button
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn){
    resetBtn.addEventListener("click", () => {
      bgCtx.fillStyle = "black"; bgCtx.fillRect(0,0,W,H);
      ctx.fillStyle = "black";  ctx.fillRect(0,0,W,H);
      seedParticles();
    });
  }

  // Handle window resizes/orientation changes
  window.addEventListener("resize", queueResize);
  window.addEventListener("orientationchange", queueResize);

  animate();
});

// --- expose control API ---
window.SIM = {
  setParams: (p) => {
    if ('NUM_PARTICLES'   in p) { NUM_PARTICLES = p.NUM_PARTICLES; seedParticles(); }
    if ('PARTICLE_STEP'   in p) { PARTICLE_STEP = p.PARTICLE_STEP; }
    if ('BURN_ALPHA'      in p) { BURN_ALPHA = p.BURN_ALPHA; }
    if ('TRAIL_LEN'       in p) {
      TRAIL_LEN = p.TRAIL_LEN;
      for (const part of particles){
        const newBuf = new Float32Array(TRAIL_LEN*2);
        for (let i=0;i<TRAIL_LEN;i++){ newBuf[2*i]=part.cx; newBuf[2*i+1]=part.cy; }
        part.trail = newBuf; part.head = 0;
      }
    }
    if ('TRAIL_ALPHA'     in p) { TRAIL_ALPHA = p.TRAIL_ALPHA; }
    if ('TRAIL_FADE'      in p) { TRAIL_FADE = p.TRAIL_FADE; }
    if ('BALL_SIZE'       in p) { BALL_SIZE = p.BALL_SIZE; }
    if ('MAX_WORLD_STEP'  in p) { MAX_WORLD_STEP = p.MAX_WORLD_STEP; }
  },

  setODEParams:     (partial)      => { system.setParams(partial); },
  setSystemParams:  (name, patch)  => { system.setSystemParams(name, patch); },
  getSystemParams:  (name)         => system.getSystemParams(name),

  setSystem: (name) => {
    system.setChoice(name);
    bgCtx.fillStyle = "black"; bgCtx.fillRect(0,0,W,H);
    ctx.fillStyle   = "black"; ctx.fillRect(0,0,W,H);
    seedParticles();
  },

  clearBackground: () => { bgCtx.fillStyle = "black"; bgCtx.fillRect(0,0,W,H); },
  reseed: () => seedParticles(),
  setDotsVisible: (on) => { SHOW_DOTS = !!on; },
  _onSystemChange: null
};
