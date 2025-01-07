---
layout: archive
title: "Method of Characteristics"
permalink: /notes/pde/method-of-characteristics/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\[a(x,t)u_x + b(x,t)u_t + c(x,t)u = 0 \\]
The method of characteristics is a very powerful method to solving first order PDEs, though there are ways to also solve certain second order hyperbolic PDEs. However, our focus will be on the first order approach. This method involves breaking a PDE into a system of ODEs. We do this by finding certain curves called **characteristics**, in which the PDE reduces to an ODE. 


Theory Behind It
===
As mentioned, we want to find these **characteristic curves**, along which the solution to our PDE reduces to an ODE. This is not apparent at first glance so we will go step-by-step. First let's consider the first order equation:
\\[a(x,t)u_x + b(x,t)u_t = 1 \\]
Now if we could parameterize \\(x\\) and \\(t\\) by some parameter, say \\(s\\), then our equation would be:
\\[a(x(s), t(s))u_x + b(x(s),t(s))u_t = 1\\]
Note that \\((x(s), t(s))\\) traces out a surface in 3D. \\
The chain rule tells us that
\\[\frac{du}{ds} = \frac{\partial u}{\partial x}\frac{dx}{ds} + \frac{\partial u}{\partial t}\frac{dx}{ds}\\]
This is simply 
\\[\frac{du}{ds} = \frac{dx}{ds}u_x + \frac{dx}{ds}u_t\\]
So if we could some how match \\(a(x(s), t(s))\\) to \\(\frac{dx}{ds}\\) and \\(b(x(s), t(s))\\) to \\(\frac{dx}{ds}\\) then we would have the below equality
\\[\frac{du}{ds} = \frac{dx}{ds}u_x + \frac{dx}{ds}u_t = a(x(s), t(s))u_x + b(x(s),t(s))u_t\\]
Which is just the left hand side of our PDE. So substituting \\(\frac{du}{ds}\\) into our PDE, we get
\\[\frac{du}{ds} = 1\\]
This is a simple ODE with solution \\(u(x(s), t(s)) = s + c\\). But we skipped over an important part of the process. We need to match \\(a(x(s), t(s))\\) to \\(\frac{dx}{ds}\\) and \\(b(x(s), t(s))\\) to \\(\frac{dx}{ds}\\) to even get this equation, so let's do that.
\\[a(x(s), t(s)) = \frac{dx}{ds}\\]
and 
\\[b(x(s), t(s)) = \frac{dx}{ds}\\]
You might notice that these are just two ODEs. Solving these will give you \\(x(s)\\) and \\(t(s)\\). So along the curve \\((x(s), t(s))\\) the solution \\(u\\) to our PDE will also solve the ODE that we derived. \\
**Note:** Since \\((x(s), t(s)\\) only gives us the curves and not the initial point on the curve that our solution begins to propagate from, we also consider a parameter \\(\tau\\) that captures the "start" of the curve from the initial data. To solve for \\(\tau\\) we simply consider the initial condition for our \\(x(s)\\) and \\(t(s)\\) and then we should get some constant from solving for the ODE, so we then set \\(\tau\\) equal to that constant. Our variables \\(x\\) and \\(t\\) are then parameterized by \\(s\\) and \\(\tau\\), i.e. \\(x(s,\tau)\\) and \\(t(s, \tau)\\)

