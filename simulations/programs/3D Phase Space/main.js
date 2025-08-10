
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
//import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/TrackballControls.js';
import { Line2 } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/lines/LineGeometry.js';

let renderer3d, scene3d, camera3d;
let ball1;
let ball2;
let ball3;
let ball4;
let ball5;
let ball6;
const dt = 0.003;
let frameCount = 0;
let simulationTime = 0;
let stepsPerFrame = 5;
const defaultSteps = stepsPerFrame;
let animationId = null;
let controls; 
const maxTrailPoints = 4500;
const numSteps = 1;
let integrate = 0;

let cycling = false;
let colorInterval = null;
let cycleColor = 0;

let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let maxRecordingTimeout = null;

let running = true;

let showXZ = true;
let showXY = false;
let showYZ = true;

let spheresVisible = true;

const palettes = {
  r: ["#a81600", "#9b5300", "#b33e00", "#7e2e00", "#bb0000", "#ff9100"],       // reddish/orange/yellow
  bg: ["#0057FF", "#009933", "#2600ff", "#00ad0e", "#003de4", "#07c500"],      // strong blue, strong green, strong purple
  rgb: ["#8f0000", "#009723", "#0077FF", "#0094d8", "#9c0000", "#41e600"],     // red, brighter green, pure blue
  alien: ["#7000a0", "#e60045", "#00c49c", "#5b00ca", "#d4004e","#0066b4ff"],
  cyberpunk: ["#FF00FF", "#00FFFF", "#FF6C00", "#FF0055", "#00FF99", "#3300FF"],
  blue: ["#003ee9", "#0056a7", "#004cda", "#0014c5", "#008ab4", "#0052ce"],
  red: ["#e90000", "#fc0000", "#ff0800", "#8f0000", "#720000", "#b60000"],
  green: ["#008607", "#006b12", "#00a80e", "#096b00", "#2fc501", "#00a531"],
  orange: ["#d88e04", "#ca6200", "#ff6600", "#c55a03", "#d68100", "#be7c00"],
  sunset: ["#ff1500", "#ffaa00", "#ff3c00", "#ff0004", "#ffaa00","#220070"],
  electric: ["#00cee9", "#f17f90", "#FFD700", "#885fdb", "#23e0ce", "#fc57a9"],
  contrast: ["#d3000e", "#f33500", "#1f00e9", "#00a08d", "#e0b000", "#00ff80"],
  forest: ["#014D4D", "#028090", "#00A896", "#f2ff00", "#e71f00", "#53063c"],
  reyna: ["#a15fa3", "#8a50c0", "#80324c", "#ffa4a4", "#381c5e", "#491d3c"],
  lavender: ["#5C2E7F", "#2C0B42", "#D3B1FC", "#473473", "#7A5A8C", "#B7A0E8"],
  pinky: ["#52083C", "#9C437A", "#FCB1E9", "#E0C8DC", "#9E2973", "#F7D0EF"],
  kodie: ["#070D4D", "#264491", "#636FC9", "#B4BCE0", "#250DBF", "#D0DAF7"],
  rainbow: ["#FF0000", "#FF7F00", "#FFFF00","#00FF00", "#0000FF", "#8B00FF"]
};

function detectOS() {
  const uaData = navigator.userAgentData;
  if (uaData?.platform) {
    const p = uaData.platform.toLowerCase();
    if (p.includes('mac') || p.includes('ios')) return 'apple';
    if (p.includes('windows')) return 'windows';
    if (p.includes('linux')) return 'linux';
  }
  // Fallback: UA + touch heuristic for iPadOS-as-Mac
  const ua = navigator.userAgent || '';
  const touch = navigator.maxTouchPoints || 0;
  if (/iPhone|iPod/.test(ua)) return 'apple';
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && touch > 1)) return 'apple';
  if (/Mac/.test(ua)) return 'apple';
  if (/Windows/.test(ua)) return 'windows';
  if (/Linux|Android/.test(ua)) return 'linux';
  return 'unknown';
}

  const userOS = detectOS();
  console.log("The user's operating system is: " + userOS);

let initColors = palettes.r;

let allGridsVisible = true;

if (userOS === "apple"){
  //use Line2
}

const t1 = [], t2 = [], t3 = [], t4 = [], t5 = [], t6 = [];

// geometries
const g1 = new LineGeometry(), g2 = new LineGeometry(), g3 = new LineGeometry();
const g4 = new LineGeometry(), g5 = new LineGeometry(); //g6 = new LineGeometry();

// materials (worldUnits keeps thickness stable when zooming)
const m1 = new LineMaterial({ color: initColors[0], worldUnits: false, depthTest: true, transparent: false, depthWrite: false});
const m2 = new LineMaterial({ color: initColors[1], worldUnits: false, depthTest: true, transparent: false, depthWrite: false });
const m3 = new LineMaterial({ color: initColors[2], worldUnits: false, depthTest: true, transparent: false, depthWrite: false });
const m4 = new LineMaterial({ color: initColors[3], worldUnits: false, depthTest: true, transparent: false, depthWrite: false });
const m5 = new LineMaterial({ color: initColors[4], worldUnits: false, depthTest: true, transparent: false, depthWrite: false });
//const m6 = new LineMaterial({ color: initColors[5], worldUnits: false, depthTest: true, transparent: false, depthWrite: false });



