---
layout: archive
title: "Variational Calculus"
permalink: /notes/pde/variational-calc/
author_profile: false
--- 
<hr style="border: 2px solid black;">
We seek a method of minimizing/maximizing **functionals** instead of a normal function. If you do not know what a functional is, it is more or less a function that takes in another **function** and outputs a **scalar** (a number). In other words, it takes in a function and evaluates it in some way. The most familiar functional is the integral (more specifically the definite integral since the indefinite integral gives us a function back). For example
\\[J\[y\] = \int_a^b F(x,y,y')dx\\]
Is a functional, since it takes in a function \\(F(x,y,y')\\) and returns a value for it. Here, \\(y\\) is a function of \\(x\\), so our functional is taking in a function of \\(y\\), which is why we have \\(J\[y\]\\). What we are interested in, like in standard optimization, is finding how to minimize (maximize in some situations but we will consider minimization) this functional. In other words, we seek a function \\(\overline{y}(x)\\) that minimizes the output of \\(J\[y\]\\). This can be thought of as minimizing the time it takes to travel some path with only gravity as force. If you have not recognized, this is simply the *Brachistochrone problem* (introduced in 1696 by John Bernoulli). 
![Self Drawn Brachistochrone Problem](brachi.png)
Now, Bernoulli also derived the following function to determine the time is takes for an object to slide down a frictionless path with gravity. It is defined as
\\[\frac{1}{\sqrt{2g}}\int_a^b\sqrt{\frac{1+(y')^2}{y}}dx\\]
Now that we can see that this is a functional, we can use the techniques below to find the function for \\(y\\) that minimizes the time.

General Theory
===
Like in calculus where we find the min and max of a function by setting the derivative of thefunction equal to 0, here we set the derivative of the function equal to 0 but not quite in the same way. In the standard way of minimizing a function, for a function \\(g(x)\\), we set \\(g'(x) = 0\\) and solve for the **\\(x\\)** values that produce 0 for the derivative. In other words, we are taking the inverse of the function to find the set of \\(x\\) values that produce 0 for the derivative. In our scenario, we are not looking for values that satisfy this, but rather **functions** that satisfy the equality. In other words we have an ODE 
\\[\frac{df(x)}{dx} = 0\\]
This is called **the Euler-Lagrange Equation**. The problem will lie in finding the solution to this ODE in various cases. For the functional
\\[J\[y\] = \int_a^bF(x,y,y')dx\\]
We are looking for the \\(y(x)\\) that minimizes the functional and satisfies the boundary conditions 
\\[y(a) = A\\]
and
\\[y(b) = B\\]
Where \\(A\\) and \\(B\\) are just some constants. As mentioned, the goal is to find (we will now denote it) \\(\overline{y}(x)\\) that minimizes our functional. Now we introduce a "small" deviation from \\(\overline{y}(x)\\), we consider
\\[\overline{y}(x) + \varepsilon \eta (x)\\]
We typically consider \\(\varepsilon\\) a very small number but usually in the range \\((0,1)\\). \\(\eta (x)\\) is just some smooth curve that handles (satisfies) the boundary conditions \\(\eta (a) = \eta (b) = 0\\). Here we find an important inequality
\\[J\[\overline{y}\] \leq J\[\overline{y} + \varepsilon \eta \]\\]
Now if we consider \\(\phi(\varepsilon) = J\[\overline{y} + \varepsilon \eta \]\\), then we know that to find \\(\overline{y}\\), we minimize \\(\phi(\varepsilon)\\). If this isn't obvious, just consider our inequality, above, minimizing \\(\phi(\varepsilon)\\) will bring us to the function \\(\overline{y}\\) since we know that 
\\[J\[\overline{y}\] \leq J\[\overline{y} + \varepsilon \eta \]\\]
So at the lower extremity for \\(\phi (\epsilon)\\), our functionals will match and \\(\overline{y}\\) will be equal to the function that we find by minimizing \\(\phi(\varepsilon)\\). So we do the standard process of taking the derivative (with respect to \\(\varepsilon\\)) and **evaluating it at** \\(\varepsilon = 0\\) and set it equal to 0.
\\[\frac{d\phi(\varepsilon)}{d\varepsilon} = \frac{d}{d\varepsilon}J\[\overline{y} + \varepsilon \eta\]\\]
Now evaluating this at \\(\varepsilon = 0\\) 
\\[\int_a^b \left\[\frac{\partial F}{\partial \overline{y}}\eta(x) + \frac{\partial F}{\partial (\overline{y})^{\'}}\eta^{\'}(x)\right\]dx\\]
Integration by parts yields
\\[\int_a^b \left\[\frac{\partial F}{\partial \overline{y}} - \frac{d}{dx}\left(\frac{\partial F}{\partial (\overline{y})^{\'}}\right) \right\]\eta (x)dx = 0\\]
Here we note that this integral must be 0 **for any function** \\(\eta (x)\\) that is smooth and satisfies the boundary conditions. What this means, is that the rest of the integrand, 
\\[\frac{\partial F}{\partial \overline{y}} - \frac{d}{dx}\left(\frac{\partial F}{\partial \overline{y}'}\right)\\]
**Must** be 0, so setting this equal to 0 we get
\\[\frac{\partial F}{\partial \overline{y}} - \frac{d}{dx}\left(\frac{\partial F}{\partial \overline{y}'}\right) = 0\\]
And as mentioned earlier, this is the **Euler-Lagrange Equation**. This is a second order ODE in \\(\overline{y}\\). Solving this ODE will give us our minimum function \\(\overline{y}\\). In other words,








