// Three-body simulation with simple Euler integration and collisions

let ctx;
let G = 50; // Gravitational constant scaled for visualization
//let's let user pick from 3 modes, slow, normal, and fast
//slow can be 3, normal: 50, and fast 250
const dt = 0.1;
let frameCount = 0;
let simulationTime = 0;
let animationId = null;
let running = false;
let currentPlanet = "earth";
let bodies = [];
let particles = [];
let width;
let height;
let isDragging = false;
let planetsInSimulation = [];


/*archived data
const planets = {
  mars: new Image(),
  earth: new Image(),
  jupiter: new Image(),
  saturn: new Image(),
  neptune: new Image(),
  moon: new Image(),
  sun: new Image()
};

planets.moon.src = "images/moon.png";
planets.sun.src = "images/sun.png";
planets.earth.src = "images/earth.png";
planets.jupiter.src = "images/jupiter.png";
planets.saturn.src = "images/saturn.png";
planets.mars.src = "images/mars.png";
planets.neptune.src = "images/neptune.png";

const planetSizes = {
  mars: 40,
  earth: 60,
  jupiter: 120,
  saturn: 95,
  neptune: 80,
  moon: 30,
  sun: 275
};

const planetMasses = {
  mars: 0.107,
  earth: 1,
  jupiter: 317.8,
  saturn: 95.2,
  neptune: 17.1,
  moon: 0.0123,
  sun: 333000
};
*/
const celestialObjects = new Map();
//0.0123/333
//i scaled down masses from 333,000 to 1000 (max) so divided by 333
celestialObjects.set('sun', {stateVector: {}, size: 225, mass: 1000, inSimulation: false, image: Object.assign(new Image(), {src: "images/sun.png"})});
celestialObjects.set('earth', {stateVector: {}, size: 50, mass: 1/1000, inSimulation: false, image: Object.assign(new Image(), {src: "images/earth.png"})});
celestialObjects.set('moon', {stateVector: {}, size: 15, mass: 1e-7, gravitationalBoost: 100, inSimulation: false, image: Object.assign(new Image(), {src: "images/moon.png"})});
celestialObjects.set('mars', {sateVector: {}, size: 27, mass: 0.107/1000, inSimulation: false, image: Object.assign(new Image(), {src: "images/mars.png"})});
celestialObjects.set('jupiter', {stateVector: {}, size: 87, mass: 317.8/1000, inSimulation: false, image: Object.assign(new Image(), {src: "images/jupiter.png"})});
celestialObjects.set('saturn', {sateVector: {}, size: 110, mass: 95.2/1000, inSimulation: false, image: Object.assign(new Image(), {src: "images/saturn.png"})});
celestialObjects.set('neptune', {stateVector: {}, size: 65, mass: 17.1/1000, inSimulation: false, image: Object.assign(new Image(), {src: "images/neptune.png"})});

let sun = {stateVector: {}, size: 225, mass: 1000, inSimulation: true, image: Object.assign(new Image(), {src: "images/sun.png"})};
/*equations of motion:
For n-bodies, we have n-second order vector differential equations. Usually, vectors for 3D,
but I am simplifying and only considering planar trajectories so no z-dimension or forces.
So we have n-2nd order vector equations made up of two ODEs themselves. So, we actually
have 2*n second order ODEs, which break into 2*2*n = 4n first order ODEs.
Each body has 2 ODEs, and both are second order so can be broken into 2 ODE in place of that one.
So we have 4 ODEs per body. Each ODE depends on the state of every other body.

*/
let cnt = 0;
let multiplier = 1;


function computeAcceleration(x, y, selfIndex) {
  let ax = 0;
  let ay = 0;

  for (let j = 0; j < planetsInSimulation.length; j++) {
    if (j === selfIndex) continue;
    const other = planetsInSimulation[j];

    const dx = other.stateVector.x - x;
    const dy = other.stateVector.y - y;
    const softening = 1; 
    const distSq = dx * dx + dy * dy + softening * softening;
    const dist = Math.sqrt(distSq);



    const force = G * other.mass / (distSq * dist); // equivalent to Gm / r^3

    ax += force * dx;
    ay += force * dy;
  }

  return { ax, ay };
}

