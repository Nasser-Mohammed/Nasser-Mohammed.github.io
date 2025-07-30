// Generalized ODE phase space simulation and bifurcation explorer

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';

let ctx2d;
let renderer3d;
let scene3d, camera3d, cube3d;
let phaseCanvas = document.createElement("canvas");
let phaseCtx;
const dt = 0.001;
let frameCount = 0;
let simulationTime = 0;
let animationId = null;
let dimension = 2;
let oneD_system;
let twoD_system;
let threeD_system;
let dimensionSystem;
let height;
let width;
let midHeight;
let midWidth;

let dimensionMap = new Map()

let cachedBackground;

class twoDimensionalSystems {
  constructor() {
    this.choice = "lotka";
    this.timeSteps = 7500;
    this.spaceRes = 35;
    this.trajectories = [];
    this.drawIndices = [];
    this.options = new Map([
      ["lotka", (x, y, t) => this.lotka(x, y, t)],
      ["vanDerPol", (x,y) => this.vanDerPol(x,y)],
      ["fitzHugh_Nagumo", (v,w) => this.fitzHugh_Nagumo(v,w)],
      ["spiral", (x,y) => this.spiral(x,y)],
      ["saddle_node", (x,y) => this.saddle_node(x,y)],
      ["brusselator", (x,y) => this.brusselator(x,y)],
      ["damped_pendulum", (theta, omega, phi) => this.damped_pendulum(theta, omega, phi)],
      ["rayleigh", (x,y) => this.rayleigh(x,y)],
      ["hopf_normal", (x,y) => this.hopf_normal(x,y)],
      ["morris_lecar", (V, w) => this.morris_lecar(V, w)],
      ["oregonator", (x,y) => this.oregonator(x,y)],
      ["relay", (x,y) => this.relay(x,y)]
    ]);
  }

  getCanvasCoords(x, y) {
    if (this.choice === "lotka") {
      const xMin = 0.1, xMax = 8;
      const yMin = 0.1, yMax = 8;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }

    else if (this.choice === "vanDerPol") {
      const xMin = -6, xMax = 6;
      const yMin = -4, yMax = 4;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }
    else if (this.choice === "fitzHugh_Nagumo") {
      const xMin = -4, xMax = 4;
      const yMin = -3, yMax = 3;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }
    else if (this.choice === "spiral"){
      const xMin = -4, xMax = 4;
      const yMin = -3, yMax = 3;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }
    else if (this.choice === "saddle_node"){
      const xMin = -13, xMax = 13;
      const yMin = -10, yMax = 10;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }
    else if (this.choice === "brusselator"){
      const xMin = -11, xMax = 11;
      const yMin = -8, yMax = 8;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }
    else if (this.choice === "damped_pendulum") {
      const xMin = -Math.PI, xMax = Math.PI;
      const yMin = -4, yMax = 4;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }
    else if (this.choice === "rayleigh") {
      const xMin = -6, xMax = 6;
      const yMin = -4, yMax = 4;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }
    else if (this.choice === "hopf_normal") {
      const xMin = -6, xMax = 6;
      const yMin = -4, yMax = 4;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }
    else if (this.choice === "morris_lecar") {
      const xMin = -300, xMax = 300;
      const yMin = -285, yMax = 285;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }
    else if (this.choice === "oregonator") {
      const xMin = -6, xMax = 6;
      const yMin = -4, yMax = 4;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }
    else if (this.choice === "relay") {
      const xMin = -6, xMax = 6;
      const yMin = -4, yMax = 4;
      const scaleX = width / (xMax - xMin);
      const scaleY = height / (yMax - yMin);
      const canvasX = (x - xMin) * scaleX;
      const canvasY = height - (y - yMin) * scaleY;
      return [canvasX, canvasY];
    }

  }


