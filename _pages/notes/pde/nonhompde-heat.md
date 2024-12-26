---
layout: archive
title: "The Non-Homogenous Heat Equation"
permalink: /notes/pde/nonhompde-heat/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\[u_t=\alpha^2u_{xx} + f(x,t)\\] 

We consider the standard 1-D heat equation with an inhomogeneity of \\(f(x,t)\\). The idea, is to write this inhomgeneity \\(f(x,t)\\) as a sin-series (also called its Fourier Series), as well as rewriting \\(u(x,t)\\) as a sin-series. Once we rewrite the PDE in this way, we can make some observations that allow us to solve the problem. It will become clear that we can sort of "push" the inhomogeneity onto an ODE in \\(t\\). As mentioned, rewriting everything in terms of their Fourier Series, we have
\\[u(x,t) = \sum_{n = 1}^{\infty}T_n(t)X_n(x)\\]
\\[f(x,t) = \sum_{n = 1}^{\infty}f_n(t)X_n(x)\\]
Since the \\(X_n(x)\\) comes from solving the homogenous version of PDE, \\(X_n(x) = \sin(n\pi x)\\), and since we are writing \\(f(x,t)\\) as its Fourier Series, we can just replace the \\(\sin(n\pi x)\\) from the Fourier Series representation with \\(X_n(x)\\). Now lets compute the partial derivatives, 
\\[u_t = \sum_{n = 1}^{\infty}T_n^{\'}(t)X_n(x)\\]
\\[u_{xx} = \sum_{n = 1}^{\infty}T_n(t)X_n^{\''}(x)\\]
Plugging all of this into our PDE we get,
\\[\sum_{n = 1}^{\infty}T_n^{\'}(t)X_n(x) = \sum_{n = 1}^{\infty}T_n(t)X_n^{\''}(x) + \sum_{n = 1}^{\infty}f_n(t)X_n(x)\\]
Now moving everything to one side,
\\[\sum_{n = 1}^{\infty}T_n^{\'}X_n(x) - \sum_{n = 1}^{\infty}T_n(t)X_n^{\''}(x) - \sum_{n = 1}^{\infty}f_n(t)X_n(x)\\]
We can pull the summation out to get,
\\[\sum_{n = 1}^{\infty}T_n^{\'}X_n(x) - T_n(t)X_n^{\''}(x) - f_n(t)X_n(x)\\]
We note here, that \\(X_n(x) = \sin(n\pi x) \implies X_n^{\''} = (n\pi)^2\sin(n\pi x)\\). So plugging these into the equation above we arrive at, 
\\[\sum_{n = 1}^{\infty}T_n^{\'}\sin(n\pi x) - T_n(t)(n\pi)^2\sin(n\pi x) - f_n(t)\sin(n\pi x)\\]
And pulling out the \\(\sin(n\pi x)\\) term we get
\\[\\[\sum_{n = 1}^{\infty}(T_n^{\'} - T_n(t)(n\pi)^2 - f_n(t))\sin(n\pi x)\\]
