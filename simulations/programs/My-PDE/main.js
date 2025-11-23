// =============================================================
// CANVAS + GRID
// =============================================================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha:false });

let N = 200;
let size = (N+2)*(N+2);

function IX(x,y){ return x + (N+2)*y; }
function clamp01(x){ return Math.max(0, Math.min(1, x)); }

function resize(){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
resize();
window.addEventListener("resize", resize);

// =============================================================
// FIELDS
// =============================================================
let v = new Float32Array(size);
let u = new Float32Array(size);

let v0 = new Float32Array(size);
let u0 = new Float32Array(size);

// =============================================================
// PARAMETERS
// =============================================================

/*LIMIT CYCLE PARAMETERS: 

// 1 Set:
(1) r_u=10
(2) v_c=0.4
(3) a=20
(4) alpha=3.6
(5) gamma=0.92
(6) Du=0.0005
(7) Dv=0.0001
(8) v_kill=0.55
(9) deathRate=4
(10) k1=k2: 12

// 2 Set: Gives thicker red bands. More sustained higher population.
(1) r_u=10
(2) v_c=0.4
(3) a=20
(4) alpha=3.6
(5) gamma=0.85
(6) Du=0.0005
(7) Dv=0.0001
(8) v_kill=0.55
(9) deathRate=4
(10) k1=k2: 12

// 3 Set: Thicker bands
// 2 Set: Gives thicker red bands. More sustained higher population.
(1) r_u=10
(2) v_c=0.4
(3) a=20
(4) alpha=3.6
(5) gamma=0.81
(6) Du=0.0005
(7) Dv=0.0001
(8) v_kill=0.55
(9) deathRate=4
(10) k1=k2: 12
BIFURFCATION AROUND GAMMA:0.79ISH. LIMIT CYCLE GETS DESTROYED. We still get oscillitory behavior, 
but it's much more fragile. 

Very Interesting behavior at gamma: 0.80 for set 3, turing patterns
Lowest gamma that didn't die out is about 0.785ish.

With gamma=0.82 it's chaotic

*/

let r_u = 10;
let v_c = 0.4;

let a = 20;
let deathRate = 4;

let alpha = 3.6;
let gamma = 0.8;    // IMPORTANT
let v_kill = 0.55;



let Du = 0.0005;
let Dv = 0.0001;


let view = "u";
let dtBase = 0.004;
let speedFactor = 1.0;

// =============================================================
// BOUNDARY
// =============================================================
// =============================================================
// BOUNDARY CONDITIONS
// =============================================================

let bcType = "neumann";

document.getElementById("bc").oninput = e => {
    bcType = e.target.value;
};

function set_bnd(a){
    if(bcType === "neumann"){
        // Reflective boundaries
        for(let i=1;i<=N;i++){
            a[IX(0,i)]   = a[IX(1,i)];
            a[IX(N+1,i)] = a[IX(N,i)];
            a[IX(i,0)]   = a[IX(i,1)];
            a[IX(i,N+1)] = a[IX(i,N)];
        }
    }

    else if(bcType === "periodic"){
        // Wrap edges
        for(let i=1;i<=N;i++){
            a[IX(0,i)]   = a[IX(N,i)];
            a[IX(N+1,i)] = a[IX(1,i)];
            a[IX(i,0)]   = a[IX(i,N)];
            a[IX(i,N+1)] = a[IX(i,1)];
        }
    }

    else if(bcType === "dirichlet"){
        // Fixed value (zero) boundaries
        for(let i=1;i<=N;i++){
            a[IX(0,i)]   = 0;
            a[IX(N+1,i)] = 0;
            a[IX(i,0)]   = 0;
            a[IX(i,N+1)] = 0;
        }
    }
}


// =============================================================
// DIFFUSION
// =============================================================
function diffuse(x,x0,D){
    let a = D*N*N * dtBase*speedFactor;
    for(let it=0; it<6; it++){
        for(let i=1;i<=N;i++){
            for(let j=1;j<=N;j++){
                x[IX(i,j)] =
                    (x0[IX(i,j)]
                     + a*(x[IX(i-1,j)] + x[IX(i+1,j)]
                          + x[IX(i,j-1)] + x[IX(i,j+1)]))
                      / (1+4*a);
            }
        }
        set_bnd(x);
    }
}

// =============================================================
// INITIALIZATION
// =============================================================
// =============================================================
// INITIALIZATION
// =============================================================
function clearAll(){
    v.fill(0);
    u.fill(0);
}

// full environment initialized to 1 everywhere
function initFullEnv(){
    clearAll();
    v.fill(1.0);
}

function initSmooth(){
    clearAll();
    for(let i=1;i<=N;i++){
        for(let j=1;j<=N;j++){
            let x=i/N, y=j/N;
            v[IX(i,j)] = clamp01(
                0.8 + 0.15*Math.sin(3*Math.PI*x)
            );
            u[IX(i,j)] = 0.05 + 0.04*Math.sin(5*Math.PI*x + 4*Math.PI*y);
        }
    }
}

function initRandom(){
    clearAll();
    for(let k=0;k<size;k++){
        v[k] = Math.random();           // random environment
        u[k] = Math.random() * 0.2;     // small random population
    }
}


function initBlank(){
    clearAll();
}
function initPopSin() {
    clearAll();

    // full environment
    v.fill(1.0);

    // sinusoidal population pattern
    for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= N; j++) {
            let x = i / N;
            let y = j / N;
            u[IX(i,j)] = 0.5 + 0.5 * Math.sin(2 * Math.PI * x);  
        }
    }
}
function initPopSin2D() {
    clearAll();

    // full environment everywhere
    v.fill(1.0);

    // 2D sin wave for population
    for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= N; j++) {
            let x = i / N;
            let y = j / N;

            // 2D standing wave (range automatically stays in [0,1])
            let val = Math.sin(2 * Math.PI * x) * Math.sin(2 * Math.PI * y);

            // shift from [-1,1] to [0,1]
            u[IX(i,j)] = 0.5 + 0.5 * val;
        }
    }
}
function initPopSpiral() {
    clearAll();

    // full environment everywhere
    v.fill(1.0);

    // spiral parameters
    let omega = 3.0;   // number of twists
    let k = 12.0;      // radial tightness
    let amp = 0.5;     // wave amplitude

    let cx = (N + 1) / 2;
    let cy = (N + 1) / 2;

    for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= N; j++) {

            let dx = i - cx;
            let dy = j - cy;

            let r = Math.sqrt(dx*dx + dy*dy) / (N/2);     // scaled 0→1
            let theta = Math.atan2(dy, dx);               // angle

            let wave = Math.sin(omega*theta + k*r);

            u[IX(i,j)] = 0.5 + 0.5 * wave;    // maps [-1,1] to [0,1]
        }
    }
}


