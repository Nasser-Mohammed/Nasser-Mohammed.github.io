
let currentPlanet = "earth";
let ctx;
const G = 6.67*Math.pow(10, -11);
let simulationStarted = false;
const dt = 0.005;
let point = {x: 150, y: 150}
let frameCount = 0;
let simulationTime = 0;
let animationId = null;
let running = false;


let spawnedPlanetPos = {}

const planets = {
    mars: new Image(),
    earth: new Image(),
    jupiter: new Image(),
    saturn: new Image(),
    neptune: new Image(),
    moon: new Image(),
    sun: new Image()
}
const planetSizes = {
    mars: 20,
    earth: 25,
    jupiter: 40,
    saturn: 35,
    neptune: 35,
    moon: 17,
    sun: 90
}

planets.moon.src = "moon.png";
planets.sun.src = "sun.png";
planets.earth.src = "earth.png";
planets.jupiter.src = "jupiter.png";
planets.saturn.src = "saturn.png";
planets.mars.src = "mars.png";
planets.neptune.src = "neptune.png";


function startSimulation(){
    animate();
    
}

function handlePlanetChange(){
    const select = document.getElementById("planet-select");
    currentPlanet = select.value;
    //console.log(currentPlanet);
  
    // Update image preview
    document.getElementById("planet-preview").src = `${currentPlanet}.png`;
    const canvas = document.getElementById("simCanvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    



    ctx.drawImage(planets.sun, spawnedPlanetPos.sun[0], spawnedPlanetPos.sun[1], planetSizes["sun"], planetSizes["sun"]);
    ctx.drawImage(planets.moon, spawnedPlanetPos.moon[0], spawnedPlanetPos.moon[1], planetSizes["moon"], planetSizes["moon"]);
    ctx.drawImage(planets[currentPlanet], spawnedPlanetPos.currentPlanet[0], spawnedPlanetPos.currentPlanet[1], planetSizes[currentPlanet], planetSizes[currentPlanet]);
  }


function drawPlanet(){
    const canvas = document.getElementById("simCanvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const planetImg = planets[currentPlanet];
    if (planetImg && planetImg.complete) {
      const planetSize = planetSizes[currentPlanet];
      ctx.drawImage(planets.sun, spawnedPlanetPos.sun[0], spawnedPlanetPos.sun[1], planetSizes["sun"], planetSizes["sun"]);
      ctx.drawImage(planets.moon, spawnedPlanetPos.moon[0], spawnedPlanetPos.moon[1], planetSizes["moon"], planetSizes["moon"]);
      ctx.drawImage(planets[currentPlanet], spawnedPlanetPos.currentPlanet[0], spawnedPlanetPos.currentPlanet[1], planetSizes[currentPlanet], planetSizes[currentPlanet]);
    }

}


function timeStep(r1, r2, r3){

}



  function animate() {
    if (!running) return;
    animationId = requestAnimationFrame(animate);
  
    frameCount++;
  
    const canvas = document.getElementById("simCanvas");
    const ctx = canvas.getContext("2d");
    newPoint1 = [Math.floor(Math.random()*650), Math.floor(Math.random()*450)];
    newPoint2 = [Math.floor(Math.random()*650), Math.floor(Math.random()*450)];
    newPoint3 = [Math.floor(Math.random()*650), Math.floor(Math.random()*450)];
    spawnedPlanetPos.sun = newPoint1;
    spawnedPlanetPos.moon = newPoint2;
    spawnedPlanetPos.currentPlanet = newPoint3;
    
    if (frameCount % 40 !== 0) return; // Only update every 10th frame
    drawPlanet();

  }


  function drawCanvas() {
    if (!ctx) return;
    
    const planetImg = planets[currentPlanet];  // FIXED: use 'sprites' not 'animalImages'
    if (!planetImg || !planetImg.complete) return;
    
    }


document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("simCanvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let sunPoint = [Math.floor(Math.random()*630), Math.floor(Math.random()*450)];
    ctx.drawImage(planets.sun, sunPoint[0], sunPoint[1], planetSizes["sun"], planetSizes["sun"]);
    let moonPoint = [Math.floor(Math.random()*650), Math.floor(Math.random()*450)];
    ctx.drawImage(planets.moon, moonPoint[0], moonPoint[1], planetSizes["moon"], planetSizes["moon"]);
    point = [Math.floor(Math.random()*650), Math.floor(Math.random()*450)]
    ctx.drawImage(planets[currentPlanet], point[0], point[1], planetSizes[currentPlanet], planetSizes[currentPlanet]);
    spawnedPlanetPos.sun = sunPoint;
    spawnedPlanetPos.moon = moonPoint;
    spawnedPlanetPos.currentPlanet = point;
    //console.log(spawnedPlanetPos);


    document.getElementById("add-planet").addEventListener("click", (e) => {
        document.getElementById("add-planet").textContent = "Added";
      });

    document.getElementById("start-simulation").addEventListener("click", (e) => {
        const btn = document.getElementById("start-simulation");
        if (!running){
            simulationTime = 0;
            running = true;
            startSimulation();
            btn.textContent = "Pause";
        }
        else{
            running = false;
            cancelAnimationFrame(animationId);
            btn.textContent = "Resume";
        }
        
        startSimulation();
    });

});