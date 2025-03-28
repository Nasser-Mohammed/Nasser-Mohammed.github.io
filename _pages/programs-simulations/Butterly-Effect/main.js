


let sigma = 10;
let rho = 28;
let beta = 8/3;
let ctx;
let currentSprite = "kodie";
let point = {x: 1, y: 1, z: 1}
const dt = 0.01;
const trailMap = new Map(); // maps "x,y" → visit count
let simulationTime = 0;
let centerZ = 25;  // default projection center for Z axis
let dualMode = false;
let dualPaused = false;
let dualStarted = false;

const sprites = {
    bunny: new Image(),
    deer: new Image(),
    wolf: new Image(),
    fox: new Image(),
    kodie: new Image()
  };


  sprites.bunny.src = "bunny.png";
  sprites.deer.src = "deer.png";
  sprites.wolf.src = "wolf.png";
  sprites.fox.src = "fox.png";
  sprites.kodie.src = "kodie.png";


let point1 = null;
let point2 = null;
let trace1 = [];
let trace2 = [];

function drawLorenzPointDual(p1, p2) {
  const canvas = document.getElementById("simCanvas");
  const ctx = canvas.getContext("2d");
  const scale = 6;
  const centerX = 0;
  const xOffset = canvas.width / 2;
  const yOffset = canvas.height / 2;

  // Convert both points
  const cx1 = Math.round(xOffset + (p1.x - centerX) * scale);
  const cy1 = Math.round(yOffset - (p1.z - centerZ) * scale);
  const cx2 = Math.round(xOffset + (p2.x - centerX) * scale);
  const cy2 = Math.round(yOffset - (p2.z - centerZ) * scale);

  trace1.push({ x: cx1, y: cy1 });
  trace2.push({ x: cx2, y: cy2 });

  if (trace1.length > 1000) trace1.shift();
  if (trace2.length > 1000) trace2.shift();

  // Draw trails
  ctx.strokeStyle = "red";
  ctx.beginPath();
  for (let i = 0; i < trace1.length; i++) {
    if (i === 0) ctx.moveTo(trace1[i].x, trace1[i].y);
    else ctx.lineTo(trace1[i].x, trace1[i].y);
  }
  ctx.stroke();

  ctx.strokeStyle = "cyan";
  ctx.beginPath();
  for (let i = 0; i < trace2.length; i++) {
    if (i === 0) ctx.moveTo(trace2[i].x, trace2[i].y);
    else ctx.lineTo(trace2[i].x, trace2[i].y);
  }
  ctx.stroke();

  // Draw balls
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(cx1, cy1, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "cyan";
  ctx.beginPath();
  ctx.arc(cx2, cy2, 4, 0, Math.PI * 2);
  ctx.fill();
}



  function handleSpriteChange() {
    const select = document.getElementById("sprite-select");
    currentSprite = select.value;
  
    // Update image preview
    document.getElementById("sprite-preview").src = `${currentSprite}.png`;
  
    // If you're using this for drawing:
    drawCanvas();
  }


function drawCanvas() {
if (!ctx) return;

const spriteImg = sprites[currentSprite];  // FIXED: use 'sprites' not 'animalImages'
if (!spriteImg || !spriteImg.complete) return;

}

function updateTimeDisplay() {
    const display = document.getElementById("time-display");
    if (display) {
      display.textContent = `Time: ${simulationTime.toFixed(2)}s`;
    }
  }

  let frameCount = 0;

// Modify animation loop
function animate() {
  requestAnimationFrame(animate);

  frameCount++;

  const canvas = document.getElementById("simCanvas");
  const ctx = canvas.getContext("2d");

  if (dualMode) {
    if(!dualPaused){
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    point1 = lorenzStep(point1, dt);
    point2 = lorenzStep(point2, dt);
    simulationTime += dt;
    updateTimeDisplay();
    drawLorenzPointDual(point1, point2);}
  } else {
    point = lorenzStep(point, dt);
    simulationTime += dt;
    updateTimeDisplay();
    drawLorenzPoint(point);
  }
}

  
function drawLorenzPoint(p) {
    const canvas = document.getElementById("simCanvas");
    const ctx = canvas.getContext("2d");
  
    const scale = 6;
    const centerX = 0;
    // 👇 centerZ is now global and adjustable!
    const xOffset = canvas.width / 2;
    const yOffset = canvas.height / 2;

    const cx = Math.round(xOffset + (p.x - centerX) * scale);
    const cy = Math.round(yOffset - (p.z - centerZ) * scale);
  
    // Track trails with color based on visits
    const key = `${cx},${cy}`;
    const count = trailMap.get(key) || 0;
    trailMap.set(key, count + 1);
  
    const alpha = Math.min(0.2 + count * 0.1, 1);
    ctx.fillStyle = `rgba(0, 0, 255, ${alpha})`;
    ctx.fillRect(cx, cy, 2, 2); // tiny trail dot
  
    // 🦋 Draw your butterfly sprite, smaller size
    const spriteImg = sprites[currentSprite];
    if (spriteImg && spriteImg.complete) {
      const spriteSize = 20;
      ctx.drawImage(spriteImg, cx - spriteSize / 2, cy - spriteSize / 2, spriteSize, spriteSize);
    }
  }
function lorenzStep(p, dt){

    const dx = sigma * (p.y - p.x);
    const dy = p.x * (rho - p.z) - p.y;
    const dz = p.x * p.y - beta * p.z;

    return {
        x: p.x + dx * dt,
        y: p.y + dy * dt,
        z: p.z + dz * dt
    };
  }


// Initial display when page loads
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("simCanvas");
    ctx = canvas.getContext("2d");

    document.getElementById("sigma").addEventListener("input", (e) => {
        sigma = parseFloat(e.target.value);
        document.getElementById("sigma-val").textContent = sigma.toFixed(1);
      });
      
      document.getElementById("rho").addEventListener("input", (e) => {
        rho = parseFloat(e.target.value);
        document.getElementById("rho-val").textContent = rho.toFixed(1);
      });
      
      document.getElementById("beta").addEventListener("input", (e) => {
        beta = parseFloat(e.target.value);
        document.getElementById("beta-val").textContent = beta.toFixed(4);
      });



      document.getElementById("preset-select").addEventListener("change", (e) => {
        const preset = e.target.value;
      
        switch (preset) {
          case "classic":
            sigma = 10;
            rho = 28;
            beta = 8 / 3;
            centerZ =25;
            break;
          case "spiral":
            sigma = 14;
            rho = 40;
            beta = 3;
            centerZ=25;
            break;
          case "collapse":
            sigma = 10;
            rho = 8;
            beta = 3;
            centerZ =25
            break;
          case "explode":
            sigma = 16;
            rho = 99;
            beta = 2.5;
            centerZ=85;
            break;
          default:
            return; // no change
        }
      
        // Update sliders and labels
        document.getElementById("sigma").value = sigma;
        document.getElementById("rho").value = rho;
        document.getElementById("beta").value = beta;
      
        document.getElementById("sigma-val").textContent = sigma.toFixed(1);
        document.getElementById("rho-val").textContent = rho.toFixed(1);
        document.getElementById("beta-val").textContent = beta.toFixed(4);
      
        // Reset trajectory to reflect new parameters
        point = { x: 1, y: 1, z: 1 };
        trailMap.clear();
        simulationTime = 0;
        updateTimeDisplay();

          
      
        // Clear the canvas
        const canvas = document.getElementById("simCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });

      document.getElementById("reset-params").addEventListener("click", () => {
        // Reset values
        sigma = 10;
        rho = 28;
        beta = 8 / 3;
      
        // Update sliders
        document.getElementById("sigma").value = sigma;
        document.getElementById("rho").value = rho;
        document.getElementById("beta").value = beta;
      
        // Update displayed values
        document.getElementById("sigma-val").textContent = sigma.toFixed(1);
        document.getElementById("rho-val").textContent = rho.toFixed(1);
        document.getElementById("beta-val").textContent = beta.toFixed(4);
      });

      
      document.getElementById("reset-trajectory").addEventListener("click", () => {
        // Reset the Lorenz state
        point = { x: 1, y: 1, z: 1 };
      
        // Clear the trail
        trailMap.clear();
      
        // Optional: reset simulation time
        simulationTime = 0;
        updateTimeDisplay();
      
        // Optional: wipe canvas instantly (not needed if trail builds over time)
        // Clear the canvas
        const canvas = document.getElementById("simCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Reset dual mode state and button
        dualMode = false;
        dualPaused = false;
        dualStarted = false;
        document.getElementById("double-launch").textContent = "Click to launch two trajectories with similar initial conditions";

      });
    
      document.getElementById("double-launch").addEventListener("click", () => {

        const btn = document.getElementById("double-launch");

        simulationTime = 0;
        updateTimeDisplay();

      if (!dualStarted) {
        dualMode = true;
        dualStarted = true;
        dualPaused = false;
        btn.textContent = "Pause";

        point1 = { x: 1, y: 1, z: 1 };
        point2 = { x: 1.001, y: 1, z: 1 };
        trace1 = [];
        trace2 = [];

        const canvas = document.getElementById("simCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

      } else if (!dualPaused) {
        dualPaused = true;
        btn.textContent = "Resume";
      } else {
        dualPaused = false;
        btn.textContent = "Pause";
      }
    });
  
    handleSpriteChange(); // draw the default sprite
    animate();
  
    // Optionally: add other init functions
});
