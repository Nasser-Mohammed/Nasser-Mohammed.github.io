---
layout: archive
title: "The Wave Equation"
permalink: /notes/pde/wave-eq/
author_profile: false
---
<hr style="border: 2px solid black;">
\\[u_{tt}=c^2u_{xx}\\]
Originally solved by Jean le Rond d'Alembert in 1747, the function \\(u\\) describes the "height" of a string (or wave) at a point in space and time \\((x,t)\\). Note, we are considering a 1 dimensional string. Here (when considering \\(c = 1\\)), we seek a function whose second temporal partial derivative is equal to its second spatial partial derivative. Immediately, that should set off light bulbs in your head of some sort of  \\(\sin\\) and \\(\cos\\) functions.

Boundary Conditions on the 1-D String
===
There are several boundary conditions to consider but we will mostly be concerned with three kinds:
 - endpoints held at 0 (homogenous)
 - endpoints that vary with time
 - force specified on the end points

To interpret these, let's consider the first boundary condition, imagine a guitar string that is clamped down at the ends (as usual), if you pull the string up and release, it will send "standing" waves through the string. For the second boundary condition, imagine two people holding opposite ends of a rope, where they are raising there end up and down. Intuitively, this will send "waves" through the string, so we will seek a function that describes these waves. As for the last boundary condition, we consider the endpoints of a string connected to a frictionless sleeve, now as the sleeve moves up and down, it will drag the string with it. In that way, we have the force specified at the boundary, instead of the explicit position of the string at the endpoint. In the rest of this page, I will only consider the first boundary condition.

The Vibrating Wave (Guitar String)
===
Consider the following IBVP:

\\[\text{PDE:  } u_{tt} = \alpha^2u_{xx} \text{, }\ \ \ 0 < x < L  \text{,   } \ \ \ \ 0 < t < \infty\\]
\\[\text{Boundary conditions:  } u(0, t) = 0 = u(L, t)\\]
\\[\text{Initial conditions:  } u(x,0) = \phi(x) \text{,   } \ \ \ \ u_t(x, 0) = \psi(x)\\]
Note that we have two initial conditions now, this is due to the fact that our temporal derivative \\(u_{tt}\\) is of 2nd order, and therefore the solution to an ODE in \\(t\\) will produce two coefficients. It makes sense if we think about the guitar string example again, we don't only need the initial position of the string, but we also need to know how "fast" the string is moving from its initial position since that will affect the evolution of the string. We solve this problem through separation of variables, so we assume
\\[u(x,t) = T(t)X(x)\\]
Plugging this into \\(u_{tt} = \alpha^2u_{xx}\\) we get:
\\[T^{\''}(t)X(x) = \alpha^2T(t)X^{\''}(x)\\]
We now **separate** the variables and get
\\[\frac{T^{\''}(t)}{\alpha^2T(t)} = \frac{X^{\''}(x)}{X(x)}\\]
And as the same reasoning mentioned in [the heat equation](heatequation.md), we know that these ratios must be equal to some constant \\(k\\). So,
\\[\frac{T^{\''}(t)}{\alpha^2T(t)} = \frac{X^{\''}(x)}{X(x)} = k\\]
We now can write this as two separate equations,
\\[\frac{T^{\''}(t)}{\alpha^2T(t)} = k\\]
and
\\[\frac{X^{\''}(x)}{X(x)} = k\\]
Now rewriting them as
\\[T^{\''}(t) - k\alpha^2T(t) = 0\\]
and 
\\[X^{\''}(x) - kX(x) = 0\\]
So it is apparent that we have two ODEs. However, there is a big difference between this scenario and the heat equation. In the heat equation, we showed that our constant \\(k\\) **must** be negative, however, in this scenario we cannot come to such a conclusion. Recall, we got to that conclusion because we solved for our simple first order ODE in \\(t\\) that didn't rely on the value of \\(k\\), however, now our ODE in \\(t\\) is no longer of first order. So both of our ODEs **do** depend on \\(k\\). Luckily, we do know that both \\(X(x)\\) and \\(T(t)\\) have three possible solution forms, as they are second order homogenous linear ODEs.

1. \\(k = 0: \text{ } T(t) = At + D=B \text{,   } X(x) = Cx + D\\)
2. \\(k < 0: \text{ } T(t) = A\sin(\alpha\beta t) + B\cos(\alpha \beta t) \text{,     } X(x) = C\sin(\beta x) + D\cos(\beta x)\\)
3. \\(k > 0: \text{ } T(t) = Ae^{\alpha \beta t} + Be^{-\alpha \beta t} \text{,     } X(x) = Ce^{\beta x} + De^{-\beta x}\\)

