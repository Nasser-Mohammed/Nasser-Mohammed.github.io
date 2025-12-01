// === Canvas Setup ===
const canvas = document.getElementById("canvas2d");
const ctx = canvas.getContext("2d", { alpha: false });
// NEW: System selector
let systemChoice = "fhn";

const EQUATION_FHN = `
<h2>FitzHugh–Nagumo System</h2>
<p>
$$
\\begin{aligned}
\\frac{dv}{dt} &= v - \\frac{v^3}{3} - w + I \\\\
\\frac{dw}{dt} &= \\varepsilon (v + a - b w)
\\end{aligned}
$$
</p>
`;

const EQUATION_CUSTOM = `
<h2>Custom Biological System</h2>
<p>
$$
\\begin{aligned}
\\frac{du}{dt} &= 
\\frac{r u (1-u)}{1 + e^{-k_1 (v - v_c)}} 
- 
\\frac{c u}{1 + e^{-k_2 (v_k - v)}} 
\\\\[6pt]
\\frac{dv}{dt} &= 
\\alpha v (1-v)(v - v_c)
+ \\gamma(1-v)
- \\beta u v
\\end{aligned}
$$
</p>
`;




// === Simulation Parameters ===
let N = 150;              // grid resolution (interior 1..N)
let dt = 0.01;
let I = 0;            
let a = 0.7;            
let b = 0.8;              
let epsilon = 0.08;
let x_range = [-2, 2];
let y_range = [-1.5, 1.5];
let r = 10;
let c = 4;
let k1 = 12;
let k2 = 12;
let v_c = 0.4;
let v_k = 0.55;
let alpha = 20;
let gamma = 0.8;
let beta = 3.6;

// System-specific domains
const domain_FHN = {
    x: [-2, 2],
    y: [-1.5, 1.5]
};

const domain_CUSTOM = {
    x: [0, 1],
    y: [0, 1]
};


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


// === Vector fields ===

// Original FHN system
function fhn(v, w) {
    let dv = v - (v*v*v)/3 - w + I;
    let dw = epsilon * (v + a - b*w);
    return [dv, dw];
}

// NEW: Placeholder custom system 
function customSystem(u, v) {

    // du/dt
    let growthTerm = (r * u * (1 - u)) / (1 + Math.exp(-k1 * (v - v_c)));
    let predTerm   = (c * u) / (1 + Math.exp(-k2 * (v_k - v)));
    let du = growthTerm - predTerm;

    // dv/dt
    let dv = alpha * v * (1 - v) * (v - v_c)
             + gamma * (1 - v)
             - beta * u * v;

    return [du, dv];
}

function updateDomainForSystem() {
    if (systemChoice === "fhn") {
        x_range = [...domain_FHN.x];
        y_range = [...domain_FHN.y];
    } else {
        x_range = [...domain_CUSTOM.x];
        y_range = [...domain_CUSTOM.y];
    }
    resizeCanvas();   // recompute pixel transforms
}

function updateEquationDisplay() {
    const panel = document.getElementById("equation-display");

    if (systemChoice === "fhn") {
        panel.innerHTML = EQUATION_FHN;
    } else {
        panel.innerHTML = EQUATION_CUSTOM;
    }

    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}




// NEW: dispatcher
function vectorField(v, w) {
    if (systemChoice === "fhn") return fhn(v, w);
    return customSystem(v, w);
}