// line objects
const trailLine1 = new Line2(g1, m1);
const trailLine2 = new Line2(g2, m2);
const trailLine3 = new Line2(g3, m3);
const trailLine4 = new Line2(g4, m4);
const trailLine5 = new Line2(g5, m5);
//const trailLine6 = new Line2(g6, m6);

const trailLines = [trailLine1, trailLine2, trailLine3];
const materials = [m1, m2, m3];
const geometries = [g1, g2, g3];
const flatPointsArr = [t1, t2, t3];



// const trailGeometry1 = new THREE.BufferGeometry();
// const trailMaterial1 = new THREE.LineBasicMaterial({ color: initColors[0], linewidth: 2});
// const trailLine1 = new THREE.Line(trailGeometry1, trailMaterial1);

// const trailGeometry2 = new THREE.BufferGeometry();
// const trailMaterial2 = new THREE.LineBasicMaterial({ color: initColors[1], linewidth: 2});
// const trailLine2 = new THREE.Line(trailGeometry2, trailMaterial2);



 let trailSkip = 0; //update every third point on trail

// const trailGeometry3 = new THREE.BufferGeometry();
// const trailMaterial3 = new THREE.LineBasicMaterial({ color: initColors[2], linewidth: 2}); // Blue
// const trailLine3 = new THREE.Line(trailGeometry3, trailMaterial3);

// const trailGeometry4 = new THREE.BufferGeometry();
// const trailMaterial4 = new THREE.LineBasicMaterial({ color: initColors[3], linewidth: 2}); // Blue
// const trailLine4 = new THREE.Line(trailGeometry4, trailMaterial4);

// const trailGeometry5 = new THREE.BufferGeometry();
// const trailMaterial5 = new THREE.LineBasicMaterial({color: initColors[4], linewidth: 2}); // Blue
// const trailLine5 = new THREE.Line(trailGeometry5, trailMaterial5);

// const trailGeometry6 = new THREE.BufferGeometry();
// const trailMaterial6 = new THREE.LineBasicMaterial({ color: initColors[5], linewidth: 2}); // Blue
// const trailLine6 = new THREE.Line(trailGeometry6, trailMaterial6);
const trailPositions1 = [];
const trailPositions2 = [];
const trailPositions3 = [];
const trailPositions4 = [];
const trailPositions5 = [];
const trailPositions6 = [];

let [x1, y1, z1] = [1, 1, 1]; // Initial Lorenz coordinates (must be non-zero)
let [x2, y2, z2] =  [2, 3, 4]; // Initial coordinates for second ball
let [x3, y3, z3] = [2.5,2,3];// Initial coordinates for third ball
let [x4, y4, z4] = [1.5, -3, 0];
let [x5, y5, z5] = [-0.5, 0.9, 1.25];
let [x6, y6, z6] =  [-2, 0.9, 0.75];


