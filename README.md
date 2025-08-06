## Personal Website
This is a personal website, where I hold simulations, programs, notes, and more. On my home page is basic info and contact info. My simulations page has around 14 different simulations, all of which model things with differential equations. My current favorite simulations is my [3D Phase Space Simulation](https://nasser-mohammed.github.io/simulations/programs/3D%20Phase%20Space/index.html). Which I talk more about below. On the math art page you will find several videos and images that are all derived from my simulations, and are visually appealing (to me). My CV page is straightforward. My notes page is where I post notes on various math (and potentially other) topics. These are supposed to be informative and helpful to the reader. However, the process of rewriting the notes and hosting them here has also helped my understanding of the topics. Finally, the pets page is just a page dedicated to the inspirations (family and friend's pets) of the animated images I use on my website and in my simulations. 

## 3D Phase Space Simulation
This project is a 3D visualization of phase space trajectories for several nonlinear dynamical systems, such as the Lorenz, Aizawa, Halvorsen, Dequan Li, Chen Lee, and many more. Currently, you can pick one of the 18 systems I have and adjust the parameters of each system within a given range that I tested to try to ensure the systems do not escape to infinity. This almost gives you a little playground to create qualitatively unique systems all on your own. Furthermore, you can select the color palette for the set of trajectories. There are 17 different color palettes to choose from, and each gives a unique feel to the system. Certan palettes will highlight different trajectories, so make sure to experiment. You can pause the flow of the trajectories at any time and resume the flow when you want. There is a screenshot button above the canvas that will take a snapshot of the current frame, to get the most accurate frame, pause the simulation before taking this image. You can adjust the simulation speed to your liking. A simulation speed of 1 renders 1 time step every 16ms, whereas the other options do 5 times the slider value every 16ms. For any parameters you can reset the trajectories from the same initial condition without resetting the parameters (although you can also reset the parameters). Finally, there are 3 display buttons for dimensional grids. These buttons will toggle the display of the XY, YZ, and XZ planes. For orientation they are useful, but screenshots look better without the grids (personal preference). I use 6 representative trajectories for the graphics, all of which start at unique (but very close) initial conditions. The choice of initial conditions was determined by the nature of the system. I used THREE.js for real time 3D graphics and Trackball controls to take input from the user. The program is live [here](https://nasser-mohammed.github.io/simulations/programs/3D%20Phase%20Space/index.html). If you have any ideas to implement or change, feel free to reach out. The graphics on smaller screens are not great due to my implementation of the 3d rendering camera and canvas.

### Snapshots from the Simulation
The simulation can generate very geometrically rich systems in real time
[Aizawa Attractor](https://nasser-mohammed.github.io/art/pictures/aizawa.mp4)  
[Aizawa Attractor](https://nasser-mohammed.github.io/art/picures/aizawaTwist.png)

### Simulated Systems
Here is a list of the current selection of systems:
- Lorenz System
- Dequan-Li System
- Chen-Lee System
- Aizawa Attractor
- Chua's Circuit
- Halvorsen System
- Newton-Leipnik System
- Thomas System
- Lü Attractor
- Chen Attractor
- Dadras System
- Rössler System
- Rabinovich-Fabrikant Equations
- Nose-Hoover Oscillator
- Burk Shaw Attractor
- Shimizu-Morioka System
- Three-Scroll Attractor
- Arneodo-Coullet System


### Color Palettes
- Red/Orange
- Blue/Green
- Red/Green/Blue
- Alien
- Cyberpunk
- Solid Blue
- Solid Red
- Solid Green
- Solid Orange
- Sunset Glow
- Electric Pastels
- Forest
- Reyna
- Lauren's Lavender
- Lauren's Pink
- Kodie's Flowers