function applyInit() {
    let mode = document.getElementById("init").value;

    if (mode === "smooth")      initSmooth();
    if (mode === "flat")        initFullEnv();
    if (mode === "random")      initRandom();
    if (mode === "blank")       initBlank();
    if (mode === "pop-sin2d")   initPopSin2D();   
    if (mode === "pop-spiral") initPopSpiral();

}


applyInit();

function smoothStep(x, k){
    return 1 / (1 + Math.exp(-k * x));
}



// =============================================================
// REACTION
// =============================================================
function reactAll(){
    let dt = dtBase*speedFactor;

    for(let i=1;i<=N;i++){
        for(let j=1;j<=N;j++){
            let k = IX(i,j);

            let vv = v[k];
            let uu = u[k];

            // -------------------------------------------------
            // Environment PDE:
            // v_t = a v - b v^2 - k v^3 - alpha u v + gamma(v_h - v)
            // -------------------------------------------------
            // thresholds
            let growSwitch  = smoothStep(vv - v_c, 12.0);
            let deathSwitch = smoothStep(v_kill - vv, 12.0);


            let du =
            r_u * uu * (1 - uu) * growSwitch
            - deathRate * uu * deathSwitch;






            let dv =
                a * vv * (1 - vv) * (vv - v_c)
                + gamma * (1 - vv)
                - alpha * uu * vv;



            v[k] = clamp01(vv + dt*dv);
            u[k] = clamp01(uu + dt*du);
        }
    }
}

