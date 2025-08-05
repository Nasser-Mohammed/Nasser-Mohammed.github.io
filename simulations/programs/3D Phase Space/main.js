
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
//import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/TrackballControls.js';
let renderer3d, scene3d, camera3d;
let ball1;
let ball2;
let ball3;
let ball4;
let ball5;
let ball6;
const dt = 0.0005;
let frameCount = 0;
let simulationTime = 0;
let stepsPerFrame = 25;
const defaultSteps = stepsPerFrame;
let animationId = null;
let controls; 
const maxTrailPoints = 7500;
const trailPositions1 = [];
const trailPositions2 = [];
const numSteps = 1;

let running = true;

let showXZ = true;
let showXY = false;
let showYZ = true;

let spheresVisible = true;

const palettes = {
  r: ["#ff2200", "#cf7916", "#af6238", "#ffef5f", "#ff0000", "#fda32d"],       // reddish/orange/yellow
  bg: ["#0057FF", "#009933", "#5638ff", "#00ad0e", "#008cff", "#73ff00"],      // strong blue, strong green, strong purple
  rgb: ["#8f0000", "#009723", "#0077FF", "#0094d8", "#9c0000", "#5eff1f"],     // red, brighter green, pure blue
  alien: ["#7D3C98", "#E75480", "#1ABC9C", "#B39CD0", "#D81B60","#2978B5"],
  cyberpunk: ["#FF00FF", "#00FFFF", "#FF6C00", "#FF0055", "#00FF99", "#3300FF"],
  sunset: ["#FF6F61", "#F7B733", "#FF9472", "#FF3E41", "#FFC857", "#5D576B"],
  electric: ["#B0E0E6", "#FFB6C1", "#FFD700", "#9370DB", "#40E0D0", "#FF69B4"],
  contrast: ["#D72631", "#F46036", "#2E294E", "#1B998B", "#E2C044", "#F2F4F3"],
  forest: ["#014D4D", "#028090", "#00A896", "#fbffab", "#E94F37", "#53354A"],
  reyna: ["#a15fa3", "#8a50c0", "#80324c", "#ffa4a4", "#381c5e", "#491d3c"],
  lavender: ["#5C2E7F", "#2C0B42", "#D3B1FC", "#473473", "#7A5A8C", "#B7A0E8"],
  pinky: ["#52083C", "#9C437A", "#FCB1E9", "#E0C8DC", "#9E2973", "#F7D0EF"],
  kodie: ["#070D4D", "#264491", "#636FC9", "#B4BCE0", "#250DBF", "#D0DAF7"]
};

let initColors = palettes.r;

let allGridsVisible = true;


const trailGeometry1 = new THREE.BufferGeometry();
const trailMaterial1 = new THREE.LineBasicMaterial({ color: initColors[0]});
const trailLine1 = new THREE.Line(trailGeometry1, trailMaterial1);

const trailGeometry2 = new THREE.BufferGeometry();
const trailMaterial2 = new THREE.LineBasicMaterial({ color: initColors[1]});
const trailLine2 = new THREE.Line(trailGeometry2, trailMaterial2);



let trailSkip = 0; //update every third point on trail

const trailGeometry3 = new THREE.BufferGeometry();
const trailMaterial3 = new THREE.LineBasicMaterial({ color: initColors[2] }); // Blue
const trailLine3 = new THREE.Line(trailGeometry3, trailMaterial3);

const trailGeometry4 = new THREE.BufferGeometry();
const trailMaterial4 = new THREE.LineBasicMaterial({ color: initColors[3] }); // Blue
const trailLine4 = new THREE.Line(trailGeometry4, trailMaterial4);

const trailGeometry5 = new THREE.BufferGeometry();
const trailMaterial5 = new THREE.LineBasicMaterial({ color: initColors[4] }); // Blue
const trailLine5 = new THREE.Line(trailGeometry5, trailMaterial5);

const trailGeometry6 = new THREE.BufferGeometry();
const trailMaterial6 = new THREE.LineBasicMaterial({ color: initColors[5] }); // Blue
const trailLine6 = new THREE.Line(trailGeometry6, trailMaterial6);

const trailPositions3 = [];
const trailPositions4 = [];
const trailPositions5 = [];
const trailPositions6 = [];

