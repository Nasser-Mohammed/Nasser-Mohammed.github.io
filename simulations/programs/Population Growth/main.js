

const animalImages = {
  bunny: new Image(),
  deer: new Image(),
  wolf: new Image(),
  fox: new Image()
};

let elapsedTime = 0;
let timerInterval = null;

let alpha = 0.1;
let beta = 0.01;
let gamma = 0.1;
let delta = 0.005;

let flashActive = false;
let flashTimer = null;
let flashMessage = "";

let preyExtinctTime = 0;
let predatorExtinctTime = 0;

const extinctionThreshold = 7; // seconds

let timeChart = null;
let timeData = {
  labels: [],
  datasets: [
    {
      label: "Prey",
      data: [],
      borderColor: "#10b981", // greenish
      fill: false
    },
    {
      label: "Predator",
      data: [],
      borderColor: "#ef4444", // red
      fill: false
    }
  ]
};


let stepCount = 0;
const reintroInterval = 10;     // every 10 steps (7.5 seconds if loop is 750ms)
const preyReintroAmount = 7;    // add 5 prey each time
const predatorReintroAmount = 2; // optional


animalImages.bunny.src = "bunny.png";
animalImages.deer.src = "deer.png";
animalImages.wolf.src = "wolf.png";
animalImages.fox.src = "fox.png";


let currentPrey = "bunny"; // default
let currentPredator = "wolf";
let preyCount = 40;
let predatorCount = 9;
let ctx;

let simulationRunning = false;
let simulationPaused = false;
let simulationLoopId = null;

let graphChart = null;
let graphData = {
  datasets: [{
    label: "Prey vs Predator",
    data: [],
    borderColor: "rgba(75,192,192,1)",
    backgroundColor: "rgba(75,192,192,0.4)",
    pointRadius: 3,
    showLine: true
  }]
};

function initGraph() {
  const ctx = document.getElementById("popGraph").getContext("2d");
  graphChart = new Chart(ctx, {
    type: "scatter",
    data: graphData,
    options: {
      responsive: true,
      interaction: {
        mode: 'none'  // 👈 Prevents clicking/zoom effects
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        title: {
          display: true,
          text: 'Prey vs Predator Graph',
          font: {
            size: 18
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Prey',
            font: { size: 16 }
          },
          type: 'linear',
          min: 0
        },
        y: {
          title: {
            display: true,
            text: 'Predator',
            font: { size: 16 }
          },
          min: 0
        }
      }
    }
  });
}

function initTimeGraph() {
  const ctx = document.getElementById("timeGraph").getContext("2d");
  timeChart = new Chart(ctx, {
    type: "line",
    data: timeData,
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: {
          display: true
        },
        title: {
          display: true,
          text: "Population Over Time"
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time (months)"
          }
        },
        y: {
          title: {
            display: true,
            text: "Population"
          },
          min: 0
        }
      }
    }
  });
}


function flashReintroduction(message) {
  flashActive = true;
  flashMessage = message;

  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    flashActive = false;
    flashMessage = "";
  }, 1000); // visible for 1 second
}


function getPreyImage() {
  return currentPrey === "deer" ? deerImg : bunnyImg;
}

function getPredatorImage() {
  return currentPredator === "fox" ? foxImg : wolfImg;
}



function getEmoji(animal) {
  const emojiMap = {
    bunny: "🐰",
    deer: "🦌",
    wolf: "🐺",
    fox: "🦊"
  };
  return emojiMap[animal] || "";
}


function handleControlClick() {
  const button = document.getElementById("control-button");

  if (!simulationRunning) {
    startSimulation();
    button.textContent = "Pause";
  } else if (!simulationPaused) {
    pauseSimulation();
    button.textContent = "Resume";
  } else {
    pauseSimulation();
    button.textContent = "Pause";
  }
}


function handlePreyChange() {
  const select = document.getElementById("prey-select");
  currentPrey = select.value;

  // Update dropdown preview image
  document.getElementById("prey-image").src = `${currentPrey}.png`;

  // ✅ Update icon in counter section
  document.getElementById("prey-icon").src = `${currentPrey}.png`;

  // ✅ Update the small input icon next to population input
  document.getElementById("prey-input-image").src = `${currentPrey}.png`;

  updateDisplay();
  drawCanvas();
}


function handlePredatorChange() {
  const select = document.getElementById("predator-select");
  currentPredator = select.value;

  const emoji = getEmoji(currentPredator);

  // ✅ Update the preview image beside dropdown
  document.getElementById("predator-image").src = `${currentPredator}.png`;

  // ✅ Update icon in counter section
  document.getElementById("predator-icon").src = `${currentPredator}.png`;

  // ✅ Update the small input icon (next to input box)
  document.getElementById("predator-input-image").src = `${currentPredator}.png`;

  updateDisplay();
  drawCanvas();
}


function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function updateDisplay() {
  document.getElementById("prey-count").textContent = `${capitalize(currentPrey)} population: ${Math.floor(preyCount)}`;
  document.getElementById("predator-count").textContent = `${capitalize(currentPredator)} population: ${Math.floor(predatorCount)}`;
}
//begin simulation
async function startSimulation() {
  if (simulationRunning) return;

  // Get input values
  preyCount = parseInt(document.getElementById("prey-input").value);
  predatorCount = parseInt(document.getElementById("predator-input").value);
  document.getElementById("prey-input").disabled = true;
  document.getElementById("predator-input").disabled = true;

  if (isNaN(preyCount) || preyCount < 0) preyCount = 0;
  if (isNaN(predatorCount) || predatorCount < 0) predatorCount = 0;

  simulationRunning = true;
  simulationPaused = false;

  ctx = document.getElementById("simCanvas").getContext("2d");

  updateDisplay();
  drawCanvas();
  loop();
  elapsedTime = 0;
  stepCount = 0;
  updateTimerDisplay();

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!simulationPaused && simulationRunning) {
      elapsedTime += 1;
      updateTimerDisplay();
    }
  }, 500); // every second

  document.getElementById("prey-input").disabled = true;
  document.getElementById("predator-input").disabled = true;


}