const nameMap = new Map();
nameMap.set("lorenz", "Lorenz System");
nameMap.set("rossler", "Rössler System");
nameMap.set("fitzhughNagumo", "FitzHugh-Nagumo Model");
nameMap.set("aizawa", "Aizawa Attractor");
nameMap.set("halvorsen", "Halvorsen System");
nameMap.set("thomas", "Thomas System");
nameMap.set("sprout", "Sprout System");
nameMap.set("dadras", "Dadras System");
nameMap.set("lu", "Lü Attractor");
nameMap.set("chen", "Chen Attractor");
nameMap.set("sprott", "Sprott System Variation");
nameMap.set("rabi", "Rabinovich-Fabrikant Equations");
nameMap.set("hoover", "Nose-Hoover Oscillator");
nameMap.set("burkShaw", "Burk Shaw Attractor");
nameMap.set("chenLee", "Chen-Lee Attractor");
nameMap.set("chua", "Chua's Circuit");
nameMap.set("newton", "Newton-Leipnik System");
nameMap.set("shimizu", "Shimizu-Morioka System");
nameMap.set("arneodo", "Arneodo-Coullet System");
nameMap.set("threeScroll", "Three-Scroll Attractor");
nameMap.set("dequanLi", "Dequan-Li Attractor");


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
equationMap.set("sprott", "\\[\\begin{align*} \\frac{dx}{dt} &= y\\\\ \\\\ \\frac{dy}{dt} &= z\\\\ \\\\ \\frac{dz}{dt} &= -0.5z - y - x + x^2\\end{align*}\\]");
equationMap.set("rabi", "\\[\\begin{align*} \\frac{dx}{dt} &= y(z-1+x^2) + \\gamma y\\\\ \\\\ \\frac{dy}{dt} &= x(3z+1-x^2)+\\gamma y\\\\ \\\\ \\frac{dz}{dt} &= -2z(\\alpha+xy)\\end{align*}\\]");
equationMap.set("hoover", "\\[\\begin{align*} \\frac{dx}{dt} &= y\\\\ \\\\ \\frac{dy}{dt} &= -x-zy\\\\ \\\\ \\frac{dz}{dt} &= y^2-a\\end{align*}\\]");
equationMap.set("burkShaw", "\\[\\begin{align*} \\frac{dx}{dt} &= -a(x+y)\\\\ \\\\ \\frac{dy}{dt} &= -y-axz\\\\ \\\\ \\frac{dz}{dt} &= axy+b\\end{align*}\\]");
equationMap.set("chenLee", "\\[\\begin{align*} \\frac{dx}{dt} &= \\alpha x-yz\\\\ \\\\ \\frac{dy}{dt} &= \\beta y+xz\\\\ \\\\ \\frac{dz}{dt} &=  \\delta z + \\frac{xy}{3}\\end{align*}\\]");
equationMap.set("chua", "\\[\\begin{align*} \\frac{dx}{dt} &= \\alpha (y-x-f(x))\\\\ \\\\ \\frac{dy}{dt} &= x-y+z\\\\ \\\\ \\frac{dz}{dt} &=  -\\beta y\\end{align*}\\]");
equationMap.set("newton", "\\[\\begin{align*} \\frac{dx}{dt} &= -\\alpha x + y + 10yz\\\\ \\\\ \\frac{dy}{dt} &= -x-0.4y+5xz\\\\ \\\\ \\frac{dz}{dt} &=  \\beta z-5xy\\end{align*}\\]");
equationMap.set("shimizu", "\\[\\begin{align*} \\frac{dx}{dt} &= y\\\\ \\\\ \\frac{dy}{dt} &= x(1-z)-\\alpha y\\\\ \\\\ \\frac{dz}{dt} &=  -\\beta z + x^2\\end{align*}\\]");
equationMap.set("arneodo", "\\[\\begin{align*} \\frac{dx}{dt} &= y\\\\ \\\\ \\frac{dy}{dt} &= z\\\\ \\\\ \\frac{dz}{dt} &=  -\\alpha x - \\beta y - z + \\lambda x^3\\end{align*}\\]");
equationMap.set("threeScroll", "\\[\\begin{align*} \\frac{dx}{dt} &= \\alpha(y-x)+ \\delta z\\\\ \\\\ \\frac{dy}{dt} &= \\beta x -xz + \\lambda y\\\\ \\\\ \\frac{dz}{dt} &=  xy-\\sigma z\\end{align*}\\]");
equationMap.set("dequanLi", "\\[\\begin{align*} \\frac{dx}{dt} &= a(y-x)+cxz\\\\ \\\\ \\frac{dy}{dt} &= ex+fy-xz\\\\ \\\\ \\frac{dz}{dt} &=  bz+xy-dx^2\\end{align*}\\]");



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
equationParamMap.set("sprott", ["a", "b", "c"]);
equationParamMap.set("rabi", ["\\alpha", "\\gamma", "c"]);
equationParamMap.set("hoover", ["a", "b", "c"]);
equationParamMap.set("burkShaw", ["a", "b", "c"]);
equationParamMap.set("chenLee", ["\\alpha", "\\beta", "\\delta"]);
equationParamMap.set("chua", ["\\alpha", "\\beta", "\\delta"]);
equationParamMap.set("newton", ["\\alpha", "\\beta", "\\lambda"]);
equationParamMap.set("shimizu", ["\\alpha", "\\beta", "\\lambda"]);
equationParamMap.set("arneodo", ["\\alpha", "\\beta", "\\lambda"]);
equationParamMap.set("threeScroll", ["\\alpha", "\\beta", "\\lambda"]);
equationParamMap.set("dequanLi", ["a", "b", "c"]);

 // smooth camera movement

