


let sigma = 10;
let rho = 28;
let beta = 8/3;
let ctx;
let currentSprite = "kodie";
let point = {x: 1, y: 1, z: 1}
const dt = 0.005;
const trailMap = new Map(); // maps "x,y" → visit count
let simulationTime = 0;
let centerZ = 25;  // default projection center for Z axis


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

  function animate() {
    requestAnimationFrame(animate); // 🔁 keep looping
  
    frameCount++;
    if (frameCount % 2 !== 0) return; // optional slowdown
  
    point = lorenzStep(point, dt);
    simulationTime += dt;
    updateTimeDisplay();
    drawLorenzPoint(point); // 2D canvas

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
        const canvas = document.getElementById("simCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    
    
  
    handleSpriteChange(); // draw the default sprite
    animate();
  
    // Optionally: add other init functions
});
