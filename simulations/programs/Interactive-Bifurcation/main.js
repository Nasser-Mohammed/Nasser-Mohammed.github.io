// === Canvas Setup ===
const canvas = document.getElementById("canvas2d");
const ctx = canvas.getContext("2d", { alpha: false });


// === Simulation Parameters ===
let N = 150;              // grid resolution (interior 1..N)
let dt = 0.01;
let I = 0;            
let a = 0.7;            
let b = 0.8;              
let epsilon = 0.08;
let x_range = [-2, 2];
let y_range = [-1.5, 1.5];

const columns = 15;
const rows = 7;
let previousEquilibria = [];
// nice static color palette for trajectories
const trajColors = [
    "#ffb703", "#fb8500", "#8ecae6", "#219ebc", "#ff5d8f",
    "#ffd166", "#06d6a0", "#118ab2", "#9b5de5", "#f15bb5"
];




const steps = 500; // each initial point marches 100 time steps

let width, height;
let num_x_points, num_y_points;
let x_spat_step, y_spat_step;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    width = canvas.width;
    height = canvas.height;

    num_x_points = columns;
    num_y_points = rows;


    x_spat_step = Math.abs(x_range[1] - x_range[0]) / num_x_points;
    y_spat_step = Math.abs(y_range[1] - y_range[0]) / num_y_points;
}
window.addEventListener("resize", () => {
    resizeCanvas();
    drawPhasePortrait();
});


function fhn(v, w) {
    let dv = v - (v*v*v)/3 - w + I;
    let dw = epsilon * (v + a - b*w);
    return [dv, dw];
}

function step(v, w) {
    let [dv, dw] = fhn(v, w);
    return [v + dt * dv, w + dt * dw];
}

function drawLine(x1, y1, x2, y2, color) {
    const px1 = (x1 - x_range[0]) / (x_range[1] - x_range[0]) * width;
    const py1 = height - (y1 - y_range[0]) / (y_range[1] - y_range[0]) * height;

    const px2 = (x2 - x_range[0]) / (x_range[1] - x_range[0]) * width;
    const py2 = height - (y2 - y_range[0]) / (y_range[1] - y_range[0]) * height;

    ctx.beginPath();
    ctx.moveTo(px1, py1);
    ctx.lineTo(px2, py2);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    ctx.stroke();
}


function simulateFrom(v0, w0, color) {
    let v = v0;
    let w = w0;

    for (let s = 0; s < steps; s++) {
        let [vn, wn] = step(v, w);
        drawLine(v, w, vn, wn, color);
        v = vn;
        w = wn;
    }
}



function detectBifurcation(eq) {
    function showPopup(msg) {
        const popup = document.getElementById("bif-popup");
        popup.innerHTML = msg;
        popup.style.display = "block";
        setTimeout(() => popup.style.display = "none", 2500);
    }

    // number change → saddle-node
    if (eq.length !== previousEquilibria.length) {
        showPopup("Saddle-node type: Equilibrium count changed");
        previousEquilibria = eq;
        return;
    }

    // detect stability changes
    for (let i = 0; i < eq.length; i++) {
        let [v, w] = eq[i];
        let [pv, pw] = previousEquilibria[i];

        let st_now = isStable(v, w);
        let st_prev = isStable(pv, pw);

        if (st_now !== st_prev) {
            if (!st_now && st_prev) {
                showPopup("Stability lost: possible Hopf bifurcation");
            } else {
                showPopup("Stability gained: possible reverse Hopf");
            }
            break;
        }
    }

    previousEquilibria = eq;
}


function findEquilibria() {
    // We solve f(v) = 0 where:
    // f(v) = v - v^3/3 + I - (v + a)/b

    function f(v) {
        return v - (v*v*v)/3 + I - (v + a)/b;
    }

    // numerical sampling + root polishing
    let pts = [];
    let lastV = x_range[0];
    let lastF = f(lastV);

    for (let v = x_range[0] + 0.001; v <= x_range[1]; v += 0.001) {
        let fv = f(v);

        if (lastF * fv <= 0) {
            // use bisection to refine
            let lo = lastV;
            let hi = v;
            for (let iter = 0; iter < 25; iter++) {
                let mid = 0.5 * (lo + hi);
                let fm = f(mid);
                if (lastF * fm <= 0) hi = mid;
                else lo = mid;
            }
            let vstar = 0.5 * (lo + hi);
            let wstar = (vstar + a)/b;
            pts.push([vstar, wstar]);
        }

        lastV = v;
        lastF = fv;
    }

    return pts;
}