class ThreeDimensionalSystems {
  constructor() {
    this.choice = "lorenz"; // Default choice
    this.options = new Map([
      ["lorenz", (x, y, z) => this.lorenz(x, y, z)],
      ["rossler", (x, y, z) => this.rossler(x, y, z)],
      ["fitzhughNagumo", (x, y, z) => this.fitzhughNagumo(x, y, z)],
      ["aizawa", (x, y, z) => this.aizawa(x, y, z)],
      ["halvorsen", (x, y, z) => this.halvorsen(x, y, z)],
      ["chen", (x, y, z) => this.chen(x, y, z)],
      ["thomas", (x, y, z) => this.thomas(x, y, z)],
      ["sprott", (x, y, z) => this.sprott(x, y, z)],
      ["dadras", (x, y, z) => this.dadras(x, y, z)],
      ["lu", (x, y, z) => this.lu(x, y, z)],
      ["rabi", (x, y, z) => this.rabi(x, y, z)],
      ["hoover", (x, y, z) => this.hoover(x, y, z)],
      ["burkShaw", (x, y, z) => this.burkShaw(x, y, z)],
      ["chenLee", (x, y, z) => this.chenLee(x, y, z)],
      ["chua", (x,y,z) => this.chua(x,y,z)],
      ["newton", (x,y,z) => this.newton(x,y,z)],
      ["shimizu", (x,y,z) => this.shimizu(x,y,z)],
      ["arneodo", (x,y,z) => this.arneodo(x,y,z)],
      ["threeScroll", (x,y,z) => this.threeScroll(x,y,z)],
      ["dequanLi", (x,y,z) => this.dequanLi(x,y,z)]

    ]);

    this.timeScales = new Map([
      ["lorenz", 1],
      ["rossler", 1],
      ["fitzhughNagumo", 1],
      ["aizawa", 1],
      ["halvorsen", 1],
      ["chen", 0.4],
      ["thomas", 10],
      ["sprott", .9],
      ["dadras", 1],
      ["lu", 1],
      ["rabi", 1],
      ["hoover", 2.5],
      ["burkShaw", 0.75],
      ["chenLee", 0.4],
      ["chua", 1],
      ["newton", 7],
      ["shimizu", 7],
      ["arneodo", 3],
      ["threeScroll", 0.5],
      ["dequanLi", 0.15]
    ]);

    this.initParams = new Map([
      ["lorenz", [10, 28, 8/3]],
      ["rossler", [0.2, 0.2, 5.7]],
      ["fitzhughNagumo", [0.7, 0.8, -0.5]],
      ["aizawa", [0.95, 0.7, 0.6]],
      ["halvorsen", [1.4, 0, 0]],
      ["chen", [35, 3, 28]],
      ["thomas", [0, 0.208186, 0.5]],
      ["sprott", [0, 0, 0]],
      ["dadras", [2, 0.5, 3]],
      ["lu", [36, 3, 20]],
      ["rabi", [1.1, 0.87, 0]],
      ["hoover", [1, 0, 0]],
      ["burkShaw", [10, 4.272, 0]],
      ["chenLee", [5, -10, -0.38]],
      ["chua", [15.6, 28, 0]],
      ["newton", [0.4, 0.175, 0]],
      ["shimizu", [0.75, 0.428, 0]],
      ["arneodo", [5.5, 3.5, 1]],
      ["threeScroll", [40, 40, 20]],
      ["dequanLi", [40, 1.833, 0.16]]

    ]);

    this.params = new Map([
      ["lorenz", [10, 28, 8/3]],
      ["rossler", [0.2, 0.2, 5.7]],
      ["fitzhughNagumo", [0.7, 0.8, -0.5]],
      ["aizawa", [0.95, 0.7, 0.6]],
      ["halvorsen", [1.4, 0, 0]],
      ["chen", [35, 3, 28]],
      ["thomas", [0, 0.208186, 0]],
      ["sprott", [0, 0, 0]],
      ["dadras", [2, 0.5, 3]],
      ["lu", [36, 3, 20]],
      ["rabi", [1.1, 0.87, 0]],
      ["hoover", [1, 0, 0]],
      ["burkShaw", [10, 4.272, 0]],
      ["chenLee", [5, -10, -0.38]],
      ["chua", [15.6, 28, 0]],
      ["newton", [0.4, 0.175, 0]],
      ["shimizu", [0.75, 0.428, 0]],
      ["arneodo", [5.5, 3.5, 1]],
      ["threeScroll", [40, 40, 20]],
      ["dequanLi", [40, 1.833, 0.16]]


    ]);

    this.paramsRange = new Map([
      ["lorenz", [[8, 20], [23, 80], [2, 3]]],
      ["rossler", [[.1, 0.28], [.1, 1], [3, 9]]],
      ["fitzhughNagumo", [[.1, 1.2], [.1, 1.2], [0.5, 2]]],
      ["aizawa", [[0.8, 1.2], [0.5, 1], [0.4,0.7]]],
      ["halvorsen", [[1.3, 3.5], [0, 0], [0, 0]]],
      ["chen", [[32.5, 40], [2, 4], [20, 29]]],
      ["thomas", [[0, 0], [0.1, 0.31], [0,0]]],
      ["sprott", [[0,0], [0,0], [0,0]]],
      ["dadras", [[1.7, 2.5], [0.25, 1.5], [-0.5, 5]]],
      ["lu", [[25, 60], [0.5, 15], [13, 25]]],
      ["rabi", [[0.14, 1.11], [0.1, 0.87], [0, 0]]],
      ["hoover", [[0.05, 5], [0, 0], [0, 0]]],
      ["burkShaw", [[1, 20], [0.25, 20], [0, 0]]],
      ["chenLee", [[1, 5], [-40, -9.5], [-3, -0.15]]],
      ["chua", [[5, 18], [23, 35], [0, 0]]],
      ["newton", [[0.1, 1], [0.1, 0.5], [0, 0]]],
      ["shimizu", [[0.18, 1.2], [0.1, 1.8], [0, 0]]],
      ["arneodo", [[1, 6], [2.25, 4], [0.5, 5]]],
      ["threeScroll", [[30, 60], [0, 70], [10, 26]]],
      ["dequanLi", [[35, 60], [0.25, 3], [0.15, 0.165]]]

    ]);

    this.renderScale = new Map([
      ["lorenz", 0.05],
      ["rossler", 0.25],
      ["fitzhughNagumo", 0.5],
      ["aizawa", 0.75],
      ["halvorsen", 0.2],
      ["chen", 0.048],
      ["thomas", 0.55],
      ["sprott", 3],
      ["dadras", 0.3],
      ["lu", 0.05],
      ["rabi", .9],
      ["hoover", 0.75],
      ["burkShaw", 0.85],
      ["chenLee", 0.04],
      ["chua", 1],
      ["newton", 4],
      ["shimizu", 1],
      ["arneodo", 0.75],
      ["threeScroll", 0.015],
      ["dequanLi", 0.01]
    ]);
//[1, 1, 1], [2, 3, 4], [2.5,2,3], [1.5, -3, 0], [-0.5, 0.9, 1.25], [-2, 0.9, 0.75]
    this.initialConditions = new Map([
      ["lorenz", [[1, 1, 1], [2, 3, 4], [2.5,2,3], [1.5, -3, 0], [-0.5, 0.9, 1.25], [-2, 0.9, 0.75]]],
      ["rossler", [[1, 1, 1], [2, 3, 4], [2.5, 2, 3], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
      ["fitzhughNagumo", [[-1, -0.5, 1], [-10, 4, 1], [5, 5, -1]]],
      ["aizawa", [[0.5, 1.5, 0], [0.11, 0.01, 0], [0.09, -0.01, 0], [1.5, 0.5, 1.1], [0.5, 0.9, 1.25], [0, 0.9, 0.75]]],
      ["halvorsen", [[-0.5, 2, 1], [2, 3, 4], [2.5,2,3], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
      ["chen", [[0.5, 1.5, 0], [0.11, 0.01, 0], [0.09, -0.01, 0], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
      ["thomas", [[0, 1, 4], [2, 3, 4], [2.5,2,3], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
      ["sprott", [[.1, .2, 0], [0.1, 0.13, 0.24], [-0.01, 0.2, 0.23], [-0.04, 0.04, 0.13], [0.15, 0.148, 0.126], [0, 0.15, 0.135]]],
      ["dadras", [[0.1, 0, 0], [0.2, 0, 0], [0.3, 0, 0], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
      ["lu", [[0.5, 1.5, 0], [0.11, 0.01, 0], [0.09, -0.01, 0], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
      ["rabi", [[-1, 0, 0.5], [-1.5, 0.001, .85], [-2, 0, 0.5], [-1.02, 0, 0.501], [-1.05, 0, 0.5], [-1.5, 0.1, 0.12]]],
      ["hoover", [[0, 0.4,  0.1], [-0.2, 0.4, 0.1], [-0.2, 0.5, 0.15], [-0.2, 0.52, 0.16], [-0.21, 0.53, 0.16], [-0.2, 0.53, 0.17]]],
      ["burkShaw", [[0, 0.4,  0.1], [-0.2, 0.4, 0.1], [-0.2, 0.5, 0.15], [-0.2, 0.52, 0.16], [-0.21, 0.53, 0.16], [-0.2, 0.53, 0.17]]],
      ["chenLee", [[0, 0.4,  0.1], [-0.2, 0.4, 0.1], [-0.2, 0.5, 0.15], [-0.2, 0.52, 0.16], [-0.21, 0.53, 0.16], [-0.2, 0.53, 0.17]]],
      ["chua", [[0, 0.4,  0.1], [-0.2, 0.4, 0.1], [-0.2, 0.5, 0.15], [-0.2, 0.52, 0.16], [-0.21, 0.53, 0.16], [-0.2, 0.53, 0.17]]],
      ["newton", [[0, 0.4,  0.1], [-0.2, 0.4, 0.1], [-0.2, 0.5, 0.15], [-0.2, 0.52, 0.16], [-0.21, 0.53, 0.16], [-0.2, 0.53, 0.17]]],
      ["shimizu", [[0, 0.4,  0.1], [-0.2, 0.4, 0.1], [-0.2, 0.5, 0.15], [-0.2, 0.52, 0.16], [-0.21, 0.53, 0.16], [-0.2, 0.53, 0.17]]],
      ["arneodo", [[0.5, 0.01, 0.2], [-0.2, 0.4, 0.1], [-0.2, 0.5, 0.15], [-0.2, 0.52, 0.16], [-0.21, 0.53, 0.16], [-0.2, 0.53, 0.17]]],
      ["threeScroll", [[0.5, 0.01, 0.2], [-0.2, 0.4, 0.1], [-0.2, 0.5, 0.15], [-0.2, 0.52, 0.16], [-0.21, 0.53, 0.16], [-0.2, 0.53, 0.17]]],
      ["dequanLi", [[0.5, 0.01, 0.2], [3, 0.4, 5], [1, 5, 0.15], [6, 5, 0.16], [5, 0.53, 3.6], [-0.2, 0.53, 1.7]]]

    
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
      ["sprott", 1],
      ["dadras", 3],
      ["rabi", 3]
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
    const dx = Math.sin(y) - b*x;
    const dy = Math.sin(z) - b*y;
    const dz = Math.sin(x) - b*z;
    return [dx, dy, dz];
  }

  sprott(x, y, z) {
    const [a, b, c] = this.params.get("sprott");
    const dx = y;
    const dy = z;
    const dz = -0.5 * x - y + x ** 2;
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

  rabi(x,y,z){
    const [a,b,c] = this.params.get("rabi");
    const dx = y*(z-1+x**2) + b*x
    const dy = x*(3*z+1-x**2) + b*y;
    const dz = -2*z*(a + x*y);
    return [dx, dy, dz]
  }

  hoover(x,y,z){
    const [a,b,c] = this.params.get("hoover");
    const dx = y
    const dy = -x-z*y;
    const dz = y**2 - a;
    return [dx, dy, dz];
  }

  burkShaw(x,y,z){
    const [a,b,c] = this.params.get("burkShaw");
    const dx = -a*(x+y);
    const dy = -y-a*x*z;
    const dz = a*x*y+b;
    return [dx, dy, dz];
  }

  chenLee(x,y,z){
    const [a, b, c] = this.params.get("chenLee");
    const dx = a*x -y*z;
    const dy = b*y +x*z;
    const dz = c*z + (x*y)/3;
    return [dx, dy, dz];
  }

  chua(x,y,z){
    const [alpha, beta, c] = this.params.get("chua");
    const m0 = -1.143, m1 = -0.714;
    const f = x => m1*x + 0.5*(m0-m1)*(Math.abs(x+1) - Math.abs(x-1));
    const dx = alpha*(y-x-f(x));
    const dy = x - y + z;
    const dz = -beta*y;
    return [dx, dy, dz];
  }

  newton(x,y,z){
    const [alpha, beta, lambda] = this.params.get("newton");
    const dx = -alpha*x +y+10*y*z;
    const dy = -x-0.4*y+5*x*z;
    const dz = beta*z-5*x*y;
    return [dx, dy, dz];
    
  }

  shimizu(x,y,z){
    const [alpha, beta, c] = this.params.get("shimizu");
    const dx = y;
    const dy = x*(1-z)-alpha*y;
    const dz = -beta*z + x**2;
    return [dx, dy, dz];
  }

  arneodo(x,y,z){
    const [alpha, beta, lambda] = this.params.get("arneodo");
    const dx = y
    const dy = z;
    const dz = -alpha*x-beta*y-z+lambda*x**3;
    return [dx, dy, dz];
  }

  threeScroll(x,y,z){
    const [a, b, c] = this.params.get("threeScroll");
    const d = 1.5, e = 10;
    const dx = a*(y-x)+d*z;
    const dy = b*x -x*z + c*y;
    const dz = x*y - e*z;
    return [dx, dy, dz];
  }

  dequanLi(x,y,z){
    const [a, b, c] = this.params.get("dequanLi");
    const d=0.65, e = 55, f = 20;
    const dx = a*(y-x)+c*x*z;
    const dy = e*x+f*y-x*z;
    const dz = b*z+x*y-d*x**2;
    return [dx, dy, dz];
  }
  // Euler method is currently archived, switched to rk4 below
  eulerStep(x, y, z) {
    const fn = this.options.get(this.choice);
    const scale = this.timeScales.get(this.choice);
    const [dx, dy, dz] = fn(x, y, z);
    return [x + dx * dt * scale, y + dy * dt * scale, z + dz * dt * scale];
  }

  rk4Step(x, y, z) {
    const fn = this.options.get(this.choice);              // derivative: (x,y,z) -> [dx,dy,dz]
    const scale = this.timeScales.get(this.choice) ?? 1;   // same as in eulerStep
    const h = dt * scale;

    const k1 = fn(x, y, z);

    const k2 = fn(
      x + 0.5 * h * k1[0],
      y + 0.5 * h * k1[1],
      z + 0.5 * h * k1[2]
    );

    const k3 = fn(
      x + 0.5 * h * k2[0],
      y + 0.5 * h * k2[1],
      z + 0.5 * h * k2[2]
    );

    const k4 = fn(
      x + h * k3[0],
      y + h * k3[1],
      z + h * k3[2]
    );

    const dx = (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]) / 6;
    const dy = (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]) / 6;
    const dz = (k1[2] + 2*k2[2] + 2*k3[2] + k4[2]) / 6;

    return [x + h * dx, y + h * dy, z + h * dz];
  }
}

const system = new ThreeDimensionalSystems();

const MAXLEN = maxTrailPoints * 3;
const TRAIL_STRIDE = 2;


//const buffer = new Float32Array(maxTrailPoints);

// function updateTrailLine2(obj, arr, geom) {
//   arr.push(obj.position.x, obj.position.y, obj.position.z);
//   if (arr.length > MAXLEN) arr.splice(0, 3);
//   const geometry = new THREE.LineGeometry();
//     const pos = new Float32Array(arr);
//     geom.setPositions(pos);
//     geom.attributes.instanceStart.needsUpdate = true;
//     geom.attributes.instanceEnd.needsUpdate = true;


    
//   geom.computeBoundingSphere();

// }
const maxLen = maxTrailPoints * 3;

function updateTrailLine2(obj, arr, geom) {
  // push new head
  arr.push(obj.position.x, obj.position.y, obj.position.z);
  // drop one old point to keep the window fixed
  if (arr.length > maxLen) arr.splice(0, 3);
  const pos = new Float32Array(arr);
  geom.setPositions(pos);

  const segs = Math.max(0, pos.length / 3 - 1);
  geom.instanceCount = segs;  // ← tells Line2 how many to draw
  geom.setDrawRange(0, segs); // fallback for older builds

  if (segs > 0) geom.computeBoundingSphere();
}



function reset(){
  const scale = system.renderScale.get(system.choice);
  [x1, y1, z1] = system.initialConditions.get(system.choice)[0];
  [x2, y2, z2] = system.initialConditions.get(system.choice)[1];
  [x3, y3, z3] = system.initialConditions.get(system.choice)[2];
  [x4, y4, z4] = system.initialConditions.get(system.choice)[3];
  [x5, y5, z5] = system.initialConditions.get(system.choice)[4];
  //[x6, y6, z6] = system.initialConditions.get(system.choice)[5];

  // clearTrailLine2(t1, g1);
  // clearTrailLine2(t2, g2);
  // clearTrailLine2(t3, g3);
  // clearTrailLine2(t4, g4);
  ball1.position.set(x1*scale, y1*scale, z1*scale);
  ball2.position.set(x2*scale, y2*scale, z2*scale);
  ball3.position.set(x3*scale, y3*scale, z3*scale);
  ball4.position.set(x4*scale, y4*scale, z4*scale);
  ball5.position.set(x5*scale, y5*scale, z5*scale);
  seedTrail(t1, g1, ball1.position, 0);
  seedTrail(t2, g2, ball2.position, 1);
  seedTrail(t3, g3, ball3.position, 2);
  seedTrail(t4, g4, ball4.position, 3);
  seedTrail(t5, g5, ball5.position, 4);
  //clearTrailLine2(t5, g5);
  //clearTrailLine2(t6, g6);

  //document.getElementById("simulation-speed").value = Math.floor(stepsPerFrame/5);
  //document.getElementById("simulation-speed-value").textContent = Math.floor(stepsPerFrame/5);
  running = true;
  document.getElementById("pause-btn").textContent = "Pause";
}

const palLength = Object.keys(palettes).length;
const keys = Object.keys(palettes);

function updateColor(){
      cycleColor++;
      if (cycleColor >= palLength){
        cycleColor = cycleColor%palLength;
      }
      const selected = cycleColor;
      const key = keys[selected];
      const colors = palettes[key] || palettes.r;


      ball1.material.color.set(colors[0]);
      ball2.material.color.set(colors[1]);
      ball3.material.color.set(colors[2]);
      ball4.material.color.set(colors[3]);
      ball5.material.color.set(colors[4]);
      //ball6.material.color.set(colors[5]);

      m1.color.set(colors[0]);
      m2.color.set(colors[1]);
      m3.color.set(colors[2]);
      m4.color.set(colors[3]);
      m5.color.set(colors[4]);
      //m6.color.set(colors[5]);

      document.getElementById("palette-select").value = key;
    }


function animate() {
  animationId = requestAnimationFrame(animate);
  if (frameCount++ % 1 !== 0) return;


  if(running){
    simulationTime += dt;
          // Scale down for rendering
    const scale = system.renderScale.get(system.choice);
    for(let i = 0; i < stepsPerFrame; i++) {

      // Euler integration
      [x1,y1,z1] = system.rk4Step(x1,y1,z1);
      [x2,y2,z2] = system.rk4Step(x2,y2,z2);
      [x3,y3,z3] = system.rk4Step(x3,y3,z3);
      [x4,y4,z4] = system.rk4Step(x4,y4,z4);
      [x5,y5,z5] = system.rk4Step(x5, y5, z5);

      //[x6, y6, z6] = system.eulerStep(x6, y6, z6);

      ball1.position.set(x1 * scale, y1 * scale, z1 * scale);
      ball2.position.set(x2 * scale, y2 * scale, z2 * scale);
      ball3.position.set(x3 * scale, y3 * scale, z3 * scale);
      ball4.position.set(x4 * scale, y4 * scale, z4 * scale);
      ball5.position.set(x5 * scale, y5 * scale, z5 * scale);
      //ball6.position.set(x6 * scale, y6 * scale, z6 * scale);
    //updateTrail(ball3.position, trailPositions3, trailGeometry3);
      updateTrailLine2(ball1, t1, g1);
      updateTrailLine2(ball2, t2, g2);
      updateTrailLine2(ball3, t3, g3);
      updateTrailLine2(ball4, t4, g4);
      updateTrailLine2(ball5, t5, g5);
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

function seedTrail(arr, geom, p, index) {
  arr.length = 0;
  for (let i = 0; i < maxTrailPoints; i++) {
    arr.push(p.x, p.y, p.z);
  }
  geom.setPositions(new Float32Array(arr));
  geom.maxInstancedCount = 3*maxTrailPoints;
}


document.addEventListener("DOMContentLoaded", () => {

  const USE_FAT_LINES = (userOS === 'apple'); // macOS, iOS, iPadOS → Line2

  const canvas3d = document.getElementById("canvas3d");


  const width  = canvas3d.clientWidth;
  const height = canvas3d.clientHeight || 1;

  scene3d = new THREE.Scene();
  camera3d = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera3d.position.set(0.25, 0.75, 4);
  camera3d.up.set(0, 1, 0);
  camera3d.lookAt(0, 0, 0);


  renderer3d = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true, powerPreference: 'high-performance' });
  //renderer3d.outputColorSpace = THREE.SRGBColorSpace;     
  //renderer3d.toneMapping = THREE.ACESFilmicToneMapping;   
  //renderer3d.toneMappingExposure = 1.15;                  // try 1.1–1.3
  renderer3d.outputColorSpace = THREE.SRGBColorSpace;
  renderer3d.toneMapping = THREE.NoToneMapping;           // cheaper, clean
  renderer3d.toneMappingExposure = 1.0;
  const DPR_CAP = 2;                      
  renderer3d.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  //resizeCanvasToDisplaySize(canvas3d, renderer3d, camera3d);


function resize() {
  const wCss = canvas3d.clientWidth || 1;
  const hCss = canvas3d.clientHeight || 1;

  renderer3d.setSize(wCss, hCss, false);           // draw buffer = CSS * DPR
  camera3d.aspect = wCss / hCss;
  camera3d.updateProjectionMatrix();

  const dpr = renderer3d.getPixelRatio();          // actual DPR in use
  const wDev = Math.max(1, Math.floor(wCss * dpr));
  const hDev = Math.max(1, Math.floor(hCss * dpr));

  [m1, m2, m3, m4, m5].forEach(m => {
    m.resolution.set(wDev, hDev);                  // device pixels
    m.linewidth = 1.3; //6 / hDev;                        // ~6px line
  });
}


  window.addEventListener("resize", resize, { passive: true });

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas3d.parentElement); // or a higher-level container
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
  controls.rotateSpeed = 2.1;
  controls.zoomSpeed = 2.25;
  controls.panSpeed = 0.8;
  controls.dynamicDampingFactor = 0.3;
  controls.noPan = false;
  controls.minDistance = 0.25;
  controls.maxDistance = 15;
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
  //scene3d.add(ball6);
  
  [x1, y1, z1] = system.initialConditions.get(system.choice)[0];
  [x2, y2, z2] = system.initialConditions.get(system.choice)[1];
  [x3, y3, z3] = system.initialConditions.get(system.choice)[2];
  [x4, y4, z4] = system.initialConditions.get(system.choice)[3];
  [x5, y5, z5] = system.initialConditions.get(system.choice)[4];
  [x6, y6, z6] = system.initialConditions.get(system.choice)[5];

  const scale = system.renderScale.get(system.choice);


  ball1.position.set(x1*scale, y1*scale, z1*scale);
  ball2.position.set(x2*scale, y2*scale, z2*scale);
  ball3.position.set(x3*scale, y3*scale, z3*scale);
  ball4.position.set(x4*scale, y4*scale, z4*scale);
  ball5.position.set(x5*scale, y5*scale, z5*scale);
  //ball6.position.set(x6, y6, z6);
  scene3d.add(trailLine1);
  scene3d.add(trailLine2);
  scene3d.add(trailLine3);
  scene3d.add(trailLine4);
  scene3d.add(trailLine5);
  //scene3d.add(trailLine6);


  //[trailLine1, trailLine2, trailLine3, trailLine4, trailLine5].forEach(l => l.frustumCulled = false);
  resize();

// function primeLine(geom, obj) {
//   const p = obj.position;
//   let temp = [];

//   for(let i = 0; i < 3*maxTrailPoints; i++){
//     temp.push(p.x+ i/100, p.y, p.z);
//   }
//   const pos = new Float32Array(temp);
//   temp = [];
//   geom.setPositions(pos);
//   geom.instanceCount = 3*maxTrailPoints;   // 1 segment
//   geom.setDrawRange(0, 3*maxTrailPoints);
//   geom.computeBoundingSphere();
// }


//   primeLine(g1, ball1);
//   primeLine(g2, ball2);
//   primeLine(g3, ball3);
//   primeLine(g4, ball4);

seedTrail(t1, g1, ball1.position, 0);
seedTrail(t2, g2, ball2.position, 1);
seedTrail(t3, g3, ball3.position, 2);
seedTrail(t4, g4, ball4.position, 3);
seedTrail(t5, g5, ball5.position, 4);
//seedTrail(t6, g6, ball6.position);

  //ball3.position.set(7.5, -2, 27); // Initial position for third ball

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

    param1Value.textContent = p1Val.toFixed(2);
    param2Value.textContent = p2Val.toFixed(2);
    param3Value.textContent = p3Val.toFixed(2);

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
    stepsPerFrame = parseInt(speed);
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
    param1Value.textContent = p1Val.toFixed(2);
    param2Value.textContent = p2Val.toFixed(2);
    param3Value.textContent = p3Val.toFixed(2);
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
      clearInterval(colorInterval);
      colorInterval = null;
      colorCycleBtn.textContent = "Cycle Colors"


      const selected = e.target.value;
      cycleColor = keys.indexOf(selected);

      const colors = palettes[selected] || palettes.r;

      ball1.material.color.set(colors[0]);
      ball2.material.color.set(colors[1]);
      ball3.material.color.set(colors[2]);
      ball4.material.color.set(colors[3]);
      ball5.material.color.set(colors[4]);
      ball6.material.color.set(colors[5]);

      m1.color.set(colors[0]);
      m2.color.set(colors[1]);
      m3.color.set(colors[2]);
      m4.color.set(colors[3]);
      m5.color.set(colors[4]);
      m6.color.set(colors[5]);

    });

    const pauseBtn = document.getElementById("pause-btn");

    pauseBtn.addEventListener("click", (e) => {
      running = !running;

      if(running){
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

    controls.reset();  // full reset of rotation/quaternion

  });

  document.getElementById('screenshotBtn').addEventListener('click', () => {
  // Force a render just before screenshot
  renderer3d.render(scene3d, camera3d);
  const image = renderer3d.domElement.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'phaseSpace-sc.png';
  link.href = image;
  link.click();
});

document.getElementById("bottomBackBtn").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

const colorCycleBtn = document.getElementById("colorCycle");
colorCycleBtn.addEventListener("click", () => {
  if (colorInterval === null){
    console.log("switching to color cycle");
    colorInterval = setInterval(updateColor, 3000); //every 3s
    colorCycleBtn.textContent = "Stop Cycling";
  }
  else{
    clearInterval(colorInterval);
    colorInterval = null;
    colorCycleBtn.textContent = "Cycle Colors"

  }


});

  animate();
});
