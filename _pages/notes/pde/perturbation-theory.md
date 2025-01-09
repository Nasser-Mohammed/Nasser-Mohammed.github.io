---
layout: archive
title: "Perturbation Theory for PDEs"
permalink: /notes/pde/perturbation-theory/
author_profile: false
--- 
<hr style="border: 2px solid black;">
Perturbative methods are used to solve more convoluted PDEs. By this, I mean PDEs that either have variable coefficients, difficult geometries, or are nonlinear. The idea is to multiply an \\(\varepsilon\\) term to the term that is causing us trouble. This allows us to have a sort of knob on how much irregularity we want. When \\(\varepsilon = 0\\) our PDE usually reduces down to a more simple PDE, we then consider \\(\varepsilon\\) in different domains leading up to \\(\varepsilon = 1\\), where we have just recovered the original PDE. For example, if we recall Laplace's equation 
\\[\nabla^2 u = 0\\]
If we wanted to solve a more complicated PDE like,
\\[\nabla^2 u + u^2 = 0\\]
We couldn't use our general techniques, since this is a nonlinear PDE (and we don't have the law of superposition), so instead we rewrite this equation as
\\[\nabla^2 u + \varepsilon u^2 = 0\\]
Now when \\(\varepsilon = 0\\) we just get Laplace's equation above. We can then consider \\(\varepsilon \in (0,1)\\), and finally \\(\varepsilon = 1\\) where we recovered the original nonlinear PDE.

To Be Continued When I Know More on It
====
