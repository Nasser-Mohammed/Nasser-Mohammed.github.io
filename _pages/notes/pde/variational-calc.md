---
layout: archive
title: "Variational Calculus"
permalink: /notes/pde/variational-calc/
author_profile: false
--- 
<hr style="border: 2px solid black;">
Also called *Euler-Lagrange Equations*, we seek a method of minimizing/maximizing **functionals** instead of the normal function. If you do not know what a functional is, it is more or less a function that takes in another **function** and outputs a **scalar** (a number). In other words, it takes in a function and evaluates it in some way. The most familiar functional is the integral (more specifically the definite integral since the indefinite integral gives us a function back). For example
\\[J\[y\] = \int_a^b F(x,y,y')dx\\]
Is a functional, since it takes in a function \\(F(x,y,y')\\) and returns a value for it. Here, \\(y\\) is a function of \\(x\\), so our functional is taking in a function of \\(y\), which is why we have \\(J\[y\]\\). What we are interested in, like in standard optimization, is finding how to minimize (maximize in some situations but we will consider minimization) this functional. In other words, we seek a function \\(\overline{y}(x)\\) that minimizes the output of \\(J\[y\]\\). This can be thought of as minimizing the time it takes to travel some path with only gravity as force. If you have not recognized, this is simply the *Brachistrochrone problem* (introduced in 1696 by John Bernoulli). See image below. 
