---
layout: archive
title: "What are Partial Differential Equations?"
permalink: /notes/pdeintro/
author_profile: false
--- 
<hr style="border: 2px solid black;">

In middle and highschool, you typically solve algebraic equations that describe how two values (variables) are related to each other.
For example, the equation \\[y = x^2+1\\] tells us, that the value of \\(y\\) is related to the value of \\(x\\) by squaring \\(x\\) and adding 1.
In contrast, a partial differential equation (PDE) describes the way a function is related to its partial derivatives.
Our goal, is to then find the function or functions that satisfy the described relationship. 
An example is the equation that describes heat flow, \\[u_t=\alpha^2u_{xx}\\] which tells us that for a function \\(u\\) to satisfy this relationship, its first time (\\(t\\)) derivative must be equal to \\(\alpha^2\\) multiplied by its second spatial (\\(x\\)) derivative. For simplicity if we assume \\(\alpha = 1\\) then the PDE will tell us that a function that satisfies the described relationship, will have its first time (\\(t\\)) derivative equal to its second spatial (\\(x\\)) derivative. 