It is a routine exercise to go through these cases, which you will find that only \\(k < 0\\) does not produce a trivial or unbounded solution (as \\(t \rightarrow \infty)\\), when we are considering homogenous Dirichlet boundary conditions. Therefore, we now know:
\\[u(x,t) = \[C\sin(\beta x) + D\cos(\beta x)\]\[A\sin(\alpha \beta t) + B\cos(\alpha \beta t)\]\\]
Now plugging in our boundary conditions \\(u(0, t) = 0 = u(L, t)\\) we get:
\\[u(0, t) = D\[A\sin(\alpha \beta t) + B\cos(\alpha \beta t)\] = 0 \implies D = 0\\]
Since \\(\sin(0) = 0\\) and \\(\cos(0) = 1\\) \\
Now since \\(D = 0\\),  our solution is
\\[u(x,t) = C\sin(\beta x)\[A\sin(\alpha \beta t) + B\cos(\alpha \beta t)\]\\]
Plugging in our other boundary condition \\(u(L, t) = 0\\), we get
\\[u(L, t) = C\sin(\beta L)\[A\sin(\alpha \beta t) + B\cos(\alpha \beta t)\] = 0\\]
Now if we tried to assume \\(C = 0\\), we would get a trivial solution (i.e. our solution would just be 0), so instead we know that \\[\sin(\beta L) = 0 \implies \beta_n L = n\pi \implies \beta_n = \frac{n\pi}{L}\\]
Since solutions to linear homogenous PDEs form a vector space, then any linear combination of these solutions is also a solution. We then say:
\\[u(x,t) = \sum_{n = 1}^{\infty}\sin(\frac{n\pi x}{L})\[a_n\sin(\frac{n \pi \alpha t}{L}) + b_n\cos(\frac{n \pi \alpha t}{L})\]\\]
Finally, to solve account for our two initial conditions:
\\[u(x, 0) = \phi(x)\\]
And
\\[u_t(x, 0) = g(x)\\]
Plugging these in to our solution yields, 
\\[u(x, 0) = \phi (x) = \sum_{n = 1}^{\infty}b_n \sin(\frac{n \pi x}{L})\\]
Using orthogonality of \\(\sin(n\pi x)\\):

<div style="text-align: center;">
$$
\begin{align}
\int_0^L{\sin(\frac{n\pi x}{L}) \sin(\frac{m\pi x}{L}) \ dx} = 
\begin{cases}
\frac{L}{2} &: \text{if } n = m \\
0 &: \text{if } n \neq m
\end{cases} 
\end{align}
$$
</div>

So, we multiply both sides by \\(\sin(\frac{m\pi x}{L})\\) and integrate from 0 to L. In doing so we get, 
\\[\int_0^1\phi(x)\sin(\frac{m \pi x}{L}) dx = \int_0^L\sum_{n = 1}^{\infty}b_n\sin(\frac{n \pi x}{L})\sin(\frac{m\pi x}{L})dx\\]
By the linearity of the summation, we can apply the integral at each \\(n\\), which will allow us to cancel out each term except when \\(m = n\\) due to the aforementioned orthogonality. You can see this below,
\\[\int_0^L\sum_{n = 1}^{\infty}b_n\sin(\frac{n \pi x}{L})\sin(\frac{m\pi x}{L})dx = \sum_{n = 1}^{\infty}\int_0^Lb_n\sin(\frac{n \pi x}{L})\sin(\frac{m\pi x}{L})dx\\]
It's easy to see that at each \\(n\\), when \\(n \neq m: \int_0^L b_n \sin(\frac{n \pi x}{L})\sin(\frac{m\pi x}{L})dx = 0\\). So we will simply get a sum of 0's everywhere, except where \\(n = m\\), since we get: \\(\int_0^L b_n\sin(\frac{n \pi x}{L})\sin(\frac{m\pi x}{L})dx = b_n\frac{L}{2}\\). Since adding 0 does not affect the sum, we are only left with  \\(b_n\frac{L}{2}\\). So,
\\[\int_0^L\phi(x)\sin(\frac{n \pi x}{L}) dx = b_n\frac{L}{2}\\]
Solving for \\(b_n\\), we get
\\[b_n = \frac{2}{L}\int_0^L \phi(x)\sin(\frac{n\pi x}{L})dx\\]
Repeating this process for our other initial condition \\(u_t(x, 0) = \psi (x)\\) we first compute \\(u_t\\) to get:
\\[u_t = \sum_{n = 1}^{\infty}\sin(\frac{n \pi x}{L})\[a_n(\frac{n\pi \alpha}{L})\cos(\frac{n \pi \alpha t}{L}) - b_n(\frac{n\pi \alpha}{L})\sin(\frac{n\pi \alpha}{L})\]\\]
Then plugging in our initial condition \\(u_t(x, 0) = \psi (x)\\), we get:
\\[u_t(x, 0) = \psi (x) = \sum_{n = 1}^{\infty}\sin(\frac{n \pi x}{L})\[a_n(\frac{n\pi \alpha}{L})\cos(0) - b_n(\frac{n\pi \alpha}{L})\sin(0)\]\\]
This simplifies to
\\[\psi (x) = \sum_{n = 1}^{\infty}a_n\frac{n\pi \alpha}{L}\sin(\frac{n \pi x}{L})\\]
Carrying out the same steps for \\(a_n\\) as we did for \\(b_n\\) yields, 
\\[a_n = \frac{2}{n\pi \alpha}\int_0^L\psi(x)\sin(\frac{n\pi x}{L}) dx\\]
And that's it, our final solution is
\\[u(x,t) = \sum_{n = 0}^{\infty}\sin(\frac{n\pi x}{L})\[a_n\sin(\frac{n \pi \alpha t}{L}) + b_n\cos(\frac{n \pi \alpha t}{L})\]\\]
Where 
\\[a_n = \frac{2}{n\pi \alpha}\int_0^L\psi(x)\sin(\frac{n\pi x}{L}) dx\\]
and 
\\[b_n = \frac{2}{L}\int_0^L \phi(x)\sin(\frac{n\pi x}{L})dx\\]
This is the final solution to the finite vibrating string with homogenous Dirichlet boundary conditions and arbitrary initial conditions (when \\(u\\) and \\(u_t\\) are given). 