  initializePhasePlane() {
    this.trajectories = [];

    let xMin;
    let xMax;
    let yMin;
    let yMax;
    if(this.choice == "lotka"){
      xMin = 0.1;
      xMax = 8;
      yMin = 0.1;
      yMax = 8;
    }
    else{
      xMin = -12;
      xMax = 12;
      yMin = -10; 
      yMax = 10;
    }
    const cols = 20;
    const rows = 20;
    const dx = (xMax - xMin) / cols;
    const dy = (yMax - yMin) / rows;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = xMin + i * dx;
        let y = yMin + j * dy;
        let phi = 0;

        const path = [];
        for (let step = 0; step < this.timeSteps; step++) {
          path.push([x, y]);
          if (this.choice === "damped_pendulum") {
            [x, y, phi] = this.eulerStep(x, y, step * dt, phi);
          } else {
            [x, y] = this.eulerStep(x, y, step * dt);
          }
          if (!isFinite(x) || !isFinite(y)) break;
        }

        this.trajectories.push(path);
      }
    }

    phaseCtx.clearRect(0, 0, phaseCtx.canvas.width, phaseCtx.canvas.height);
    phaseCtx.fillStyle = "black";
    phaseCtx.fillRect(0, 0, phaseCtx.canvas.width, phaseCtx.canvas.height);
    ctx2d.drawImage(phaseCanvas, 0, 0);
  }

  lotka(x, y, t) {
    const alpha = 2;
    const beta = 1;
    const gamma = 1;
    const delta = 0.5;
    const dx = alpha * x - beta * x * y;
    const dy = -gamma * y + delta * x * y;
    return [dx, dy];
  }

  vanDerPol(x,y, t){
    const mu = .5;
    const dx = y;
    const dy = mu*(1-x**2)*y-x;
    return [dx, dy];
  }
  fitzHugh_Nagumo(v,w, t){
    const I = 0.5;
    const R = 0.1
    const a = 0.7;
    const b = .8;
    const epsilon = 0.8;
    return [v-(v**3)/3 - w + R*I, epsilon*(v + a - b*w)]
  }

  spiral(x,y,t){
    return [(x-y-x*(x**2+y**2)), (x+y-y*(x**2+y**2))]
  }

  saddle_node(x,y, t){
    const mu = 0.5;
    return [y, x**2-mu]
  }

  brusselator(x,y, t){
    const A = 1;
    const B = 3;
    return [A-(B+1)*x+x**2*y, B*x-x**2*y]
  }
  
  damped_pendulum(theta, omega, phi) {
    const A = 1.2;
    const gamma = 0.25;
    const omega_d = 1.0;

    const dtheta = omega;
    const domega = -gamma * omega - Math.sin(theta) + A * Math.cos(phi);
    const dphi = omega_d;

    return [dtheta, domega, dphi];
  }

  rayleigh(x,y, t){
    const mu = .1;

    return [y, mu*(1-y**2)*y-x]
  }

  hopf_normal(x,y,t){
    const mu = 10;

    return [mu*x-y-x*(x**2+y**2), x+mu*y-y*(x**2+y**2)]
  }

  morris_lecar(V, w, t){
    const C = 20;
    const gca = 4.4;
    const gk = 8;
    const gl = 2;
    const Vca = 120;
    const Vk = -84;
    const Vl = -60;
    const V1 = -1.2;
    const V2 = 18;
    const V3 = 12;
    const V4 = 17.4
    const phi = 0.04;
    const I = 95;
    const mV = (1/2)*(1+Math.tanh((V-V1)/V2));
    const wV = (1/2)*(1+Math.tanh((V-V3)/V4));
    const tauV = 1/(Math.cosh((V-V3)/2*V4));
    const dV = I - gca*mV*(V-Vca)-gk*w*(V-Vk)-gl*(V-Vl);
    const dw = phi*(wV-w)/tauV;
    return [dV, dw] 
  }

  oregonator(x,y, t){
    const q = 0.002;
    const f = 1.2;
    const s = 77.27;

    return [s*(q*y-x*y+x*(1-x)), (1/s)*(-q*y-x*y+f)]
  }

  relay(x,y,t){
    let dy;
    if(x > 0){
      dy = -2*x+5;
    }
    else{
      dy = -2*x-5;
    }

    return [y, dy]
  }



  eulerStep(x, y, t = -1, phi = 0) {
  const fn = this.options.get(this.choice);
  
  if (this.choice === "damped_pendulum") {
    const [dx, dy, dphi] = fn(x, y, phi);
    const newX = x + dx * dt;
    const newY = y + dy * dt;
    const newPhi = phi + dphi * dt;
    return [newX, newY, newPhi];
  } else {
    const [dx, dy] = fn(x, y, t);
    const newX = x + dx * dt;
    const newY = y + dy * dt;
    return [newX, newY];
  }
}

}



class threeDimensionalSystems{
  constructor(){
    this.choice = "lorenz";
    this.options = new Map([
      ["lorenz", (t) => this.lorenz(t)]
    ]);
  }

  lorenz(t){
    console.log("just lorenzed everywhere");
  }

}


//function draws phase plane or 1d system with t
function draw2dSystem(){
  ctx2d.drawImage(phaseCanvas, 0, 0);

}

function draw3dSystem(){

}

let firstFrame;

