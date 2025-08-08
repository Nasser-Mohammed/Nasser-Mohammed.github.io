
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
  r: ["#ff1a00", "#d96b10", "#b35328", "#ffe93a", "#ff0000", "#ff9320"],       // reddish/orange/yellow
  bg: ["#0045FF", "#00b50f", "#1a5fff", "#00c715", "#007aff", "#5aff00"],
  rgb: ["#a00000", "#00b52b", "#0066ff", "#00a9ff", "#b00000", "#4cff19"],     // red, brighter green, pure blue
  alien: ["#8534a0", "#ff4d78", "#16d1ac", "#c09ce8", "#e0005c", "#1c6ec2"],
  cyberpunk: ["#ff00ff", "#00ffff", "#ff6600", "#ff0044", "#00ffaa", "#2200ff"],
  blue: ["#0039e1", "#0a4dbd", "#3b68e2", "#4a50d6", "#189ac1", "#0044d1"],
  red: ["#e60000", "#ff1e1e", "#ff3326", "#8b0000", "#5a0000", "#b53030"],
  green: ["#00f516", "#1aff3f", "#1aa328", "#145f0f", "#55f42f", "#16d04a"],
  orange: ["#e27c00", "#d15600", "#ff6e1a", "#b94d00", "#e09414", "#b6731e"],
  sunset: ["#ff5a4d", "#ffae1a", "#ff7d54", "#ff2432", "#ffb92a", "#4b465b"],
  electric: ["#a0e9ff", "#ff9cbf", "#ffd600", "#7e5fff", "#1ae3d6", "#ff5ca8"],
  contrast: ["#e0002a", "#ff4c26", "#1f1c5a", "#129f8b", "#f0c400", "#ffffff"],
  forest: ["#003c3c", "#0092a3", "#00bba1", "#faff7a", "#ff3c1f", "#3f243f"],
  reyna: ["#a93cbc", "#9340d1", "#8b2e3a", "#ff7a7a", "#2a0f4d", "#5c1a3a"],
  lavender: ["#6c2ea1", "#35094d", "#dda2ff", "#3e2c8a", "#8d64a5", "#c2a0ff"],
  pinky: ["#60033f", "#b03c85", "#ff99ee", "#eab9dc", "#b31c73", "#ffbff5"],
  kodie: ["#02083d", "#1c3a85", "#5555e0", "#9ca8e0", "#1a00bf", "#c8d6ff"],
  rainbow: ["#ff0000", "#ff6600", "#ffef00", "#00ff00", "#0000ff", "#8b00ff"]
};


let initColors = palettes.r;

let allGridsVisible = true;


const trailGeometry1 = new THREE.BufferGeometry();
const trailMaterial1 = new THREE.LineBasicMaterial({ color: initColors[0],
  depthTest: true,
  polygonOffset: true,
  polygonOffsetFactor: -1, // pull toward camera
  polygonOffsetUnits: -1});
const trailLine1 = new THREE.Line(trailGeometry1, trailMaterial1);

const trailGeometry2 = new THREE.BufferGeometry();
const trailMaterial2 = new THREE.LineBasicMaterial({ color: initColors[1],
  depthTest: true,
  polygonOffset: true,
  polygonOffsetFactor: -1, // pull toward camera
  polygonOffsetUnits: -1});
const trailLine2 = new THREE.Line(trailGeometry2, trailMaterial2);



let trailSkip = 0; //update every third point on trail

const trailGeometry3 = new THREE.BufferGeometry();
const trailMaterial3 = new THREE.LineBasicMaterial({ color: initColors[2],
  depthTest: true,
  polygonOffset: true,
  polygonOffsetFactor: -1, // pull toward camera
  polygonOffsetUnits: -1}); // Blue
const trailLine3 = new THREE.Line(trailGeometry3, trailMaterial3);

const trailGeometry4 = new THREE.BufferGeometry();
const trailMaterial4 = new THREE.LineBasicMaterial({ color: initColors[3],
  depthTest: true,
  polygonOffset: true,
  polygonOffsetFactor: -1, // pull toward camera
  polygonOffsetUnits: -1}); // Blue
