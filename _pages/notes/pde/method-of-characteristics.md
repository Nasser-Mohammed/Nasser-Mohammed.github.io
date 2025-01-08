---
layout: archive
title: "Method of Characteristics"
permalink: /notes/pde/method-of-characteristics/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\[a(x,t)u_x + b(x,t)u_t + c(x,t)u = 0 \\]
The method of characteristics is a very powerful method to solving first order PDEs, though there are ways to also solve certain second order hyperbolic PDEs. However, our focus will be on the first order approach. This method involves breaking a PDE into a system of ODEs. We do this by finding certain curves called **characteristics**, on which the PDE reduces to an ODE. Then we can use standard ODE theory to solve for the unknown function \\(u\\) and translate it back into the proper coordinate system to find the full solution to the PDE.


Theory Behind It
===
As mentioned, we want to find these **characteristic curves**, along which the solution to our PDE reduces to an ODE. This is not apparent at first glance so we will go step-by-step. First let's consider the first order equation:
\\[a(x,t)u_x + b(x,t)u_t = 1 \\]
Now if we could parameterize \\(x\\) and \\(t\\) by some parameter, say \\(s\\), then our equation would be:
\\[a(x(s), t(s))u_x + b(x(s),t(s))u_t = 1\\]
Note that \\((x(s), t(s))\\) traces out a surface in 3D and a curve in 2D. \\
The chain rule tells us that
\\[\frac{du}{ds} = \frac{\partial u}{\partial x}\frac{dx}{ds} + \frac{\partial u}{\partial t}\frac{dt}{ds}\\]
This is simply 
\\[\frac{du}{ds} = \frac{dx}{ds}u_x + \frac{dx}{ds}u_t\\]
So if we could some how match \\(a(x(s), t(s))\\) to \\(\frac{dx}{ds}\\) and \\(b(x(s), t(s))\\) to \\(\frac{dx}{ds}\\) then we would have the below equality
\\[\frac{du}{ds} = \frac{dx}{ds}u_x + \frac{dx}{ds}u_t = a(x(s), t(s))u_x + b(x(s),t(s))u_t\\]
Which is just the left hand side of our PDE. So substituting \\(\frac{du}{ds}\\) into our PDE, we get
\\[\frac{du}{ds} = 1\\]
This is a simple ODE with solution \\(u(x(s), t(s)) = s + c\\). But we skipped over an important part of the process. We need to match \\(a(x(s), t(s))\\) to \\(\frac{dx}{ds}\\) and \\(b(x(s), t(s))\\) to \\(\frac{dx}{ds}\\) to even get this equation, so let's do that.
\\[a(x(s), t(s)) = \frac{dx}{ds}\\]
and 
\\[b(x(s), t(s)) = \frac{dt}{ds}\\]
You might notice that these are just two ODEs. Solving these will give you \\(x(s)\\) and \\(t(s)\\). So along the curve \\((x(s), t(s))\\) the solution \\(u\\) to our PDE will also solve the ODE that we derived. \\
**Note:** We will introduce another parameter \\(\tau\\) to account for where these curves start on the \\(x\\)-axis. In other words, depending on the initial condition, we might start lower or higher up on the curve at each point on the \\(x\\)-axis.

Our curves \\((x(s), t(s))\\) intuitively have a "start" at time 0, i.e. \\(t=0\\), and evolves from there. However, there is no necessary starting point spatially. That is, we have the same curve that just starts at a different \\(x\\) value. But as mentioned, all of our curves start at the same \\(t\\) value (\\(t = 0\\)), but these curves can start anywhere on the specified interval/domain. To account for this, we introduce another parameter \\(\tau\\). Now, we know the behavior of the value of \\(t\\) at \\(s = 0\\) (that is, we want time to start where our curve, parameterized by \\(s\\), starts. This happens at \\(s = 0\\) where \\(t=0\\)). Now we 

Example Problem
===
\\[2xu_x + u_t = 1 \text{   with initial condition of   } u(0, x) = \phi (x)\\]
So we know we are looking for the following solutions
\\[2x = \frac{dx}{ds}\\]
and 
\\[1 = \frac{dt}{ds}\\]
Solving the first one, we get
\\[\int \frac{1}{x}dx = \int 2 ds \implies x = C_1e^{2s}\\]
Solving the second one, we get
\\[t = s + C_2\\]
So we have a parametric curve where our PDE reduces to an ODE. Therefore by the aforementioned chain rule
\\[\frac{du}{ds} = \frac{\partial u}{\partial x}\frac{dx}{ds} + \frac{\partial u}{\partial t}\frac{dt}{ds}\\]
Since we solved the ODEs above, we know that this is equal to the left hand side of our PDE:
\\[2xu_x + u_t\\]
So plugging \\(\frac{du}{ds}\\) in for the left hand side of our PDE, our PDE becomes
\\[\frac{du}{ds} = 1\\]
The solution to this ODE is simply
\\[u = s + C_3\\]
Now we consider the initial condition of \\(u(0, x) = \phi (x)\\), here is where we introduce \\(\tau\\). We know we want the start of our curve to be at \\(s = 0\\) and we want that to be at \\(t = 0\\). Therefore we set,
\\[t(0) = 0\\]
However, the value of \\(x\\) needs to be able to vary when \\(s = 0\\), so we introduce \\(\tau\\), where 
\\[x(0) = \tau\\]
Now plugging these into our solutions for \\(x\\) and \\(t\\) we get
\\[t(0) = 0 = 0 + C_2 \implies C_2 = 0 \implies t(s) = s\\]
and
\\[x(0) = \tau = C_1e^0 \implies \tau = C_1 \implies x(s) = \tau e^{2s}\\]
So now \\(x\\) and \\(t\\) are parameterized by \\(s\\) and \\(\tau\\). Now we can handle our initial condition \\(u(0, x) = \phi (x)\\). We know that \\(t = 0\\) when \\(s = 0\\) \\(\implies x(0, \tau) = \tau\\) so we plug that in to our equation 
\\[u(t(s), x(s)) = s + C_3 \implies u(t(0) = 0, x(0) = \tau) = C_3 \implies \phi(x) = C_3 \implies \phi(x(0)) = \phi(\tau) \implies \phi(\tau) = C_3\\]
So our solution in \\((s, \tau)\\) is
\\[u(s, \tau) = s + \phi(\tau)\\]
Finally, we need to convert this back into the \\((x,t)\\) plane.
\\[t = s\\]
Is straightforward, now plugging in \\(t\\) for \\(s\\) in \\(x(s)\\) we get
\\[x(t) = \tau e^{2t} \implies \tau = \frac{x}{e^{2t}}\\]
Now plugging in our expressions for \\(s\\) and \\(\tau\\) into our solution \\(u(s, \tau) = s + \phi(\tau)\\). We get
\\[u(x,t) = t + \phi(\frac{x}{e^{2t}})\\]
That is our solution for an arbitrary initial condition.