function step(v, w) {
    let [dv, dw] = vectorField(v, w);
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



function isStable(v, w) {
    if (systemChoice === "fhn") return isStableFHN(v, w);
    return customStability(v, w);
}

// Original FHN linearization
function isStableFHN(v, w) {
    let tr = (1 - v*v) + (-epsilon*b);
    let det = (1 - v*v)*(-epsilon*b) + epsilon;
    return (det > 0 && tr < 0);
}

function customStability(u, v) {
    const h = 1e-4;

    function sys(x, y) {
        return customSystem(x, y);
    }

    let [f0, g0] = sys(u, v);

    let [f_u] = sys(u + h, v);
    let [f_v] = sys(u, v + h);

    let [, g_u] = sys(u + h, v);
    let [, g_v] = sys(u, v + h);

    let a = (f_u - f0) / h;
    let b = (f_v - f0) / h;
    let c = (g_u - g0) / h;
    let d = (g_v - g0) / h;

    let tr = a + d;
    let det = a*d - b*c;

    return det > 0 && tr < 0;
}



function findEquilibria() {
    if (systemChoice === "fhn") {
        return findEquilibriaFHN();
    }
    return customEquilibria();
}

// Original method only for FHN
function findEquilibriaFHN() {
    function f(v) {
        return v - (v*v*v)/3 + I - (v + a)/b;
    }
    let pts = [];
    let lastV = x_range[0];
    let lastF = f(lastV);

    for (let v = x_range[0] + 0.001; v <= x_range[1]; v += 0.001) {
        let fv = f(v);
        if (lastF * fv <= 0) {
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

function customEquilibria() {
    let pts = [];

    // brute force scanning approach
    let stepU = (x_range[1] - x_range[0]) / 400;
    let stepV = (y_range[1] - y_range[0]) / 400;

    for (let u = x_range[0]; u <= x_range[1]; u += stepU) {
        for (let v = y_range[0]; v <= y_range[1]; v += stepV) {
            let [du, dv] = customSystem(u, v);

            // near equilibrium
            if (Math.abs(du) < 0.015 && Math.abs(dv) < 0.015) {
                pts.push([u, v]);
            }
        }
    }

    return mergeNearbyPoints(pts);
}

// helper to merge clustered points
function mergeNearbyPoints(points) {
    let merged = [];
    let tol = 0.05;
    for (let p of points) {
        let found = false;
        for (let q of merged) {
            if (Math.hypot(p[0]-q[0], p[1]-q[1]) < tol) {
                found = true;
                break;
            }
        }
        if (!found) merged.push(p);
    }
    return merged;
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




function drawNullclines() {
    ctx.lineWidth = 4;

    if (systemChoice === "fhn") {
        // === v-nullcline (red): w = v - v^3/3 + I ===
        ctx.strokeStyle = "red";
        ctx.beginPath();
        let first = true;
        for (let v = x_range[0]; v <= x_range[1]; v += 0.005) {
            let w = v - (v*v*v)/3 + I;
            let px = (v - x_range[0])/(x_range[1]-x_range[0]) * width;
            let py = height - (w - y_range[0])/(y_range[1]-y_range[0]) * height;
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
            let px = (v - x_range[0])/(x_range[1]-x_range[0]) * width;
            let py = height - (w - y_range[0])/(y_range[1]-y_range[0]) * height;
            if (first) { ctx.moveTo(px, py); first = false; }
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    if (systemChoice === "custom") {
        customNullclines();
    }
}


function customNullclines() {
    //------------------------------------------------------------
    // u-nullcline: du/dt = 0  (red)
    //------------------------------------------------------------
    ctx.strokeStyle = "red";
    ctx.beginPath();
    let first = true;

    // sample u finely
    for (let u = 0; u <= 1; u += 0.001) {

        // solve du/dt = 0 for v via bisection
        let v_left = 0, v_right = 1;
        let found = false;

        for (let iter = 0; iter < 40; iter++) {
            let vm = 0.5*(v_left + v_right);

            let growth = (r * u * (1 - u)) / (1 + Math.exp(-k1 * (vm - v_c)));
            let pred   = (c * u) / (1 + Math.exp(-k2 * (v_k - vm)));
            let du = growth - pred;

            // Estimate sign at left
            let gl = (r * u * (1 - u)) / (1 + Math.exp(-k1 * (v_left - v_c)));
            let pl = (c * u) / (1 + Math.exp(-k2 * (v_k - v_left)));
            let du_left = gl - pl;

            if (du_left * du <= 0) {
                v_right = vm;
            } else {
                v_left = vm;
            }
        }

        let v_star = 0.5*(v_left + v_right);

        if (v_star >= 0 && v_star <= 1) {
            let px = (u - x_range[0])/(x_range[1]-x_range[0]) * width;
            let py = height - (v_star - y_range[0])/(y_range[1]-y_range[0]) * height;

            if (first) { ctx.moveTo(px, py); first = false; }
            else ctx.lineTo(px, py);
        }
    }
    ctx.stroke();



    //------------------------------------------------------------
    // v-nullcline: dv/dt = 0 (green)
    //------------------------------------------------------------
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    first = true;

    // sample v finely, solve for u
    for (let v = 0; v <= 1; v += 0.001) {

        // solve dv/dt = 0 for u (this is linear in u!)
        // dv = αv(1-v)(v-v_c) + γ(1-v) - βuv = 0
        // → u = [ αv(1-v)(v-v_c) + γ(1-v) ] / (βv)

        let denom = beta * v;

        if (Math.abs(denom) > 1e-6) {
            let numerator = alpha*v*(1-v)*(v-v_c) + gamma*(1-v);
            let u_star = numerator / denom;

            if (u_star >= 0 && u_star <= 1) {
                let px = (u_star - x_range[0])/(x_range[1]-x_range[0]) * width;
                let py = height - (v - y_range[0])/(y_range[1]-y_range[0]) * height;

                if (first) { ctx.moveTo(px, py); first = false; }
                else ctx.lineTo(px, py);
            }
        }
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

  // Ensure correct visibility on load
    document.getElementById("fhn-params").style.display = "block";
    document.getElementById("custom-params").style.display = "none";

    const alphaSlider = document.getElementById("alpha");
    const betaSlider = document.getElementById("beta");
    const gammaSlider = document.getElementById("gamma");

    const alphaVal = document.getElementById("alpha-val");
    const betaVal = document.getElementById("beta-val");
    const gammaVal = document.getElementById("gamma-val");

// CUSTOM SYSTEM SLIDERS
alphaSlider.oninput = e => {
    alpha = parseFloat(e.target.value);
    alphaVal.textContent = alpha.toFixed(2);
    if (systemChoice === "custom") drawPhasePortrait();
};

betaSlider.oninput = e => {
    beta = parseFloat(e.target.value);
    betaVal.textContent = beta.toFixed(2);
    if (systemChoice === "custom") drawPhasePortrait();
};

gammaSlider.oninput = e => {
    gamma = parseFloat(e.target.value);
    gammaVal.textContent = gamma.toFixed(2);
    if (systemChoice === "custom") drawPhasePortrait();
};


document.getElementById("system-select").onchange = e => {
    systemChoice = e.target.value;

    previousEquilibria = [];

    // toggle parameter panels
    const fhnBox = document.getElementById("fhn-params");
    const customBox = document.getElementById("custom-params");

    if (systemChoice === "fhn") {
        fhnBox.style.display = "block";
        customBox.style.display = "none";
    } else {
        fhnBox.style.display = "none";
        customBox.style.display = "block";
    }

    updateDomainForSystem();
    updateEquationDisplay();

    // reset trajectory color cycling
    colorIndex = 0;

    drawPhasePortrait();
};






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

    if (systemChoice === "fhn") {
        // Reset FHN parameters
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
    } 

    else if (systemChoice === "custom") {
        // Reset CUSTOM parameters
        alpha = 20;
        beta = 3.6;
        gamma = 0.8;

        document.getElementById("alpha").value = 20;
        document.getElementById("beta").value = 3.6;
        document.getElementById("gamma").value = 0.8;

        document.getElementById("alpha-val").textContent = "20";
        document.getElementById("beta-val").textContent = "3.6";
        document.getElementById("gamma-val").textContent = "0.8";
    }

    drawPhasePortrait();
};

    updateEquationDisplay();


  drawPhasePortrait();
});