let x1 = 1, y1 = 1, z1 = 1;  // Initial Lorenz coordinates (must be non-zero)
let x2 = 2, y2 = 3, z2 = 4; // Initial coordinates for second ball
let x3 = 2.5, y3 = 2, z3 = 3; // Initial coordinates for third ball
let x4 = 1.5, y4 = 0.5, z4 = 2;
let x5 = 0.5, y5 = 0.9, z5 = 1.25;
let x6 = 5, y6 = 5, z6 = 2;


const nameMap = new Map();
nameMap.set("lorenz", "Lorenz System");
nameMap.set("rossler", "Rössler System");
nameMap.set("fitzhughNagumo", "FitzHugh-Nagumo Model");
nameMap.set("chua", "Chua's Circuit");
nameMap.set("aizawa", "Aizawa Attractor");
nameMap.set("halvorsen", "Halvorsen System");
nameMap.set("chen", "Chen System");
nameMap.set("thomas", "Thomas System");
nameMap.set("sprout", "Sprout System");
nameMap.set("dadras", "Dadras System");
nameMap.set("lu", "Lü Attractor");
nameMap.set("chen", "Chen Attractor");


const equationMap = new Map();
equationMap.set("lorenz", "\\[\\begin{align*} \\frac{dx}{dt} &= \\sigma(y - x) \\\\ \\\\ \\frac{dy}{dt} &= x(\\rho - z) - y \\\\ \\\\ \\frac{dz}{dt} &= xy - \\beta z \\end{align*}\\]");
equationMap.set("rossler", "\\[\\begin{align*} \\frac{dx}{dt} &= -y - z \\\\ \\\\ \\frac{dy}{dt} &= x + ay \\\\ \\\\ \\frac{dz}{dt} &= b + z(x - c) \\end{align*}\\]");
equationMap.set("halvorsen", "\\[\\begin{align*} \\frac{dx}{dt} &=  -ax - 4y -4z - y^2 \\\\ \\\\ \\frac{dy}{dt} &= -ay -4z-4x-z^2 \\\\ \\\\ \\frac{dz}{dt} &= -az-4x-4y-x^2 \\end{align*}\\]");
equationMap.set("thomas", "\\[\\begin{align*} \\frac{dx}{dt} &= \\sin(y) - bx \\\\ \\\\ \\frac{dy}{dt} &= \\sin(z) - by  \\\\ \\\\ \\frac{dz}{dt} &= \\sin(x) - bz \\end{align*}\\]");
equationMap.set("fitzhughNagumo", "\\[\\begin{align*} \\frac{dv}{dt} &= v - \\frac{v^3}{3} - w + z + I \\\\ \\\\ \\frac{dw}{dt} &= \\mu_1(v+a-bw) \\\\ \\\\ \\frac{dz}{dt} &= \\mu_2(c-v) \\end{align*}\\]");
equationMap.set("dadras", "\\[\\begin{align*} \\frac{dx}{dt} &= y-ax\\\\ \\\\ \\frac{dy}{dt} &= cx - xz + y\\\\ \\\\ \\frac{dz}{dt} &= xy - bz \\end{align*}\\]");
equationMap.set("lu", "\\[\\begin{align*} \\frac{dx}{dt} &= a(y-z)\\\\ \\\\ \\frac{dy}{dt} &= -xz + cy\\\\ \\\\ \\frac{dz}{dt} &= xy - bz \\end{align*}\\]");
equationMap.set("aizawa", "\\[\\begin{align*} \\frac{dx}{dt} &= (z-b)x- yd\\\\ \\\\ \\frac{dy}{dt} &= -xd + (z-b)y\\\\ \\\\ \\frac{dz}{dt} &= c+ax-\\frac{z^3}{3} - (x^2+y^2)(1+ez)+fzx^3 \\end{align*}\\]");
equationMap.set("chen", "\\[\\begin{align*} \\frac{dx}{dt} &= a(y-x)\\\\ \\\\ \\frac{dy}{dt} &= x(c-a) -xz + cy\\\\ \\\\ \\frac{dz}{dt} &= xy -bz \\end{align*}\\]");