// =============================================================
// STEP
// =============================================================
function step(){
    u0.set(u);
    v0.set(v);

    diffuse(u, u0, Du);
    diffuse(v, v0, Dv);

    reactAll();
}

// =============================================================
// RENDER
// =============================================================
function col(v){
    let R,G,B;

    if(v<0.5){
        let k=v/0.5;
        R=0; G=255*k; B=255*(1-k);
    } else {
    let k = (v-0.5)/0.5;
    R = 255 * k;
    G = 255 * (1-k);
    B = 0;
}
    return [R|0,G|0,B|0];
}

function render(){
    let img = ctx.createImageData(N,N);

    for(let j=0;j<N;j++){
        for(let i=0;i<N;i++){
            let p=(i+j*N)*4;
            let k=IX(i+1,j+1);

            let val = (view==="v") ? v[k] : u[k];
            let [R,G,B] = col(val);

            img.data[p]=R;
            img.data[p+1]=G;
            img.data[p+2]=B;
            img.data[p+3]=255;
        }
    }

    let tmp=document.createElement("canvas");
    tmp.width=N; tmp.height=N;
    tmp.getContext("2d").putImageData(img,0,0);
    ctx.drawImage(tmp,0,0,canvas.width,canvas.height);
}

// =============================================================
// BRUSH
// =============================================================
let isPaint=false;

function paintU(x,y,r){
    let r2=r*r;
    for(let dy=-r; dy<=r; dy++){
        for(let dx=-r; dx<=r; dx++){
            if(dx*dx+dy*dy>r2) continue;
            let xx=x+dx, yy=y+dy;
            if(xx<1||xx>N||yy<1||yy>N) continue;
            u[IX(xx,yy)] = 1.0;
        }
    }
}



// Gaussian parameters
let gaussAmp = 1.0;     // peak height added
let gaussSigma = 2.0;   // controls width

function paintGaussian(x0, y0){
    let s2 = gaussSigma * gaussSigma;

    // apply Gaussian to a local window
    let R = Math.ceil(3 * gaussSigma); // cut off at ~3σ for speed
    for(let dy = -R; dy <= R; dy++){
        for(let dx = -R; dx <= R; dx++){
            let xx = x0 + dx, yy = y0 + dy;
            if(xx < 1 || xx > N || yy < 1 || yy > N) continue;

            let d2 = dx*dx + dy*dy;
            let g = gaussAmp * Math.exp(-d2 / (2*s2));

            u[IX(xx,yy)] = clamp01(u[IX(xx,yy)] + g);
        }
    }
}

canvas.addEventListener("mousedown", e=>{
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((e.clientX - rect.left) / rect.width * N) + 1;
    let y = Math.floor((e.clientY - rect.top) / rect.height * N) + 1;

    isPaint = true;
    paintGaussian(x, y);
});

window.addEventListener("mouseup", ()=> isPaint = false);

canvas.addEventListener("mousemove", e=>{
    if(!isPaint) return;

    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((e.clientX - rect.left) / rect.width * N) + 1;
    let y = Math.floor((e.clientY - rect.top) / rect.height * N) + 1;

    paintGaussian(x, y);
});

// =============================================================
// SLIDERS
// =============================================================
function bind(id, target){
    let el=document.getElementById(id);
    let out=document.getElementById(id+"-val");
    el.oninput = ()=>{
        window[target] = parseFloat(el.value);
        out.textContent = el.value;
    };
}

bind("ru", "r_u");
bind("v_c", "v_c");
bind("v_kill", "v_kill");
bind("a", "a");
bind("alpha", "alpha");
bind("gamma", "gamma");
bind("Du", "Du");
bind("Dv", "Dv");


document.getElementById("view").oninput = e=> view=e.target.value;
document.getElementById("speed").oninput = e=>{
    speedFactor = parseFloat(e.target.value);
    document.getElementById("speed-val").textContent=speedFactor;
};

document.getElementById("init").oninput = applyInit;
document.getElementById("reset").onclick = applyInit;

// =============================================================
// LOOP
// =============================================================
function loop(){
    step();
    render();
    requestAnimationFrame(loop);
}
loop();
