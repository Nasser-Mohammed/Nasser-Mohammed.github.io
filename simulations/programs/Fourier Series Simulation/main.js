

let ctx;
let canvas;


let isDragging = false;
let simRunning = false;


let scale = 50;

let totalTime = 2*Math.PI;


let centerX = 500;
let centerY = 400;
let width;
let height;

let mouseX = 0;
let mouseY = 0;

let dragStartTime = null;
let functionTime = 0;

let showInstructions = true;

let startedDragging = false;
let stoppedDragging = true;

let func = [];
let converted = [];

let animationId = null;

let minXSpacing = 1;

let T = 0;

let time = 2*Math.PI;

let offscreen;
let offCtx;

let started = false;

let fourierCoeffs;

let fourierIterations = parseInt(document.getElementById("accuracyRange").value);

const waveSamples = 250;

let sinPoints = [];
let cosPoints = [];
let tempPoints = [];

let lastStepTime = 0;
const stepDuration = 1000 //6 seconds
let maxN = fourierIterations;
let currentN = 0;

let originX, originY, totalDrawWidth;
const drawDuration = stepDuration*maxN; //6 seconds


const tracePoints = []; // array of {x, y}

let timeSinceLastStep = 0; // global or higher scope

let t = 0;
let totalPeriod = 2*Math.PI;
const tIncrement = 0.02;

