---
layout: archive
title: "The Heat Equation with Non-Homogenous Boundary Conditions"
permalink: /notes/pde/nonhombc-heat/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\[u_t=\alpha^2u_{xx}\\] 

As you can see, the PDE is the same as before. However, we will want to consider non-homogenous Dirichlet boundary conditions. That is, we want our boundary conditions to be either some constant other than 0, or a function of time only. For simplicity, we are still considering the one dimensional metal rod of length 1. An example of non-homogenous Dirichlet boundary conditions are below,

\\[u(t, 0) = 5, u(t, 1) = 2\\]
\\[u(t, 0) = 3t, u(t, 1) = t^2\\]

So how do we go about solving such a problem? Well, it turns out that we assume the solution takes a particular form. That is, we assume that the solution \\(u\\) is the sum of a steady-state and transient solution. 
\\[u(x,t) = S(x,t) + U(x,t)\\]
\\[\text{Where } S(x,t) \text{ is our stead-state, and } U(x,t) \{text{ is our transient part}\\]
A steady-state solution (sometimes called a "homogenizer"), is one that handles the boundary conditions, so we form this function in such a way that equals the boundary conditions at \\(x = 0\\) and \\(x = 1\\). Let's consider the boundary conditions below,
\\[u(t, 0) = 3t, u(t, 1) = \frac{1}{t}\\]
It takes some trial and error to find a proper "homogenizer", but usually, we start off with simple functions like lower degree polynomials, and increase the degree as we need more and more constants to solve for the two boundary condition. A common template for finding the homogenizer of time varying boundary conditions is using the following function
\\[S(x,t) = A(t)\[1-\frac{x}{L}\] + B(t)\[\frac{x}{L}\]\\]
Where \\(L\\) is the length of the rod, in our case 1.
Then as mentioned, we want this function to equal our boundary conditions. So
\\[S(0, t) = A(t) = u(0, t) = 3t \implies A(t) = 3t\\]
\\[\text{Then substitute our found function of } A(t) \text{ into our steady-state solution to get } S(x,t) = 3t\[1-x\] + B(t)\[x\]\\]
And for the other boundary condition
\\[S(1, t) = B(t) = u(1, t) = 1 \text{ which } \implies B(t) = 1\\]
So, our steady state solution is complete,
\\[S(x,t) = 3t[1-x] + x\\]
As mentioned above, \\(u(x,t) = S(x,t) + U(x,t)\\), so let's make that substitution into the PDE. 

