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
There are several boundary conditions to consider but we will mostly be concerned with two kinds:
 - endpoints held at 0 (homogenous)
 - endpoints that vary with time
 - force specified on the end points

To interpret these, let's consider the first boundary condition, imagine a guitar string that is clamped down at the ends (as usual), if you pull the string up and release, it will send "standing" waves through the string. For the second boundary condition, imagine two people holding opposite ends of a rope, where they are raising there end up and down. Intuitively, this will send "waves" through the string, so we will seek a function that describes these waves As for the last boundary condition, we consider the endpoints of a string connected to a frictionless sleeve, now as the sleeve moves up and down, it will drag the string with it. In that way, we have the force specified at the boundary, instead of the explicit position of the string at the endpoint. In the rest of this page, I will only consider the first boundary condition.

The Vibrating Wave (Guitar String)
===
Consider the following IBVP:

\\[\text{PDE:  } u_{tt} = \alpha^2u_{xx} \text{   } 0 < x < L  \text{  } 0 < t < \infty\\]
\\[\text{Boundary conditions:  } u(0, t) = 0 = u(L, t)\\]
\\[\text{Initial conditions:  } u(x,0) = \phi(x) \text{,   }  u_t(x, 0) = \psi(x)\\]
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
So it is apparent that we have two ODEs. However, there is a big difference between this scenario and the heat equation. In the heat equation, we showed that our constant \\(k\\) **must** be negative, however, in this scenario we cannot make such an assumption. Recall, we made that assumption because we solved for our simple first order ODE in \\(t\\) that didn't rely on the value of \\(k\\), however, our ODE in \\(t\\) is no longer first order. So both of our ODEs **do** depend on \\(k\\). However, we do know that both \\(X(x)\\) and \\(T(t)\\) have three possible solution forms.

1. first thing
2. second thing
3. third thing

