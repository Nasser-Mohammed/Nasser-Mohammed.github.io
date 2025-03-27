let bunnyCount = 40;
let wolfCount = 9;
let ctx;
let simulationRunning = false;

async function startSimulation() {
  if (!pyodide) await loadPyodideAndPackages();
  if (simulationRunning) return;

  // Read & sanitize input
  bunnyCount = parseInt(document.getElementById("bunny-input").value);
  wolfCount = parseInt(document.getElementById("wolf-input").value);

  if (isNaN(bunnyCount) || bunnyCount < 0) bunnyCount = 0;
  if (isNaN(wolfCount) || wolfCount < 0) wolfCount = 0;

  simulationRunning = true;

  ctx = document.getElementById("simCanvas").getContext("2d");

  updateDisplay();   // show starting counts
  drawCanvas();      // ✅ draw them immediately
  loop();            // start simulation updates
}


async function loop() {
  while (simulationRunning) {
    const [newBunnies, newWolves] = await runPythonStep(bunnyCount, wolfCount);
    bunnyCount = Math.max(0, newBunnies);
    wolfCount = Math.max(0, newWolves);
    updateDisplay();
    drawCanvas();
    await new Promise(r => setTimeout(r, 1000)); // 1 second delay
  }
}

function updateDisplay() {
  document.getElementById("bunny-count").textContent = `Bunnies: ${Math.floor(bunnyCount)}`;
  document.getElementById("wolf-count").textContent = `Wolves: ${Math.floor(wolfCount)}`;
}

function drawCanvas() {
  ctx.clearRect(0, 0, 600, 400);

  for (let i = 0; i < Math.floor(bunnyCount); i++) {
    ctx.drawImage(
      document.querySelector("img[src='bunny.png']"),
      Math.random() * 550,
      Math.random() * 350,
      20,
      20
    );
  }

  for (let i = 0; i < Math.floor(wolfCount); i++) {
    ctx.drawImage(
      document.querySelector("img[src='wolf.png']"),
      Math.random() * 550,
      Math.random() * 350,
      20,
      20
    );
  }
}