function drawTrace(ctx) {
  if (tracePoints.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(tracePoints[0].x, tracePoints[0].y);
  for (let pt of tracePoints) {
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.stroke();
}



function drawEpicycles(ctx, t, currentN) {
  let x = originX;
  let y = originY;

  for (let n = 0; n <= currentN; n++) {
    const { a, b } = coefficients[n];
    const A = Math.sqrt(a * a + b * b);
    const phi = Math.atan2(-b, a);
    const angle = n * t + phi;

    const prevX = x;
    const prevY = y;
    x += A * Math.cos(angle);
    y += A * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(prevX, prevY, A, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  return { x, y };
}




function trapezoidalIntegral(normedVals, weightFunc){
  if (normedVals.length === 0){
    console.log("no normalized data integration for fourier");
    return;
  }
  //using trapezoidal rule
  //every x value is within roughly 1 of another x value
  //sum{(f(t_i) + f(t_{i+1}))/2*(t_{i+1} - t_i)}
  let integral = 0;
  for (let i = 0; i < normedVals.length - 1; i++){
    const x0 = normedVals[i].x;
    const x1 = normedVals[i + 1].x;
    const y0 = normedVals[i].y * weightFunc(x0);
    const y1 = normedVals[i + 1].y * weightFunc(x1);
    integral += 0.5 * (y0 + y1) * (x1 - x0);
  }
  return integral;
}


function computeFourierCoeffs(M) {
  if (converted.length === 0){
    console.log("no normalized data for fourier series");
    return;
  }
  const a = [];
  const b = [];

  // a_0
  const a0Integral = trapezoidalIntegral(converted, x => 1); // constant weight
  a[0] = a0Integral / T;
  b[0] = 0;

  for (let n = 1; n <= M; n++) {
    const cosWeight = t => Math.cos((2 * Math.PI * n * t) / T); //(2pi and T cancel out)
    const sinWeight = t => Math.sin((2 * Math.PI * n * t) / T);

    const anIntegral = trapezoidalIntegral(converted, cosWeight);
    const bnIntegral = trapezoidalIntegral(converted, sinWeight);

    a[n] = (2 / T) * anIntegral;
    b[n] = (2 / T) * bnIntegral;
  }

    const result = { a, b };
    coefficients = a.map((aVal, n) => ({ a: aVal, b: b[n] }));
    return result;
}


function generateCos(harmonic_number){
  cosPoints = [];
  for(let i = 0; i <= waveSamples; i++){
    const t = (2*Math.PI*i)/waveSamples;
    cosPoints.push({t, value: Math.cos(harmonic_number*t)});
  }
}

function generateSin(harmonic_number){
  sinPoints = [];
  for(let i = 0; i <= waveSamples; i++){
    const t = (2*Math.PI*i)/waveSamples;
    sinPoints.push({t, value: Math.sin(harmonic_number*t)});
  }
}



function convertNormalizedToCanvasPoints(normPoints, canvasWidth, canvasHeight) {
  return normPoints.map(p => ({
    x: (p.x / (2 * Math.PI)) * func[func.length-1].x,          // scale x from [0, 2π] to [0, canvasWidth]
    y: (canvasHeight / 2) - (p.y * (canvasHeight / 2)) // scale y from [-1,1] to canvas coords (flip y-axis)
  }));
}


function simulationLoop(timestamp) {
  if (!simRunning) return;

  //basically sets time point for when simulation starts
  if (lastStepTime === 0) {
      lastStepTime = timestamp;
  }
  const elapsed = timestamp - lastStepTime;
  lastStepTime = timestamp;

  timeSinceLastStep += elapsed;

  // Clear and redraw original curve
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(offscreen, 0, 0);
  ctx.font = "18px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText("Frequency resolution n = " + currentN, ctx.canvas.width / 2, 30);

  // Draw Fourier partial sum for currentN
  updateSimulation(currentN, elapsed);

  // After some duration, increase currentN
  if (timeSinceLastStep > stepDuration) {  // stepDuration in ms, e.g., 6000
    currentN++;
    timeSinceLastStep = 0;

    if (currentN > maxN) {
      simRunning = false;
      return;
    }
  }

  animationId = requestAnimationFrame(simulationLoop);
}


function updateSimulation(currentN, deltaTime) {
  const points = [];
  const samples = 500;

  for (let i = 0; i <= samples; i++) {
    const timeVal = (2*Math.PI*i) / samples;
    let y = 0;

    for (let n = 0; n <= currentN; n++) {
      const an = fourierCoeffs.a[n];
      const bn = fourierCoeffs.b[n];
      y += an * Math.cos(n * timeVal) + bn * Math.sin(n * timeVal);
    }

    points.push({
      x: (timeVal / (2 * Math.PI)) * func[func.length-1].x,
      y: yToCanvasY(y, canvas.height),
    });
  }

  drawCurve(points, ctx, "red");
}



function startSimulation() {
  if (simRunning) return;
  simRunning = true;
  showInstructions = false;
  currentN = 0;
  lastStepTime = 0;
  tracePoints.length = 0;
  animationId = requestAnimationFrame(simulationLoop);
}

function stopSimulation() {
  simRunning = false;
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  tracePoints.length = 0;
  console.log("simulation state has been stopped");
  clearCanvas();
}

function updateTimeDisplay() {
  const display = document.getElementById("time-display");
  const timeInSeconds = functionTime/1000;
  if (display) {
    display.textContent = `Time: ${timeInSeconds.toFixed(2)}s`;
  }
}

function resetSimulation() {
  functionTime = 0;
  updateTimeDisplay();
  func = [];
  fourierCoeffs = [];
  converted = [];
  clearCanvas();
  offCtx.fillStyle = "white";
  offCtx.fillRect(0,0, width, height);
  console.log("state has been reset");

}

function tToCanvasX(t, canvasWidth) {
  return (t / (2 * Math.PI)) * canvasWidth;
}

function yToCanvasY(y, canvasHeight) {
  return canvasHeight / 2 - y * (canvasHeight / 2);
}

function convert2XY(){
  //right now its coordinates relative to the top left canvas
  //we essentially want to shift the y-value's to be 0 at the middle. So flip the y-axis and shift it down 
  //by 400
  //now we will have a function starting at x = 0 (time), and y can vary negatively and positively by 400
  //to make computation easier, we also normalize down to y being in [-1, 1] and x in [0, 2pi]
  converted.length = 0;

  T = 2 * Math.PI; // new x-range [0, 2π]
  const canvasMinX = Math.min(...func.map(p => p.x));
  const canvasMaxX = Math.max(...func.map(p => p.x));
  const canvasXRange = canvasMaxX - canvasMinX;

  const canvasCenterY = canvas.height / 2;
  const canvasYRange = canvasCenterY; // max deviation from center

  for (let i = 0; i < func.length; i++) {
    const rawX = func[i].x;
    const rawY = func[i].y;

    // Normalize x from [canvasMinX, canvasMaxX] to [0, 2π]
    const normX = ((rawX - canvasMinX) / canvasXRange) * T;

    // Flip and center y-axis, then normalize to [-1, 1]
    const flippedY = canvasCenterY - rawY;
    const normY = flippedY / canvasYRange;

    converted.push({ x: normX, y: normY });
  }
}


function drawCurve(curve, context, color){
  if (curve.length <= 1)
    {
      return;
    }
    context.beginPath();
    context.moveTo(curve[0].x, curve[0].y);
    curve.forEach(point => {
      
      //ctx.arc(point.x, point.y, 2, 0, 2*Math.PI);
      context.lineTo(point.x, point.y);
      //ctx.fillStyle = "blue";
      //ctx.fill();
    })
    context.strokeStyle = color;
    context.lineWidth = 3;
    context.stroke();
}

function processPoints(){
  let processedPoints = 0;
    for (let i = 1; i < func.length; i++){
      if (func[i].x <= func[i-1].x){
        func.splice(i, 1)
        processedPoints++;
        //console.log("removed: ", func[i])
      }
    }
    //convert2XY();
    console.log("Removed: ", processedPoints, " points");
}


function interpolatePoints(){
  const xOffset = func[0].x;
  newCurve = [{x:func[0].x-xOffset, y:func[0].y}];

  //define function period:
  T = Math.abs(func[func.length-1].x - func[0].x);
  //linear interpolation

  let interpolationCount = 0;

  for (let i = 1; i < func.length-1; i++){
    newCurve.push({x:func[i].x-xOffset, y:func[i].y})
    const x_dist = Math.abs(func[i].x-func[i-1].x);
    if (x_dist > 4){
      const numPoints = Math.floor(x_dist)-1;
      interpolationCount += numPoints;
      console.log("Interpolating: ", numPoints, " points between: x1=", func[i-1].x, " and x2=", func[i].x);
       //y-y0 = m(x-x0) => m = (y-y0)/(x-x0)
      const m = (func[i].y - func[i-1].y)/(func[i].x-func[i-1].x);
      console.log("computed slope for: ", func[i-1], " to ", func[i], " m=", m);
      let x_new = func[i-1].x;
      for (let j = 1; j <= numPoints; j++){
        x_new = func[i-1].x + j*minXSpacing; //could also do x_new = x_new + j*minXSpacing;
        const y_new = m*j*minXSpacing + func[i-1].y;
        newCurve.push({x: x_new-xOffset, y: y_new});
        console.log("Added point: x=", x_new, " y=", y_new);
      }
    }
  }
    console.log("Interpolated: ", interpolationCount, " points");
    func = newCurve;
    drawCurve(func, offCtx, "blue");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    drawCurve(func, ctx, "blue");
    //convert2XY();

}

function sortPoints(){
  //find a sorting algorithm
}

function clearCanvas(){
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
  offCtx.fillStyle = "white";
  offCtx.fillRect(0,0, width, height);
  hideStart();
  showInstructions = true;
}

function showInstructionsFunc(){
    if (showInstructions) {
      ctx.font = "18px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText("Click and drag to draw a function to be approximated", ctx.canvas.width / 2, 30);
  }
  else{
    ctx.fillStyle = "white"; //work to be done here
    ctx.fillText("", width/2, 30);
  }
}


function showStart(){
  document.getElementById("start-simulation").style.display = "block";
}

function hideStart(){
  document.getElementById("start-simulation").style.display = "none";
}

function start2pause(button){
  button.textContent = "Pause Simulation";
  button.backgroundColor = "#FF8C00";
}

function pause2start(button){
  button.textContent = "Start Fourier Simulation";
  button.backgroundColor = "#006400";
}

document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("simCanvas");
  ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  showInstructions = true;
  showInstructionsFunc();

  height = canvas.height;
  width = canvas.width;

  originX = 100;
  originY = height / 2;
  totalDrawWidth = width - originX - 50;


  hideStart();

  offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;
  offCtx = offscreen.getContext("2d");


  const accuracyRange = document.getElementById("accuracyRange");
  const accuracyValue = document.getElementById("accuracyValue");

  accuracyRange.addEventListener("input", () => {
    fourierIterations = parseInt(accuracyRange.value);
    accuracyValue.textContent = accuracyRange.value;
    maxN = fourierIterations;

    // Optional: recompute Fourier coeffs if func is drawn
    if (converted.length > 0) {
      fourierCoeffs = computeFourierCoeffs(fourierIterations);
    }
});

  canvas.addEventListener("mousedown", (event) => {
    isDragging = true;
    dragStartTime = performance.now();
    dragCount = 0;
    showInstructions = false;
    showInstructionsFunc();

    if (startedDragging && !endedDragging){
      console.log("canvas was clicked with drawing, resetting.....")
      stopSimulation();
      resetSimulation();
      showInstructions = true;
      startedDragging = false;
      endedDragging = true;
      showInstructionsFunc();
      hideStart();
      started = false;
      pause2start(startButton);
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    if (isDragging){
      showInstructions = false;
      showInstructionsFunc();
      startedDragging = true;
      endedDragging = false;
      const dragEndTime = performance.now();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      if (func.length >= 1){
        const last = func[func.length-1];
        const dx = mouseX - last.x;
        const dy = mouseY - last.y;
        if(Math.abs(mouseX - last.x) >= minXSpacing && mouseX > last.x)
        {
          console.log("From mouse: x: ", mouseX, " y: ", mouseY);
          func.push({x: mouseX, y: mouseY});
        }
      }
      else{
          console.log("logging first point")
          console.log("x: ", mouseX, " y: ", mouseY);
          func.push({x: mouseX, y: mouseY});
        }
      drawCurve(func, ctx, "blue");
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
    if(startedDragging && !endedDragging && func.length > 0){
    console.log("Starting Fourier Simulation")
    processPoints();
    interpolatePoints();
    showStart();
    convert2XY();
    fourierCoeffs = computeFourierCoeffs(fourierIterations);
    //startSimulation();
    }
  });

  canvas.addEventListener("mouseleave", () => {
    if(isDragging && func.length > 0){
      isDragging = false;
      console.log("Starting Fourier Simulation")
      processPoints();
      interpolatePoints();
      showStart();
      convert2XY();
      fourierCoeffs = computeFourierCoeffs(fourierIterations);
      //startSimulation();
    }
  });

  const clearButton = document.getElementById("clear-canvas")
  const startButton = document.getElementById("start-simulation")

  clearButton.addEventListener("click", () => {
    stopSimulation();
    resetSimulation();
    showInstructionsFunc();
    pause2start(startButton);
    started = false;
  });


 startButton.addEventListener("click", () => {
      if(started){
        stopSimulation();
        pause2start(startButton);
        started = false;
      }
      else{
        started = true;
        //console.log(fourierCoeffs.a, fourierCoeffs.b);
        startSimulation();
        start2pause(startButton);

      }
  })



});