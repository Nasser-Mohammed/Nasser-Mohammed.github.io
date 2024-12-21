---
layout: archive
title: "The Heat Equation"
permalink: /notes/heatequation/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\[u_t=\alpha^2u_{xx}\\]

Solved by Joseph Fourier in 1822, the heat equation is typically the first PDE students are introduced to, due to its nice and intuitive nature.
In one dimension, we seek a function, that essentially has its first time derivative equal to its second space derivative (for preliminary intuition, we can ignore the \\(\alpha^2\\) term). The question now, is how do we go about solving for the function or functions that satisfy this equation. Intuitively this should feel like a more daunting task than solving for a variable in a traditional algebraic equation. This intuition is correct, without additional information, this equation has an infinite number of solutions. For example, any constant value satisfies this equation, any linear polynomial in \\(x\\) with arbitrary coefficients will satisfy this equation, as well as many other functions. This leads us to our typical boundary conditions.

Boundary Conditions on the Heat Equation
==
The most basic boundary conditions are called Dirichlet boundary conditions. These are boundary conditions that explicitly specify the value of the function at the spatial boundaries. If we consider a metal rod of length 1, then the Dirichlet boundary conditions would be the value of \\(u\\) at \\(x = 0\\) and \\(x = 1\\). 

Initial Condition on the Heat Equation
==
As mentioned, the initial condition is the function or behavior of the function, defined at time 0 (when \\(t = 0\\)). For now we will simply consider that our initial condition is: \\(u(x, 0) = 0\\). In other words, there is initially no heat on the metal rod. 

How do we Begin to Solve it?
==
We begin by making an assumption, this assumption is not random and does come from strong intuition. We assume that the solution takes the form,
\\[u(x,t) = T(t)X(x)\\] In other words, we assume that the multivariable function \\(u(x,t)\\), is the product of a function of \\(t\\) and a function of \\(x\\), which we write as \\(T(t)\\) and \\(X(x)\\) respectively.


Why Make this Assumption?
=====
As mentioned, this assumption is not random. We could skip trying to assume that the solution has the form \\(u(x,t) = T(t) + X(x)\\) since a solution of this form will have \\(u_t = T'(t)\\) and \\(u_{xx} = X^{\''}(x)\\), and plugging that into the PDE will give: \\[T'(t) =\alpha^2X^{\''}(x)\\] But since \\(x\\) doesn't vary with \\(t\\) and vice versa, then the only way for this equation to be true, is for \\(T(t)\\) and \\(X(x)\\) to be constants, which is typically a sort of trivial solution to our problem. We want something that changes over time and evolves like heat does. The next step up from this assumption would be the assumption we made earlier. More complicated assumptions can usually be broken down into either a product, sum, or some combination of those. Therefore it would be intuitive to explore the \\(u(x,t) = T(t)X(x)\\) assumption. 

Back to Solving the PDE
=====
Now with our assumption in hand, we can rewrite our PDE. If \\(u(x,t) = T(t)X(x)\\), then \\(u_t = T'(t)X(x)\\) and \\(u_{xx} = X^{\''}(x)T(t)\\), you can verify this by basic differentiation. We now rewrite our PDE by replacing \\(u\\) with our assumed form, in doing this we get that the PDE is \\[T'(t)X(x) = \alpha^2X^{\''}(x)T(t)\\] By dividing both sides by \\(T(t)\\) and \\(X(x)\\), we arrive at \\[\frac{T'(t)}{T(t)} = \alpha^2\frac{X^{\''}(x)}{X(x)}\\]

For simplicity in future computation, I will also move the \\(\alpha^2\\) term to the left hand side of the equation by dividing both sides by \\(\alpha^2\\). At last, we have the equation \\[\frac{T'(t)}{\alpha^2T(t)} = \frac{X^{\''}(x)}{X(x)}\\]

 