function isStable(v, w) {
    let tr = (1 - v*v) + (-epsilon*b);
    let det = (1 - v*v)*(-epsilon*b) + epsilon;

    return (det > 0 && tr < 0);
}

function drawEquilibria(eq) {
    for (let [v, w] of eq) {
        let px = (v - x_range[0]) / (x_range[1] - x_range[0]) * width;
        let py = height - (w - y_range[0]) / (y_range[1] - y_range[0]) * height;

        let stable = isStable(v, w);

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, 2 * Math.PI);

        if (stable) {
            ctx.fillStyle = "white";
            ctx.fill();
        } else {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}


function updateEquilibriaInfo(eq) {
    const info = document.getElementById("equilibria-info");

    if (eq.length === 0) {
        info.innerHTML = `<b>No equilibria</b>`;
        return;
    }

    let html = `<b>Equilibria:</b><br>`;
    eq.forEach(([v, w]) => {
        let stable = isStable(v, w);
        html += `v=${v.toFixed(3)}, w=${w.toFixed(3)} — `;
        html += stable ? `<span style="color:lime;">stable</span>` :
                         `<span style="color:red;">unstable</span>`;
        html += `<br>`;
    });
    info.innerHTML = html;
}






function drawNullclines() {
    ctx.lineWidth = 4;

    // === v-nullcline (red):  w = v - v^3/3 + I ===
    ctx.strokeStyle = "red";
    ctx.beginPath();
    let first = true;
    for (let v = x_range[0]; v <= x_range[1]; v += 0.005) {
        let w = v - (v*v*v)/3 + I;
        let px = (v - x_range[0]) / (x_range[1] - x_range[0]) * width;
        let py = height - (w - y_range[0]) / (y_range[1] - y_range[0]) * height;

        if (first) { ctx.moveTo(px, py); first = false; }
        else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // === w-nullcline (green): w = (v + a)/b ===
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    first = true;
    for (let v = x_range[0]; v <= x_range[1]; v += 0.005) {
        let w = (v + a)/b;
        let px = (v - x_range[0]) / (x_range[1] - x_range[0]) * width;
        let py = height - (w - y_range[0]) / (y_range[1] - y_range[0]) * height;

        if (first) { ctx.moveTo(px, py); first = false; }
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
}




    let colorIndex = 0;
function drawPhasePortrait() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);


    for (let i = 0; i < num_x_points; i++) {
        for (let j = 0; j < num_y_points; j++) {

            let v0 = x_range[0] + i * x_spat_step;
            let w0 = y_range[0] + j * y_spat_step;

            let color = trajColors[colorIndex % trajColors.length];
            simulateFrom(v0, w0, color);

            colorIndex++;
        }
    }
        drawNullclines();

    let eq = findEquilibria();
    drawEquilibria(eq);

    updateEquilibriaInfo(eq);
    detectBifurcation(eq);

}






// === Mouse Interaction (corrected to interior indices 1..N) ===
canvas.addEventListener("contextmenu", e => e.preventDefault());




// === UI Bindings ===
document.addEventListener("DOMContentLoaded", () => {
  resizeCanvas();

  const currSlider = document.getElementById("current");
  const aSlider = document.getElementById("a");
  const bSlider = document.getElementById("b");
  const epSlider = document.getElementById("ep");

  const currVal = document.getElementById("current-val");
  const aVal = document.getElementById("a-val");
  const bVal = document.getElementById("b-val");
  const epVal = document.getElementById("ep-val");

currSlider.oninput = e => {
    I = parseFloat(e.target.value);
    currVal.textContent = I.toFixed(4);
    drawPhasePortrait();
};

aSlider.oninput = e => {
    a = parseFloat(e.target.value);
    aVal.textContent = a.toFixed(2);
    drawPhasePortrait();
};

bSlider.oninput = e => {
    b = parseFloat(e.target.value);
    bVal.textContent = b.toFixed(2);
    drawPhasePortrait();
};

epSlider.oninput = e => {
    epsilon = parseFloat(e.target.value);
    epVal.textContent = epsilon.toFixed(2);
    drawPhasePortrait();
};

  document.getElementById("reset-btn").onclick = () => {
    I = 0;
    a = 0.7;
    b = 0.8;
    epsilon = 0.08;

    document.getElementById("current").value = 0;
    document.getElementById("a").value = 0.7;
    document.getElementById("b").value = 0.8;
    document.getElementById("ep").value = 0.08;

    document.getElementById("current-val").textContent = "0";
    document.getElementById("a-val").textContent = "0.7";
    document.getElementById("b-val").textContent = "0.8";
    document.getElementById("ep-val").textContent = "0.08";

    drawPhasePortrait();
};


  drawPhasePortrait();
});
