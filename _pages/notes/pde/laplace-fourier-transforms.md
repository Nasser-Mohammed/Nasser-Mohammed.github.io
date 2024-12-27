---
layout: archive
title: "The Heat Equation on an Infinite and Semi-Infinite Rod"
permalink: /notes/pde/laplace-fourier-heat/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\[u_t=\alpha^2u_{xx}\\]

Our PDE here looks the same, however, we are going to consider when our rod is semi-infinite and infinite in length. That means we will have
1 and 0 boundary conditions respectively. Until now, our techniques have only worked on homogenous boundary conditions. We now introduce a method
that does not rely on homogenous boundary conditions. This is due to the fact that these transforms essentially transform our derivatives into 
multiplication. In other words, we can sometimes turn differential equations into algebraic ones. Even when this does not happen, we essentially
get an ODE in the variable that we did not transform, and this ODE is one degree lower than our PDE. This makes solving problems much easier, once
we solve the transformed problem, we can just invert the transformation to get our solution to the original problem. Now that we know the motivation
behind these transforms, we can start to consider some very common and useful ones.

The Fourier Transform
====
We have already considered the sin and cos transforms of some functions, by means of a series (called the Fourier sin/cos series). However, to 
generalize the functions we can apply this sort of apply this type of transform to, we consider the *Fourier Integral Representation*, sometimes
called the continuous frequency resolution. This extension, now allows us to transform non-periodic functions on \\(\mathbb{R}\\) as well. The Fourier Transform is defined as:
\\[\\mathbb{F}\[f\] = F(\eta) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}f(x)e^{-i\eta x}dx\\]
With the Inverse Fourier Transform is defined as:
\\[\\mathbb{F}^{-1}\[F\] = f(x) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}F(\eta)e^{i\eta x}d\eta\\]
