let bunnyCount = 40;
let wolfCount = 9;
let ctx;

let simulationRunning = false;
let simulationPaused = false;
let simulationLoopId = null;

const bunnyImg = new Image();
bunnyImg.src = "bunny.png";

const wolfImg = new Image();
wolfImg.src = "wolf.png";

async function startSimulation() {
  if (!pyodide) await loadPyodideAndPackages();
  if (simulationRunning) return;

  // Get input values
  bunnyCount = parseInt(document.getElementById("bunny-input").value);
  wolfCount = parseInt(document.getElementById("wolf-input").value);

  if (isNaN(bunnyCount) || bunnyCount < 0) bunnyCount = 0;
  if (isNaN(wolfCount) || wolfCount < 0) wolfCount = 0;

  simulationRunning = true;
  simulationPaused = false;

  ctx = document.getElementById("simCanvas").getContext("2d");

  updateDisplay();
  drawCanvas();
  loop();
}

function pauseSimulation() {
  simulationPaused = !simulationPaused;
  const pauseButton = document.querySelector("button[onclick='pauseSimulation()']");
  pauseButton.textContent = simulationPaused ? "Resume" : "Pause";
}

function stopSimulation() {
  simulationRunning = false;
  simulationPaused = false;

  clearInterval(simulationLoopId);
  simulationLoopId = null;

  ctx.clearRect(0, 0, 600, 400);
  document.getElementById("bunny-count").textContent = "Bunnies: 0";
  document.getElementById("wolf-count").textContent = "Wolves: 0";

  const pauseButton = document.querySelector("button[onclick='pauseSimulation()']");
  pauseButton.textContent = "Pause";
}

function loop() {
  if (simulationLoopId) return; // Already running

  simulationLoopId = setInterval(async () => {
    if (!simulationRunning || simulationPaused) return;

    const [newBunnies, newWolves] = await runPythonStep(bunnyCount, wolfCount);
    bunnyCount = Math.max(0, newBunnies);
    wolfCount = Math.max(0, newWolves);
    updateDisplay();
    drawCanvas();
  }, 1000);
}


function updateDisplay() {
  document.getElementById("bunny-count").textContent = `Bunnies: ${Math.floor(bunnyCount)}`;
  document.getElementById("wolf-count").textContent = `Wolves: ${Math.floor(wolfCount)}`;
}

function drawCanvas() {
  if (!ctx || !bunnyImg.complete || !wolfImg.complete) return;

  ctx.clearRect(0, 0, 600, 400);

  for (let i = 0; i < Math.floor(bunnyCount); i++) {
    ctx.drawImage(bunnyImg, Math.random() * 550, Math.random() * 350, 20, 20);
  }

  for (let i = 0; i < Math.floor(wolfCount); i++) {
    ctx.drawImage(wolfImg, Math.random() * 550, Math.random() * 350, 20, 20);
  }
}

// Initial display when page loads
document.addEventListener("DOMContentLoaded", () => {
  bunnyCount = parseInt(document.getElementById("bunny-input").value);
  wolfCount = parseInt(document.getElementById("wolf-input").value);

  if (isNaN(bunnyCount) || bunnyCount < 0) bunnyCount = 0;
  if (isNaN(wolfCount) || wolfCount < 0) wolfCount = 0;

  ctx = document.getElementById("simCanvas").getContext("2d");

  updateDisplay();
  drawCanvas();
});
