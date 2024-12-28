---
layout: archive
title: "What are Partial Differential Equations?"
permalink: /notes/pde/pdeintro/
author_profile: false
--- 
<hr style="border: 2px solid black;">

In middle and highschool, you typically solve algebraic equations that describe how two values (variables) are related to each other.
For example, the equation \\[y = x^2+1\\] tells us, that the value of \\(y\\) is related to the value of \\(x\\) by squaring \\(x\\) and adding 1.
In contrast, a partial differential equation (PDE) describes the way a function is related to its partial derivatives.
Our goal, is to then find the function or functions that satisfy the described relationship. 
An example is the equation that describes heat flow, \\[u_t=\alpha^2u_{xx}\\] which tells us that for a function \\(u\\) to satisfy this relationship, its first time (\\(t\\)) derivative must be equal to \\(\alpha^2\\) multiplied by its second spatial (\\(x\\)) derivative. For simplicity if we assume \\(\alpha = 1\\) then the PDE will tell us that a function that satisfies the described relationship, will have its first time (\\(t\\)) derivative equal to its second spatial (\\(x\\)) derivative. 

Where do PDEs Come From?
===
PDEs are typically derived from physical laws or experimental findings, however, not all are or need be. It seems though, as the universe is best described by PDEs, so they are of great interest to study from both a pure and applied point of view.

Boundary Conditions
===
PDEs without some sort of spatial restriction/requirement usually don't tell us much. That is because we can usually find an infinite number of solutions which are very different, yet still solve the PDE. So to derive meaning from these equations, we impose something called *Boundary Conditions*. Boundary conditions are nothing more than the explicit value of the function (or its derivative) at the spatial boundaries. For example, if we are solving the heat equation on a metal rod of length 1, then an example of boundary conditions would be knowing the heat at both ends of the rod. With this information, we get a much better idea of the behavior of the function that we are looking for. 

Initial Conditions
===
Similar to boundary conditions, initial conditions are nothing more than a restriction/requirement for the function at the temporal boundary. Since time always starts at 0, and there is no "end" to time. Our initial condition will always be a restriction on the behavior of the function at time 0. 