function animate() {
  animationId = requestAnimationFrame(animate);
  if (frameCount++ % 1 !== 0) return;
  simulationTime += dt;

  if (dimension === 2) {
    ctx2d.putImageData(cachedBackground, 0, 0);
    ctx2d.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx2d.fillRect(0, 0, width, height);

    const scaleX = width / (8 - 0.1);
    const scaleY = height / (8 - 0.1);
    const windowSize = 600; // <-- slightly longer sliding window

    for (let i = 0; i < twoD_system.trajectories.length; i++) {
      const path = twoD_system.trajectories[i];
      const tLen = path.length;
      
      const start = (frameCount * 2) % tLen;
      const end = (start + windowSize);

      const hue = (i / twoD_system.trajectories.length) * 360;
      ctx2d.strokeStyle = `hsl(${hue}, 100%, 70%)`;
      ctx2d.lineWidth = 2;

      ctx2d.beginPath();

      // First segment (from start to end or tLen)
      for (let j = start; j < Math.min(end, tLen); j++) {
        const [x, y] = path[j];
        const [canvasX, canvasY] = twoD_system.getCanvasCoords(x, y);
        if (j === start) ctx2d.moveTo(canvasX, canvasY);
        else ctx2d.lineTo(canvasX, canvasY);
      }
      ctx2d.stroke();

      // If wrapping is needed, draw second segment (0 to remaining)
      if (end > tLen) {
        ctx2d.beginPath();
        for (let j = 0; j < end - tLen; j++) {
          const [x, y] = path[j];
          const canvasX = (x - 0.1) * scaleX;
          const canvasY = height - (y - 0.1) * scaleY;
          if (j === 0) ctx2d.moveTo(canvasX, canvasY);
          else ctx2d.lineTo(canvasX, canvasY);
        }
        ctx2d.stroke();
      }

    }
  }
}


function handleSystemOptions(){
  const twoD = document.getElementById("twoD-container");
  const threeD = document.getElementById("threeD-container");
  if(dimension === 2){
    //make 2d options visible, 3d invisible
    twoD.style.display = "block";
    threeD.style.display = "none";
  }
  else{
    //3d options
    twoD.style.display = "none";
    threeD.style.display = "block";
  }
}






document.addEventListener("DOMContentLoaded", () => {
  const canvas2d = document.getElementById("canvas2d");
  const canvas3d = document.getElementById("canvas3d");

  // Contexts
  ctx2d = canvas2d.getContext("2d", { willReadFrequently: true });
  height = canvas2d.height;
  width = canvas2d.width;
  midHeight = Math.floor(height/2);
  midWidth = Math.floor(width/2);
  ctx2d.fillStyle = "black";
  ctx2d.fillRect(0, 0, width, height);
  phaseCanvas.height = height;
  phaseCanvas.width = width;
  phaseCtx = phaseCanvas.getContext("2d");

  // Initialize 3D scene
  scene3d = new THREE.Scene();
                                      /*fov*/ /*aspect ratio*/ //how close to clip and how far to clip
  camera3d = new THREE.PerspectiveCamera(75 , width / height, 0.1, 1000);
  camera3d.position.z = 5;

  renderer3d = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
  renderer3d.setSize(width, height);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshNormalMaterial();
  cube3d = new THREE.Mesh(geometry, material);
  scene3d.add(cube3d);

  // Set initial visibility
  canvas2d.style.display = "block";
  canvas3d.style.display = "none";

  // System classes
  twoD_system = new twoDimensionalSystems();
  threeD_system = new threeDimensionalSystems();
  dimensionMap.set(2, twoD_system);
  dimensionMap.set(3, threeD_system);
  dimensionSystem = dimensionMap.get(dimension);
  dimensionSystem.initializePhasePlane();

  // Only cache background if we are in 2D initially (we are not)
  if (dimension === 2) {
    cachedBackground = ctx2d.getImageData(0, 0, width, height);
  } else {
    cachedBackground = null;
  }

  cachedBackground = ctx2d.getImageData(0, 0, width, height);
  firstFrame = true;
  animate(); // Start animation for 1D

  // Dropdown handler
  const dimensionSelect = document.getElementById("dimension-select");
  dimensionSelect.addEventListener("change", (e) => {
    dimension = parseInt(e.target.value);
    dimensionSystem = dimensionMap.get(dimension);
    console.log("changed to dimension", dimension);
    handleSystemOptions();

    if (dimension === 3) {
      canvas2d.style.display = "none";
      canvas3d.style.display = "block";
    } else {
      canvas2d.style.display = "block";
      canvas3d.style.display = "none";

      dimensionSystem.initializePhasePlane();
      cachedBackground = ctx2d.getImageData(0, 0, width, height);
      frameCount = 0;
      firstFrame = true;
      animate();

    }

  });

    document.getElementById("system-select-2d").addEventListener("change", (e) => {
    const selected = e.target.value;
    twoD_system.choice = selected;
    twoD_system.initializePhasePlane();
    cachedBackground = ctx2d.getImageData(0, 0, width, height);
    console.log("changed to the ", selected, " system");
    firstFrame = true;
    frameCount = 0;
  });

  document.getElementById("system-select-3d").addEventListener("change", (e) => {
    const selected = e.target.value;
    threeD_system.choice = selected;
    console.log("3D system changed to", selected);
    // TODO: later initialize the 3D visualizer here
  });



    document.getElementById("reset-btn").addEventListener("click", () => {

      // Clear canvas
      ctx2d.clearRect(0, 0, width, height);
      ctx2d.fillStyle = "black";
      ctx2d.fillRect(0, 0, width, height);

      // Redraw background field
      dimensionSystem.initializePhasePlane();
      cachedBackground = ctx2d.getImageData(0, 0, width, height);
      firstFrame = true;
      frameCount = 0;
    });



  //animate();
});