function pauseSimulation() {
  simulationPaused = !simulationPaused;
}

function stopSimulation() {
  simulationRunning = false;
  simulationPaused = false;

  clearInterval(simulationLoopId);
  simulationLoopId = null;

  ctx.clearRect(0, 0, 600, 400);
  document.getElementById("prey-count").textContent = "Prey: 0";
  document.getElementById("predator-count").textContent = "Predator: 0";
  document.getElementById("control-button").textContent = "Start Simulation";

  // Re-enable inputs
  const preyInput = document.getElementById("prey-input");
  const predatorInput = document.getElementById("predator-input");
  if (preyInput && predatorInput) {
    preyInput.disabled = false;
    predatorInput.disabled = false;
  }

  // Reset timer + graph (optional)
  elapsedTime = 0;
  preyExtinctTime = 0;
  predatorExtinctTime = 0;
  clearInterval(timerInterval);
  updateTimerDisplay();

  if (graphChart) {
    graphData.datasets[0].data = [];
    graphChart.update();
  }
  if (timeChart) {
    timeData.labels = [];
    timeData.datasets[0].data = [];
    timeData.datasets[1].data = [];
    timeChart.update();
  }
  
}

function loop() {
  if (simulationLoopId) return; // Already running

  simulationLoopId = setInterval(async () => {
    if (!simulationRunning || simulationPaused) return;

    const [newPrey, newPredators] = simulateStep(preyCount, predatorCount);
    preyCount = Math.max(0, newPrey);
    predatorCount = Math.max(0, newPredators);


    // ⏱️ Track extinction durations
    if (Math.floor(preyCount) === 0) {
      preyExtinctTime += 0.5;
    } else {
      preyExtinctTime = 0;
    }

    if (Math.floor(predatorCount) === 0) {
      predatorExtinctTime += 0.5;
    } else {
      predatorExtinctTime = 0;
    }

  let reintroMsg = "";
  if (preyExtinctTime >= extinctionThreshold) {
    preyCount += preyReintroAmount;
    preyExtinctTime = 0;
    reintroMsg += "Reintroducing prey";
  }
  if (predatorExtinctTime >= extinctionThreshold) {
    predatorCount += predatorReintroAmount;
    predatorExtinctTime = 0;
    reintroMsg += "Reintroducing predator";
  }
  if (reintroMsg) flashReintroduction(reintroMsg);
    updateDisplay();
    drawCanvas();
    if (graphChart) {
      graphData.datasets[0].data.push({
        x: Math.floor(preyCount),
        y: Math.floor(predatorCount)
      });
      graphChart.update();
    }

    if (timeChart) {
      timeData.labels.push(elapsedTime);
      timeData.datasets[0].data.push(preyCount);      // prey
      timeData.datasets[1].data.push(predatorCount);  // predator
      timeChart.update();
    }
    
    
  }, 500);
}//the 1000 indicates it runs every 1000 ms = 1second


function drawCanvas() {
  if (!ctx) return;

  const preyImg = animalImages[currentPrey];
  const predatorImg = animalImages[currentPredator];

  if (!preyImg.complete || !predatorImg.complete) return;

  ctx.clearRect(0, 0, 600, 400);

  for (let i = 0; i < Math.floor(preyCount); i++) {
    ctx.drawImage(preyImg, Math.random() * 550, Math.random() * 350, 35, 35);
  }

  for (let i = 0; i < Math.floor(predatorCount); i++) {
    ctx.drawImage(predatorImg, Math.random() * 550, Math.random() * 350, 60, 60);
  }

  if (flashActive && flashMessage) {
    ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
    ctx.fillRect(0, 0, 600, 400);
  
    ctx.fillStyle = "#000";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(flashMessage, 300, 200);
  }
  
  

}

function updateTimerDisplay() {
  const timer = document.getElementById("timer-display");
  if (timer) timer.textContent = `Month: ${elapsedTime}`;
}



function simulateStep(prey, predator) {

  const db = alpha * prey - beta * prey * predator;
  const dp = delta * prey * predator - gamma * predator;

  const dt = 0.5;
  return [prey + db * dt, predator + dp * dt];

}


// Initial display when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Set initial counts
  preyCount = parseInt(document.getElementById("prey-input").value);
  predatorCount = parseInt(document.getElementById("predator-input").value);

  if (isNaN(preyCount) || preyCount < 0) preyCount = 0;
  if (isNaN(predatorCount) || predatorCount < 0) predatorCount = 0;

  ctx = document.getElementById("simCanvas").getContext("2d");

  // Update icons and labels for initial selection
  handlePreyChange();
  handlePredatorChange();

  updateDisplay();
  drawCanvas();
  initGraph();
  initTimeGraph();

  const sliders = ["alpha", "beta", "gamma", "delta"];
  sliders.forEach(id => {
    const slider = document.getElementById(id);
    const label = document.getElementById(`${id}-value`);

    slider.addEventListener("input", () => {
      const val = parseFloat(slider.value);
      label.textContent = val;
      if (id === "alpha") alpha = val;
      if (id === "beta") beta = val;
      if (id === "gamma") gamma = val;
      if (id === "delta") delta = val;
    });
  });

});