function updatePlanetsRK4() {
  for (let i = 0; i < planetsInSimulation.length; i++) {
    const p = planetsInSimulation[i];
    const { x, y, Xvelocity: vx, Yvelocity: vy } = p.stateVector;

    // k1
    const a1 = computeAcceleration(x, y, i);
    const k1vx = a1.ax * dt;
    const k1vy = a1.ay * dt;
    const k1x = vx * dt;
    const k1y = vy * dt;

    // k2
    const a2 = computeAcceleration(x + k1x / 2, y + k1y / 2, i);
    const k2vx = a2.ax * dt;
    const k2vy = a2.ay * dt;
    const k2x = (vx + k1vx / 2) * dt;
    const k2y = (vy + k1vy / 2) * dt;

    // k3
    const a3 = computeAcceleration(x + k2x / 2, y + k2y / 2, i);
    const k3vx = a3.ax * dt;
    const k3vy = a3.ay * dt;
    const k3x = (vx + k2vx / 2) * dt;
    const k3y = (vy + k2vy / 2) * dt;

    // k4
    const a4 = computeAcceleration(x + k3x, y + k3y, i);
    const k4vx = a4.ax * dt;
    const k4vy = a4.ay * dt;
    const k4x = (vx + k3vx) * dt;
    const k4y = (vy + k3vy) * dt;

    // Final position and velocity update
    p.stateVector.x += (k1x + 2 * k2x + 2 * k3x + k4x) / 6;
    p.stateVector.y += (k1y + 2 * k2y + 2 * k3y + k4y) / 6;
    p.stateVector.Xvelocity += (k1vx + 2 * k2vx + 2 * k3vx + k4vx) / 6;
    p.stateVector.Yvelocity += (k1vy + 2 * k2vy + 2 * k3vy + k4vy) / 6;

    console.log("new state: ", p.stateVector.x, ", ", p.stateVector.y);
  }
}


function euclideanDistance(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}

//euler's method right now, will use RK4 in future
function updatePlanets(){
  //loop through each body
  for (let i = 0; i < planetsInSimulation.length; i++){
    //for each body, we have 2 ODEs for x, and 2 ODEs for y (acceleration and velocity)
    //for each body, the general ODE is: 
    //r'' = -G*(sum(m_k(r_i - r_k)/(dist(r_i, r_k)^n)))
    const bodyI = planetsInSimulation[i];

    const xi = bodyI.stateVector.x;
    const yi = bodyI.stateVector.y;

    let xSumofForces = 0;
    let ySumofForces = 0;
    
    for(let j = 0; j < planetsInSimulation.length; j++){
      if (i===j) continue;

      const bodyJ = planetsInSimulation[j];
      const xj = bodyJ.stateVector.x;
      const yj = bodyJ.stateVector.y;
      const mass = bodyJ.mass;
      const dist = euclideanDistance(xi, yi, xj, yj)

      let dx = mass*(xi - xj)/(dist**3 + 1e-6); //adding 1e-6 avoid a potential divide by 0 error
      let dy = mass*(yi-yj)/(dist**3 + 1e-6);

      xSumofForces += dx;
      ySumofForces += dy;
    }
    xSumofForces = -G*xSumofForces;
    ySumofForces = -G*ySumofForces;
    //acceleration update
    bodyI.stateVector.Xacceleration = xSumofForces;
    bodyI.stateVector.Yacceleration = ySumofForces;
    //
    //velocity update
    bodyI.stateVector.Xvelocity = bodyI.stateVector.Xvelocity + bodyI.stateVector.Xacceleration*dt;
    bodyI.stateVector.Yvelocity = bodyI.stateVector.Yvelocity + bodyI.stateVector.Yacceleration*dt;
    //
    //position update
    bodyI.stateVector.x = bodyI.stateVector.x + bodyI.stateVector.Xvelocity*dt;
    bodyI.stateVector.y = bodyI.stateVector.y + bodyI.stateVector.Yvelocity*dt;
    console.log("new state: ", bodyI.stateVector);
  }

}

function animate(){
  cnt++;
  if (cnt%360 === 0){
    cnt = 0;
    multiplier++;
    document.getElementById("time-display").textContent = "Month: " + (Math.floor(multiplier)).toString();
  }
  updatePlanetsRK4();
  drawPlanets();
  //console.log("running......");
  animationId = requestAnimationFrame(animate);
}




function createCelestialInstance(name) {
  const prototype = celestialObjects.get(name);
  if (!prototype) return null;
  return {
    ...prototype // shallow copy all properties
    // stateVector: { ...stateVector }, // clone or initialize new state vector
    // image: Object.assign(new Image(), { src: prototype.image.src }) // ensure a separate Image instance
  };
}

function drawPlanets(){

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  for(let i = 0; i < planetsInSimulation.length; i++){
    const planet = planetsInSimulation[i];
    //console.log(planet.image.src);
    ctx.drawImage(
      planet.image,
      planet.stateVector.x + width/2 - Math.floor(planet.size/2),
      -planet.stateVector.y + height/2 - Math.floor(planet.size/2),
      planet.size,
      planet.size
    );

  }
}