const equationParamMap = new Map();
equationParamMap.set("lorenz", ["\\sigma", "\\rho", "\\beta"]);
equationParamMap.set("rossler", ["a", "b", "c"]);
equationParamMap.set("halvorsen", ["a", "b", "c"]);
equationParamMap.set("thomas", ["a", "b", "c"]);
equationParamMap.set("fitzhughNagumo", ["a", "b", "c"]);
equationParamMap.set("dadras", ["a", "b", "c"]);
equationParamMap.set("lu", ["a", "b", "c"]);
equationParamMap.set("aizawa", ["a", "b", "c"]);
equationParamMap.set("chen", ["a", "b", "c"]);

 // smooth camera movement

class ThreeDimensionalSystems {
  constructor() {
    this.choice = "lorenz"; // Default choice
    this.options = new Map([
      ["lorenz", (x, y, z) => this.lorenz(x, y, z)],
      ["rossler", (x, y, z) => this.rossler(x, y, z)],
      ["fitzhughNagumo", (x, y, z) => this.fitzhughNagumo(x, y, z)],
      ["chua", (x, y, z) => this.chua(x, y, z)],
      ["aizawa", (x, y, z) => this.aizawa(x, y, z)],
      ["halvorsen", (x, y, z) => this.halvorsen(x, y, z)],
      ["chen", (x, y, z) => this.chen(x, y, z)],
      ["thomas", (x, y, z) => this.thomas(x, y, z)],
      ["sprout", (x, y, z) => this.sprout(x, y, z)],
      ["dadras", (x, y, z) => this.dadras(x, y, z)],
      ["lu", (x, y, z) => this.lu(x, y, z)],
    ]);

    this.initParams = new Map([
      ["lorenz", [10, 28, 8/3]],
      ["rossler", [0.2, 0.2, 5.7]],
      ["fitzhughNagumo", [0.7, 0.8, -0.5]],
      ["chua", []],
      ["aizawa", [0.95, 0.7, 0.6]],
      ["halvorsen", [1.4, 0, 0]],
      ["chen", [35, 3, 28]],
      ["thomas", [0, 0.18, 0.5]],
      ["sprout", []],
      ["dadras", [2, 0.5, 3]],
      ["lu", [36, 3, 20]]
    ]);

    this.params = new Map([
      ["lorenz", [10, 28, 8/3]],
      ["rossler", [0.2, 0.2, 5.7]],
      ["fitzhughNagumo", [0.7, 0.8, -0.5]],
      ["chua", []],
      ["aizawa", [0.95, 0.7, 0.6]],
      ["halvorsen", [1.4, 0, 0]],
      ["chen", [35, 3, 28]],
      ["thomas", [0, 0.208, .5]],
      ["sprout", []],
      ["dadras", [2, 0.5, 3]],
      ["lu", [36, 3, 20]]
    ]);

    this.paramsRange = new Map([
      ["lorenz", [[8, 20], [23, 80], [2, 3]]],
      ["rossler", [[.1, 0.28], [.1, 1], [3, 9]]],
      ["fitzhughNagumo", [[.1, 1.2], [.1, 1.2], [0.5, 2]]],
      ["chua", []],
      ["aizawa", [[0.8, 1.2], [0.5, 1], [0.4,0.7]]],
      ["halvorsen", [[1.3, 3.5], [0, 0], [0, 0]]],
      ["chen", [[32.5, 40], [2, 4], [20, 29]]],
      ["thomas", [[0, 0], [-2, 2], [-3,5]]],
      ["sprout", []],
      ["dadras", [[1.7, 2.5], [0.25, 1.5], [-0.5, 5]]],
      ["lu", [[25, 60], [0.5, 15], [13, 25]]]
    ]);

    this.renderScale = new Map([
      ["lorenz", 0.05],
      ["rossler", 0.25],
      ["fitzhughNagumo", 0.5],
      ["chua", 0.01],
      ["aizawa", 1.5],
      ["halvorsen", 0.2],
      ["chen", 0.05],
      ["thomas", 1.5],
      ["sprout", 0.01],
      ["dadras", 0.3],
      ["lu", 0.075]
    ]);

    this.initialConditions = new Map([
      ["lorenz", [[1, 1, 1], [2, 3, 4], [2.5,2,3], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
      ["rossler", [[1, 1, 1], [2, 3, 4], [2.5, 2, 3], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
      ["fitzhughNagumo", [[-1, -0.5, 1], [-10, 4, 1], [5, 5, -1]]],
      ["chua", [[0, 0, 0], [0, 0, 0], [0,0,0]]],
      ["aizawa", [[0.5, 1.5, 0], [0.11, 0.01, 0], [0.09, -0.01, 0], [1.5, 0.5, 1.1], [0.5, 0.9, 1.25], [0, 0.9, 0.75]]],
      ["halvorsen", [[-0.5, 2, 1], [2, 3, 4], [2.5,2,3], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
      ["chen", [[0.5, 1.5, 0], [0.11, 0.01, 0], [0.09, -0.01, 0], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
      ["thomas", [[3, -2, 4], [2, 3, 4], [2.5,2,3]]],
      ["sprout", [[0, 0, 0], [0, 0, 0], [0,0,0]]],
      ["dadras", [[0.1, 0, 0], [0.2, 0, 0], [0.3, 0, 0], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
      ["lu", [[0.5, 1.5, 0], [0.11, 0.01, 0], [0.09, -0.01, 0], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]]
    ]);

    this.numParams = new Map([
      ["lorenz", 3],
      ["rossler", 3],
      ["fitzhughNagumo", 4],
      ["chua", 4],
      ["aizawa", 5],
      ["halvorsen", 3],
      ["chen", 3],
      ["thomas", 1],
      ["sprout", 1],
      ["dadras", 3]
    ]);


  }


  lorenz(x, y, z) {
    const [sigma, rho, beta] = this.params.get("lorenz");
    const dx = sigma * (y - x);
    const dy = x * (rho - z) - y;
    const dz = x * y - beta * z;
    return [dx, dy, dz];
  }

  rossler(x, y, z){
    const [a, b, c] = this.params.get("rossler");
    const dx = -y - z;
    const dy = x + a * y;
    const dz = b + z * (x - c);
    return [dx, dy, dz];
  }

  thomas(x, y, z) {
    const [a, b, k] = this.params.get("thomas");
    const dx = k*Math.sin(y) - b*x;
    const dy = k*Math.sin(z) - b*y;
    const dz = k*Math.sin(x) - b*z;
    return [dx, dy, dz];
  }

  sprout(x, y, z) {
    const [a, b, c] = this.params.get("sprout");
    const dx = y;
    const dy = z;
    const dz = -0.5*x - y - z + x**2;
    return [dx, dy, dz];
  }

  chen(x, y, z) {
    const [a,b,c] = this.params.get("chen");
    const dx = a * (y - x);
    const dy = (c-a)*x-x*z+c*y;
    const dz = x*y-b*z;
    return [dx, dy, dz];
  }


  halvorsen(x, y, z) {
    const [a, b, c] = this.params.get("halvorsen");
    const dx = -a*x - 4*y - 4*z - y**2;
    const dy = -a*y -4*z - 4*x - z**2;
    const dz = -a*z- 4*x- 4*y - x**2;
    return [dx, dy, dz];
  }

  //need to handle its high num of params, we can just allow to change 3 params and keep rest constant
  aizawa(x, y, z) {
    const d = 3.5, e = 0.25, f = 0.1;
    const [a, b, c] = this.params.get("aizawa");
    const dx = (z - b) * x - d * y;
    const dy = d*x + (z-b)*y;
    const dz = c + a*z - (z**3)/3 - (x**2 + y**2)*(1+e*z)+f*z*x**3;
    return [dx, dy, dz];
  }

  //same here
  chua(x, y, z) {
    const alpha = 15, beta = 28, m0 = -1, m1 = 1, m2 = 0.5;
    const dx = alpha * (y - x - (m1 * Math.abs(x) + m2 * Math.abs(x - m0)));
    const dy = x - y + z;
    const dz = -beta * y;
    return [dx, dy, dz];
  }

  //same here
  fitzhughNagumo(x, y, z) {
    const a = 0.7, b = 0.8, c = 10;
    const mu = 0.08, I = 5;
    const dx = x - ((x * x * x )/3 - y) + z + I;
    const dy = (x + a - b * y)*mu;
    const dz = (c-x)*(mu/10);
    return [dx, dy, dz];
  }

  dadras(x,y,z){
    const [a, b, c] = this.params.get("dadras");
    const dx = y -a*x;
    const dy = c*x-x*z+y;
    const dz = x*y -b*z;
    return [dx, dy, dz];
  }

  lu(x,y,z){
    const [a,b,c] = this.params.get("lu");
    const dx = a*(y-x);
    const dy = -x*z + c*y;
    const dz = x*y - b*z;

    return [dx, dy, dz];

  }

  eulerStep(x, y, z) {
    const fn = this.options.get(this.choice);
    const [dx, dy, dz] = fn(x, y, z);
    return [x + dx * dt, y + dy * dt, z + dz * dt];
  }
}

const system = new ThreeDimensionalSystems();

function updateTrail(position, trailArray, trailGeometry) {
  trailArray.push(position.clone());
  if (trailArray.length > maxTrailPoints) {
    trailArray.shift();
  }

  const positionsArray = new Float32Array(trailArray.length * 3);
  trailArray.forEach((pos, i) => {
    positionsArray[i * 3] = pos.x;
    positionsArray[i * 3 + 1] = pos.y;
    positionsArray[i * 3 + 2] = pos.z;
  });

  trailGeometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
  trailGeometry.setDrawRange(0, trailArray.length);
  trailGeometry.attributes.position.needsUpdate = true;
}

function clearTrail(trailArray, trailGeometry) {
  trailArray.length = 0;  // empty the array

  // Update geometry with empty positions
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
  trailGeometry.setDrawRange(0, 0);
  trailGeometry.attributes.position.needsUpdate = true;
}


function reset(){
  stepsPerFrame = defaultSteps;
  [x1, y1, z1] = system.initialConditions.get(system.choice)[0];
  [x2, y2, z2] = system.initialConditions.get(system.choice)[1];
  [x3, y3, z3] = system.initialConditions.get(system.choice)[2];
  [x4, y4, z4] = system.initialConditions.get(system.choice)[3];
  [x5, y5, z5] = system.initialConditions.get(system.choice)[4];
  [x6, y6, z6] = system.initialConditions.get(system.choice)[5];

  clearTrail(trailPositions1, trailGeometry1);
  clearTrail(trailPositions2, trailGeometry2);
  clearTrail(trailPositions3, trailGeometry3);
  clearTrail(trailPositions4, trailGeometry4);
  clearTrail(trailPositions5, trailGeometry5);
  clearTrail(trailPositions6, trailGeometry6);
  document.getElementById("simulation-speed").value = Math.floor(stepsPerFrame/5);
  document.getElementById("simulation-speed-value").textContent = Math.floor(stepsPerFrame/5);
  running = true;
  document.getElementById("pause-btn").textContent = "Pause";
}

function animate() {
  animationId = requestAnimationFrame(animate);
  if (frameCount++ % 1 !== 0) return;

  if(running){
    simulationTime += dt;

    for(let i = 0; i < stepsPerFrame; i++) {

      // Euler integration
      [x1, y1, z1] = system.eulerStep(x1, y1, z1);
      [x2, y2, z2] = system.eulerStep(x2, y2, z2);
      [x3, y3, z3] = system.eulerStep(x3, y3, z3);
      [x4, y4, z4] = system.eulerStep(x4, y4, z4);
      [x5, y5, z5] = system.eulerStep(x5, y5, z5);
      [x6, y6, z6] = system.eulerStep(x6, y6, z6);

      // Scale down for rendering
      const scale = system.renderScale.get(system.choice);
      ball1.position.set(x1 * scale, y1 * scale, z1 * scale);
      ball2.position.set(x2 * scale, y2 * scale, z2 * scale);
      ball3.position.set(x3 * scale, y3 * scale, z3 * scale);
      ball4.position.set(x4 * scale, y4 * scale, z4 * scale);
      ball5.position.set(x5 * scale, y5 * scale, z5 * scale);
      ball6.position.set(x6 * scale, y6 * scale, z6 * scale);

      if (trailSkip++ % 10 === 0){
        updateTrail(ball1.position, trailPositions1, trailGeometry1);
        updateTrail(ball2.position, trailPositions2, trailGeometry2);
        updateTrail(ball3.position, trailPositions3, trailGeometry3);
        updateTrail(ball4.position, trailPositions4, trailGeometry4);
        updateTrail(ball5.position, trailPositions5, trailGeometry5);
        updateTrail(ball6.position, trailPositions6, trailGeometry6);
      }
    //updateTrail(ball3.position, trailPositions3, trailGeometry3);
    }
  }
  controls.update();

  renderer3d.render(scene3d, camera3d);
}

function toggleParams(x,y, divName){
  if (x === y){
    document.getElementById(divName).style.display = "none";
  }
  else{
    document.getElementById(divName).style.display = "flex";
  }

}

document.addEventListener("DOMContentLoaded", () => {
  const canvas3d = document.getElementById("canvas3d");
  const width = canvas3d.width = 1500;
  const height = canvas3d.height = 900;

  scene3d = new THREE.Scene();
  camera3d = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera3d.position.set(0.1, 0, 4);
  camera3d.up.set(0, 1, 0);
  camera3d.lookAt(0, 0, 0);


  renderer3d = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
  renderer3d.setSize(width, height);

  // controls = new OrbitControls(camera3d, renderer3d.domElement);
  // controls.enableDamping = true;
  // controls.minPolarAngle = 0;
  // controls.maxPolarAngle = Math.PI;
  // controls.enablePan = true;
  // controls.enableZoom = true;
  // controls.rotateSpeed = 1.0;
  // controls.dampingFactor = 0.05;
  // controls.screenSpacePanning = true;
  controls = new TrackballControls(camera3d, renderer3d.domElement);
  controls.rotateSpeed = 2;
  controls.zoomSpeed = 1;
  controls.panSpeed = 0.8;
  controls.dynamicDampingFactor = 0.3;
  controls.noPan = false;
  controls.minDistance = 0.5;
  controls.maxDistance = 11;
  controls.target.set(0, 0, 0);
  controls.update();



  // Create sphere
  const geometry = new THREE.SphereGeometry(0.05, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: initColors[0] });
  const material2 = new THREE.MeshBasicMaterial({ color: 	initColors[1] });
  ball1 = new THREE.Mesh(geometry, material);
  ball2 = new THREE.Mesh(geometry, material2);
  const ball3Geometry = new THREE.SphereGeometry(0.05, 32, 32);
  const ball3Material = new THREE.MeshBasicMaterial({ color: initColors[2] }); // Blue
  const ball4Geometry = new THREE.SphereGeometry(0.05, 32, 32);
  const ball4Material = new THREE.MeshBasicMaterial({ color: initColors[3] });
  const ball5Geometry = new THREE.SphereGeometry(0.05, 32, 32);
  const ball5Material = new THREE.MeshBasicMaterial({ color: initColors[4] });
  const ball6Geometry = new THREE.SphereGeometry(0.05, 32, 32);
  const ball6Material = new THREE.MeshBasicMaterial({ color: initColors[5] });
  ball3 = new THREE.Mesh(ball3Geometry, ball3Material);
  ball4 = new THREE.Mesh(ball4Geometry, ball4Material);
  ball5 = new THREE.Mesh(ball5Geometry, ball5Material);
  ball6 = new THREE.Mesh(ball6Geometry, ball6Material);
  scene3d.add(ball1);
  scene3d.add(ball2);
  scene3d.add(ball3);
  scene3d.add(ball4);
  scene3d.add(ball5);
  scene3d.add(ball6);
  ball1.position.set(x1, y1, z1); // Initial position
  ball2.position.set(x2, y2, z2); // Initial position for second ball
  ball3.position.set(x3, y3, z3);
  ball4.position.set(x4, y4, z4);
  ball5.position.set(x5, y5, z5);
  ball6.position.set(x6, y6, z6);

  //ball3.position.set(7.5, -2, 27); // Initial position for third ball

  const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
  scene3d.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 2);
  scene3d.add(directionalLight);

  const gridXZ = new THREE.GridHelper(15, 15);
  scene3d.add(gridXZ);

  const gridYZ = new THREE.GridHelper(15, 15);
  gridYZ.rotation.z = Math.PI / 2; // rotate 90° around Z to stand it up
  scene3d.add(gridYZ);

  const gridXY = new THREE.GridHelper(15, 15);
  gridXY.rotation.x = Math.PI / 2;
 // rotate 90° around X to make it flat in XY
  scene3d.add(gridXY);
  gridXY.visible = false;

  scene3d.add(trailLine1);
  scene3d.add(trailLine2);
  scene3d.add(trailLine3);
  scene3d.add(trailLine4);
  scene3d.add(trailLine5);
  scene3d.add(trailLine6);

  const systemSelect = document.getElementById("system-select-3d");
  const speedSlider = document.getElementById("simulation-speed");
  const speedValue = document.getElementById("simulation-speed-value");
  const param1Slider = document.getElementById("param1");
  const param1Value = document.getElementById("param1-value");
  const param2Slider = document.getElementById("param2");
  const param2Value = document.getElementById("param2-value");
  const param3Slider = document.getElementById("param3");
  const param3Value = document.getElementById("param3-value");

  const paramSymbol1 = document.getElementById("symb1");
  const paramSymbol2 = document.getElementById("symb2");
  const paramSymbol3 = document.getElementById("symb3");

  const paramResetBtn = document.getElementById("resetParams-btn");

  systemSelect.addEventListener("change", (e) => {
    const [p1Old, p2Old, p3Old] = system.initParams.get(system.choice);
    system.params.set(system.choice, [p1Old, p2Old, p3Old]);
    system.choice = e.target.value;
    const equationTitle = document.getElementById("equation-title");
    equationTitle.textContent = nameMap.get(system.choice);
    const equation = document.getElementById("equation");
    equation.innerHTML = equationMap.get(system.choice);
    const [p1, p2, p3] = equationParamMap.get(e.target.value);
    const latexStart = "\\(";
    const latexEnd = "\\)";
    paramSymbol1.textContent = latexStart + p1 + ":\\," + latexEnd;
    paramSymbol2.textContent = latexStart + p2 + ":\\," + latexEnd;
    paramSymbol3.textContent = latexStart + p3 + ":\\," + latexEnd;

    const [p1Val, p2Val, p3Val] = system.initParams.get(system.choice);

    param1Value.textContent = p1Val.toFixed(3);
    param2Value.textContent = p2Val.toFixed(3);
    param3Value.textContent = p3Val.toFixed(3);

    const minMaxArray = system.paramsRange.get(system.choice);
    
    const p1Min = minMaxArray[0][0];
    const p1Max = minMaxArray[0][1];

    
    toggleParams(p1Min, p1Max, "param1-div");
  

    const p2Min = minMaxArray[1][0];
    const p2Max = minMaxArray[1][1];

    toggleParams(p2Min, p2Max, "param2-div");

    const p3Min = minMaxArray[2][0];
    const p3Max = minMaxArray[2][1];

    toggleParams(p3Min, p3Max, "param3-div");

  

    param1Slider.min = p1Min;
    param1Slider.max = p1Max;

    param2Slider.min = p2Min;
    param2Slider.max = p2Max;

    param3Slider.min = p3Min;
    param3Slider.max = p3Max;

    const p1Step = (p1Max - p1Min)/100;
    const p2Step = (p2Max - p2Min)/100;
    const p3Step = (p3Max - p3Min)/100;

    param1Slider.step = p1Step;
    param2Slider.step = p2Step;
    param3Slider.step = p3Step;

    param1Slider.value = p1Val;
    param2Slider.value = p2Val;
    param3Slider.value = p3Val;

    MathJax.typeset(); // Re-render MathJax equations
    reset();
  });

  speedSlider.addEventListener("input", (e) => {
    const speed = parseInt(e.target.value);
    speedValue.textContent = speed;
    if (speed === 1){
      stepsPerFrame = 1;
    }
    else{
    //input can be [1,5], 
    stepsPerFrame = parseInt(speed*5);
    }
  });



  param1Slider.addEventListener("change", (e) => {
    const val = parseFloat(e.target.value);
    let [p1, p2, p3] = system.params.get(system.choice);
    system.params.set(system.choice, [val, p2, p3]);
    param1Value.innerHTML = val;
    reset();

  });



  param2Slider.addEventListener("change", (e) => {
    const val = parseFloat(e.target.value);
    let [p1, p2, p3] = system.params.get(system.choice);
    system.params.set(system.choice, [p1, val, p3]);
    param2Value.innerHTML = val;
    reset();

  });


  param3Slider.addEventListener("change", (e) => {
    const val = parseFloat(e.target.value);
    let [p1, p2, p3] = system.params.get(system.choice);
    system.params.set(system.choice, [p1, p2, val]);
    param3Value.innerHTML = val;
    reset();

  });

  paramResetBtn.addEventListener("click", (e) => {

    const [p1Val, p2Val, p3Val] = system.initParams.get(system.choice);
    system.params.set(system.choice, [p1Val, p2Val, p3Val]);
    param1Value.textContent = p1Val.toFixed(3);
    param2Value.textContent = p2Val.toFixed(3);
    param3Value.textContent = p3Val.toFixed(3);
    param1Slider.value = p1Val;
    param2Slider.value = p2Val;
    param3Slider.value = p3Val;
    reset();

  });


  


  const resetBtn = document.getElementById("reset-btn");
  resetBtn.addEventListener("click", () => {
    reset();
  });
  
 
  
    const btnXZ = document.getElementById("toggle-grid-btn1");
    const btnYZ = document.getElementById("toggle-grid-btn2");
    const btnXY = document.getElementById("toggle-grid-btn3");
  
    btnXZ.addEventListener("click", () => {
      showXZ = !showXZ;
      gridXZ.visible = showXZ;
      btnXZ.textContent = showXZ ? "Hide XY Grid" : "Show XY Grid";
    });

    btnYZ.addEventListener("click", () => {
      showYZ = !showYZ;
      gridYZ.visible = showYZ;
      btnYZ.textContent = showYZ ? "Hide YZ Grid" : "Show YZ Grid";
    });

    btnXY.addEventListener("click", () => {
      showXY = !showXY;
      gridXY.visible = showXY;
      btnXY.textContent = showXY ? "Hide XZ Grid" : "Show XZ Grid";
    });

    const paletteSelect = document.getElementById("palette-select");
  
    paletteSelect.addEventListener("change", (e) => {
      const selected = e.target.value;
      const colors = palettes[selected] || palettes.r;

      ball1.material.color.set(colors[0]);
      ball2.material.color.set(colors[1]);
      ball3.material.color.set(colors[2]);
      ball4.material.color.set(colors[3]);
      ball5.material.color.set(colors[4]);
      ball6.material.color.set(colors[5]);

      trailLine1.material.color.set(colors[0]);
      trailLine2.material.color.set(colors[1]);
      trailLine3.material.color.set(colors[2]);
      trailLine4.material.color.set(colors[3]);
      trailLine5.material.color.set(colors[4]);
      trailLine6.material.color.set(colors[5]);
    });

    const pauseBtn = document.getElementById("pause-btn");

    pauseBtn.addEventListener("click", (e) => {
      running = !running;

      if(running){
        animate();
        pauseBtn.textContent = "Pause";
      }
      else{
        pauseBtn.textContent = "Play";
      }

    });

  const spheresVisibility = document.getElementById("showSpheres");
  
  spheresVisibility.addEventListener("click", (e) => {
    spheresVisible = !spheresVisible;
    ball1.visible = spheresVisible;
    ball2.visible = spheresVisible;
    ball3.visible = spheresVisible;
    ball4.visible = spheresVisible;
    ball5.visible = spheresVisible;
    ball6.visible = spheresVisible;
    spheresVisibility.textContent = spheresVisible ? "Hide Spheres" : "Show Spheres";
  });

  const resetCamBtn = document.getElementById("resetCam");

  resetCamBtn.addEventListener("click", (e) => {
    camera3d.position.set(0.1, 0, 4);
    camera3d.up.set(0, 1, 0);

    // Ensure it's looking at the origin
    camera3d.lookAt(0, 0, 0);

    // Reset TrackballControls target and internal state
    controls.target.set(0, 0, 0);
    controls.reset();  // full reset of rotation/quaternion

  });

  [x1, y1, z1] = system.initialConditions.get(system.choice)[0];
  [x2, y2, z2] = system.initialConditions.get(system.choice)[1];
  [x3, y3, z3] = system.initialConditions.get(system.choice)[2];
  [x4, y4, z4] = system.initialConditions.get(system.choice)[3];
  [x5, y5, z5] = system.initialConditions.get(system.choice)[4];
  [x6, y6, z6] = system.initialConditions.get(system.choice)[5];

  animate();
});
