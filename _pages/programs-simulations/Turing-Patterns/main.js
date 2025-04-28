


let n = 800;
let Dx = 1./n;
let Dy = 1./n;
let Dt = 0.02;
let alpha = 1.;
let beta = -1.;
let omega = 2.;
let lambda = -1.5;
let h = 1.;
let k = 1.;
let sigma_u = 0.001;
let sigma_v = 0.0006;
let u = Array.from({ length: n }, () => Array(n).fill(0));
let v = Array.from({ length: n }, () => Array(n).fill(0));
let nextu = Array.from({ length: n }, () => Array(n).fill(0));
let nextv = Array.from({ length: n }, () => Array(n).fill(0));
let ctx;
let intervalId;
let elapsedTime = 0;


function initalizeSimulation(){
  for (let i = 0; i < n; i++){
    for (let j = 0; j < n; j++){
      u[i][j] = 1.0 + Math.random()*(.03 + 0.03) - 0.03;
      v[i][j] = 1.0 + Math.random()*(.03 + 0.03) - 0.03;
    }
  }

}

function drawGrid(u, v, ctx){
  const rows = u.length;
  const cols = u[0].length;

  for (let i = 0; i < rows-5; i++){
    for (let j = 0; j < cols-5; j++){
      const uVal = u[i][j];
      const vVal = v[i][j];

      const avg = (uVal + vVal)/2;

      const red = uVal;
      const green = 0;
      const blue = vVal;
      
      const blended = `rgb(${red}, ${green}, ${blue})`; 
      ctx.fillStyle = blended;
      ctx.fillRect(j*5, i*5, 5, 5);
    }
  }
}

function updateTimer() {
  elapsedTime++;  // Increment elapsed time
  document.getElementById('timer').innerText = `Time: ${elapsedTime}s`;  // Update timer on the page
}

function updateCanvas(u, v, ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);  // Clear the canvas
  
  // Redraw the arrays (u and v) on the canvas
  drawGrid(u, v, ctx);
}

function update(){
  epsilon = 0.00001;
  for (let i = 1; i < n-1; i++){
    for (let j = 1; j < n-1; j++){
      nextu[i][j] = u[i][j] + Dt*(sigma_u*((u[i+1][j] - 2*u[i][j] + u[i-1][j])/(Dx**2+epsilon) + (u[i][j+1] - 2*u[i][j] + u[i][j-1])/(Dy**2+epsilon)) + alpha*(u[i][j] - h) + beta*(v[i][j] - k));
      nextv[i][j] = v[i][j] + Dt*(sigma_v*((v[i+1][j] - 2*v[i][j] + v[i-1][j])/(Dx**2+epsilon) + (v[i][j+1] - 2*v[i][j] + v[i][j-1])/(Dy**2+epsilon)) + omega*(u[i][j] - h) + lambda*(v[i][j]-k));
      
    }
  }
  for (let i = 0; i < n-1; i++) {
    for (let j = 0; j < n-1; j++) {
      u[i][j] = nextu[i][j];
      v[i][j] = nextv[i][j];
    }
  }
  updateCanvas(u, v, ctx);
}


// Initial display when page loads
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("simCanvas");
    ctx = canvas.getContext("2d");


      
    document.getElementById('startButton').addEventListener('click', function() {
      console.log('Started');
      initalizeSimulation();
      intervalId = setInterval(update, 100);
      setInterval(updateTimer, 1000);
  });

});