function addPlanetToSimulation(celestialBody, xCoord, yCoord, isSun) {

  if (!isSun){
    console.log("adding non-sun");
    const body = createCelestialInstance(celestialBody); 

    //convert canvas coords to x,y cartesian coords
    //we want x = 0 to correspond to width/2 (the middle, so our graph is centered in the middle of the canvas)

    let newX = xCoord - width/2;
    let newY = -yCoord + height/2;

    let x2 = sun.stateVector.x;
    let y2 = sun.stateVector.y;

    const dx = newX - x2;
    const dy = newY - y2;
    const r = Math.sqrt(dx * dx + dy * dy);


    // Compute perpendicular orbital velocity
    const vMag = Math.sqrt(G * sun.mass / r);
    const vx = -vMag * (dy / r);
    const vy =  vMag * (dx / r);


    // Store for future recomputation
    const fixedBody = {
      stateVector: {
        x: newX,
        y: newY,
        Xacceleration: 0,
        Yacceleration: 0,
        Xvelocity: vx,
        Yvelocity: vy
      },
      initialOrbit: {
        centralMass: sun.mass,
        dx: dx,
        dy: dy,
        radius: r
      },
      size: body.size,
      mass: body.mass,
      inSimulation: true,
      image: Object.assign(new Image(), { src: body.image.src })
    };
    // Wait for image to load before drawing
    console.log("adding: ", fixedBody);
    fixedBody.image.onload = () => {
      planetsInSimulation.push(fixedBody);
      drawPlanets();
    };
      // Optional: fallback in case image fails
  fixedBody.image.onerror = () => {
    console.error("Failed to load image for:", celestialBody);
    };
  }
  else{
    console.log("adding sun")
    planetsInSimulation.push(sun);
    drawPlanets();
  }

}


function startSimulation() {
  animate();
}

function resetSimulation() {
  running = false;
  if (animationId !== null){
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  simulationTime = 0;
  frameCount = 0;
  planetsInSimulation = []
  sun.stateVector.x = 0;
  sun.stateVector.y = 0;
  sun.stateVector.Xacceleration = 0;
  sun.stateVector.Yacceleration = 0;
  sun.stateVector.Xvelocity = 0;
  sun.stateVector.Yvelocity = 0;
  addPlanetToSimulation(sun, sun.stateVector.x, sun.stateVector.y, true);
  document.getElementById("modeSelect").disabled = false;
  cnt = 0;
  multiplier = 1;
  document.getElementById("time-display").textContent = "Month: 1";
  document.getElementById("modeSelect").value = "50";
  G = 50;

  //drawPlanets()
  document.getElementById("start-simulation").textContent = "Click to Start Simulation";
}


document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("simCanvas");
  ctx = canvas.getContext("2d");
  height = ctx.canvas.height;
  width = ctx.canvas.width;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  sun.stateVector.x = 0;
  sun.stateVector.y = 0;
  sun.stateVector.Xacceleration = 0;
  sun.stateVector.Yacceleration = 0;
  sun.stateVector.Xvelocity = 0;
  sun.stateVector.Yvelocity = 0;
  addPlanetToSimulation(sun, sun.stateVector.x, sun.stateVector.y, true);

  document.getElementById("modeSelect").addEventListener("change", function (e) {
  G = parseFloat(e.target.value);
});



  document.querySelectorAll('#planet-palette img').forEach(img => {
  img.addEventListener('dragstart', (e) => {
    
    e.dataTransfer.setData('text/plain', e.target.dataset.planet);

    e.dataTransfer.setDragImage(e.target, e.target.width/2, e.target.height/2);

  });
});
  canvas.addEventListener('dragover', (e) => e.preventDefault());

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const name = e.dataTransfer.getData('text/plain');

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('Dropped:', name, " at: ", x, ",", y);
    document.getElementById("modeSelect").disabled = true;
    addPlanetToSimulation(name, x, y, false);
});
  document.getElementById("simCanvas").addEventListener("mousedown", () =>{
    if (isDragging){
    }
    else{
      isDragging = true;
    }
  });

  document.getElementById("simCanvas").addEventListener("mousemove", () => {
      if (isDragging){
        console.log("dragging on canvas");
      }
  });


   document.getElementById("simCanvas").addEventListener("mouseup", () =>{
    isDragging = false;
  });


  document.getElementById("start-simulation").addEventListener("click", () => {
    const btn = document.getElementById("start-simulation");
    if (!running) {
      running = true;
      btn.textContent = "Pause";
      startSimulation();
    } else {
      running = false;
      cancelAnimationFrame(animationId);
      btn.textContent = "Resume";
    }
  });

  document.getElementById("reset").addEventListener("click", () => {
    const btn = document.getElementById("start-simulation");
    btn.textContent = "Click to Start Simulation";
    resetSimulation();
  });
});