const trailLine4 = new THREE.Line(trailGeometry4, trailMaterial4);

const trailGeometry5 = new THREE.BufferGeometry();
const trailMaterial5 = new THREE.LineBasicMaterial({color: initColors[4],
  depthTest: true,
  polygonOffset: true,
  polygonOffsetFactor: -1, // pull toward camera
  polygonOffsetUnits: -1 }); // Blue
const trailLine5 = new THREE.Line(trailGeometry5, trailMaterial5);

const trailGeometry6 = new THREE.BufferGeometry();
const trailMaterial6 = new THREE.LineBasicMaterial({ color: initColors[5],
  depthTest: true,
  polygonOffset: true,
  polygonOffsetFactor: -1, // pull toward camera
  polygonOffsetUnits: -1}); // Blue
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
      ["chenLee", 1],
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
      ["aizawa", 1.5],
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

    this.initialConditions = new Map([
      ["lorenz", [[1, 1, 1], [2, 3, 4], [2.5,2,3], [1.5, 3, 0], [0.5, 0.9, 1.25], [2, 0.9, 0.75]]],
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

  eulerStep(x, y, z) {
    const fn = this.options.get(this.choice);
    const scale = this.timeScales.get(this.choice);
    const [dx, dy, dz] = fn(x, y, z);
    return [x + dx * dt * scale, y + dy * dt * scale, z + dz * dt * scale];
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
  //document.getElementById("simulation-speed").value = Math.floor(stepsPerFrame/5);
  //document.getElementById("simulation-speed-value").textContent = Math.floor(stepsPerFrame/5);
  running = true;
  document.getElementById("pause-btn").textContent = "Pause";
}

const palLength = Object.keys(palettes).length;
const keys = Object.keys(palettes);
const values = Object.values(palettes);

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
      ball6.material.color.set(colors[5]);

      trailLine1.material.color.set(colors[0]);
      trailLine2.material.color.set(colors[1]);
      trailLine3.material.color.set(colors[2]);
      trailLine4.material.color.set(colors[3]);
      trailLine5.material.color.set(colors[4]);
      trailLine6.material.color.set(colors[5]);
      document.getElementById("palette-select").value = key;
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

      if (trailSkip++ % 3 === 0){
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


  const width  = canvas3d.clientWidth;
  const height = canvas3d.clientHeight || 1;


  scene3d = new THREE.Scene();
  camera3d = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera3d.position.set(0.25, 0.75, 4);
  camera3d.up.set(0, 1, 0);
  camera3d.lookAt(0, 0, 0);


  renderer3d = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true, powerPreference: 'high-performance' });
  renderer3d.outputColorSpace = THREE.SRGBColorSpace;     
  renderer3d.toneMapping = THREE.ACESFilmicToneMapping;   
  renderer3d.toneMappingExposure = 1.15;                  // try 1.1–1.3

  renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  //resizeCanvasToDisplaySize(canvas3d, renderer3d, camera3d);
  
 function resize() {
  const w = canvas3d.clientWidth;
  const h = canvas3d.clientHeight;
  if (h === 0 || w === 0) return; // guard

  renderer3d.setSize(w, h, false);
  camera3d.aspect = w / h;
  camera3d.updateProjectionMatrix();
}

  window.addEventListener("resize", resize, { passive: true });

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas3d.parentElement); // or a higher-level container
  resize();
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
  scene3d.add(ball6);
  ball1.position.set(x1, y1, z1); // Initial position
  ball2.position.set(x2, y2, z2); // Initial position for second ball
  ball3.position.set(x3, y3, z3);
  ball4.position.set(x4, y4, z4);
  ball5.position.set(x5, y5, z5);
  ball6.position.set(x6, y6, z6);

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




  [x1, y1, z1] = system.initialConditions.get(system.choice)[0];
  [x2, y2, z2] = system.initialConditions.get(system.choice)[1];
  [x3, y3, z3] = system.initialConditions.get(system.choice)[2];
  [x4, y4, z4] = system.initialConditions.get(system.choice)[3];
  [x5, y5, z5] = system.initialConditions.get(system.choice)[4];
  [x6, y6, z6] = system.initialConditions.get(system.choice)[5];

  animate();
});
