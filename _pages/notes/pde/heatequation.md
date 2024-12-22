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
As mentioned, the initial condition is the function or behavior of the function, defined at time 0 (when \\(t = 0\\)). For example, if we consider that our initial condition is: \\(u(x, 0) = 0\\), this implies that there is initially no heat on the metal rod. 

Separation of Variables
=
<hr style="border: 2px solid black;">
This is a very powerful and straight forward method to solving PDEs, and requires us to make an assumption on the form of the solution and separating the \\(x\\) and \\(t\\) variables. Once we separate the variables, we arrive at ODEs in those variables, whose solutions are well known (through ODE theory). 

So, How do we Begin to Solve it?
=====
We begin by making an assumption, this assumption is not random and does come from strong intuition. We assume that the solution takes the form,
\\[u(x,t) = T(t)X(x)\\] In other words, we assume that the multivariable function \\(u(x,t)\\), is the product of a function of \\(t\\) and a function of \\(x\\), which we write as \\(T(t)\\) and \\(X(x)\\) respectively. This will allow us to "separate" the variables later.


Why Make this Assumption?
=====
As mentioned, this assumption is not random. We could skip trying to assume that the solution has the form \\(u(x,t) = T(t) + X(x)\\) since a solution of this form will have \\(u_t = T'(t)\\) and \\(u_{xx} = X^{\''}(x)\\), and plugging that into the PDE will give: \\[T'(t) =\alpha^2X^{\''}(x)\\] But since \\(x\\) doesn't vary with \\(t\\) and vice versa, then the only way for this equation to be true, is for \\(T(t)\\) and \\(X(x)\\) to be constants, which is typically a sort of trivial solution to our problem. We want something that changes over time and evolves like heat does. The next step up from this assumption would be the assumption we made earlier. More complicated assumptions can usually be broken down into either a product, sum, or some combination of those. Therefore it would be intuitive to explore the \\(u(x,t) = T(t)X(x)\\) assumption. 

Back to Solving the PDE
=====
Now with our assumption in hand, we can rewrite our PDE. If \\(u(x,t) = T(t)X(x)\\), then \\(u_t = T'(t)X(x)\\) and \\(u_{xx} = X^{\''}(x)T(t)\\), you can verify this by basic differentiation. We now rewrite our PDE by replacing \\(u\\) with our assumed form, in doing this we get that the PDE is \\[T'(t)X(x) = \alpha^2X^{\''}(x)T(t)\\] By dividing both sides by \\(T(t)\\) and \\(X(x)\\), we arrive at \\[\frac{T'(t)}{T(t)} = \alpha^2\frac{X^{\''}(x)}{X(x)}\\]

For simplicity in future computation, I will also move the \\(\alpha^2\\) term to the left hand side of the equation by dividing both sides by \\(\alpha^2\\). At last, we have the equation \\[\frac{T'(t)}{\alpha^2T(t)} = \frac{X^{\''}(x)}{X(x)}\\]

Here, we come to a very important conclusion. Since the left hand side of the equation is strictly in terms of \\(t\\) and the right hand side is strictly in terms of \\(x\\), then for example, if we allow \\(t\\) to vary, the right hand side of of the equation: \\[\frac{X^{\''}(x)}{X(x)}\\] will not change, since it is only dependent on \\(x\\). What this tells us, is that the ratio: \\[\frac{T'(t)}{\alpha^2T(t)}\\] is **constant**. i.e. \\(\alpha^2T(t)\\) is always inversely proportional to \\(T'(t)\\), and therefore is constant and does not change. The same logic can be used in the opposite direction, if we allow \\(x\\) to vary, we can say the same thing about the ratio of \\(\frac{X^{\''}(x)}{X(x)}\\) being **constant**. We call this constant **k**, and we know that \\[\frac{T'(t)}{\alpha^2T(t)} = \frac{X^{\''}(x)}{X(x)} = k\\]
We are now in a position to start finding functions that satisfy this equation. Now we will treat our previous equation, as two separate equations, that is \\[\frac{T'(t)}{\alpha^2T(t)} = k\\] and \\[\frac{X^{\''}(x)}{X(x)} = k\\]
By rearranging the equations as below, we see we have two linear homogenous ODEs. The ODE in \\(t\\) is of first order and the ODE in \\(x\\) is of second order. \\[T'(t) - k\alpha^2T(t) = 0\\] and \\[X^{\''}(x) - kX(x) = 0\\]
Once we rewrite the ODE in \\(t\\) as \\[T'(t) = k\alpha^2T(t)\\] it is pretty apparent the solution is of the form \\(Ae^{k\alpha^2t}\\). 
If you do not see why, I have in depth ODE notes as well. But to explain it briefly, if we do our cheat of treating \\(T'(t)\\) as a fraction by using Leibniz notation, we get \\[\frac{dT}{dt} = k\alpha^2T\\] Multiplying both sides by \\(dt\\) and dividing both sides by \\(T\\) we have the equation \\[\frac{1}{T}dT = k\alpha^2dt\\] We then integrate both sides, \\[\int \frac{1}{T}dT = \int k\alpha^2dt\\]
which results in \\[ln|T| = k\alpha^2t + C\\] where \\(C\\) is just the constant of integration. Finally, we exponentiate both sides to get rid of the \\(ln|T|\\), this leaves us with \\[T = e^{k\alpha^2t + C}\\] And by law of exponents, this is equivalent to \\[T = e^Ce^{k\alpha^2t}\\] But \\(e^C\\) is just itself a constant, which we shall call \\(A\\). So in its final form, \\[T(t) = Ae^{k\alpha^2t}\\]

Now here we can make a very important observation, if \\(k > 0\\) then \\(T(t)\\) will be \\(e\\) raised to a positive power, since time (\\(t\\)) is always greater than 0, and so is \\(\alpha^2\\). However, this also implies that as time increases (\\(t \rightarrow \infty\\)), then \\(T \rightarrow \infty\\), from a physical point of view, this is contradictory, since we cannot have unbounded heat with no source of heat. So we conclude that \\(k < 0\\). \
Now to tackle the second order ODE \\[X^{\''}(x) - kX(x) = 0\\]
The characteristic equation for this ODE is \\[\lambda^2 - k = 0\\]
Solving for \\(\lambda\\) we get that \\(\lambda = \sqrt k\\). There are three possible solution forms for second order ODEs, depending on the roots of the characteristic equation.

1. One real root (sometimes call repeated roots): \\(X(x) = \(A+Bx)e^{\lambda x}\\) where \\(A\\) and \\(B\\) are constants and \\(\lambda\\) is the root of the characteristic equation.

2. Two real roots: \\(X(x) = Ae^{\lambda_1x} + B e^{\lambda_2x}\\) where \\(A\\) and \\(B\\) are constants, and \\(\lambda_1\\) and \\(\lambda_2\\) are the roots of the characteristic equation.

3. Complex root (root of the form \\(\alpha + \beta i\\)): \\(X(x) = e^{\alpha x}(Acos(\beta x) + Bsin(\beta x))\\)

In our scenario the solution of the characeristic equation is complex since \\(k\\) is negative, meaning \\(\sqrt k\\) produces an imaginary unit \\(i\\). So, more specifically, the solution to our characteristic equation is of the form \\(\alpha + \beta i\\). Where \\(\alpha = 0\\), \\(\beta = \sqrt{-k}\\). This is due to the fact that \\(k\\) is negative, so \\(\sqrt k = \sqrt {-k}i\\), then our solution will be of the form \\[X(x) = Acos(\sqrt{-k}x) + Bsin(\sqrt{-k}x)\\]
Now that we have found \\(T(t)\\) and \\(X(x)\\), we can say that the *general* solution to the heat equation is \\[u(x,t) = Ae^{k\alpha^2t}(Bcos(\sqrt{-k}x) + Csin(\sqrt{-k}x))\\] Where A, B, and C are arbitrary constants. This implies that any choice of A, B, and C will result in a solution to the heat equation. However, we can simplify this some, by distributing the \\(A\\) we get \\[u(x,t) = e^{k\alpha^2t}(A\times Bcos(\sqrt{-k}x) + A\times Csin(\sqrt{-k}x))\\] Since \\(A\times B\\) and \\(A\times C\\) are both just products of constants (which produces another constant), we can simly write them as \\(A\\) and \\(B\\), hence our *general* solution to the heat equation is \\[u(x,t) = e^{k\alpha^2 t}(Asin(\sqrt{-k}x) + Bcos(\sqrt{-k}x))\\] 

Extending the Solution to Solve with Boundary Conditions
=====
To solve the heat equation with boundary conditions, you typically begin with the most simple case, homogenous Dirichlet boundary conditions. In the case of the one dimensional metal rod of length 1, our homogenous Dirichlet boundary conditions would be \\[u(0,t) = 0\\] and \\[u(1,t) = 0\\] Now since we know \\[u(x,t) = T(t)X(x)\\] then \\[u(0,t) = X(0)T(t) = 0\\] and \\[u(1,t) = X(1)T(t) = 0\\] This implies that \\(X(0) = 0\\) and \\(X(1) = 0\\) So, to extend our solution to account for this, we consider: \\[X(x) = Acos(\sqrt{-k}x) + Bsin(\sqrt{-k}x)\\] Now it is not enough for this function to satisfy the ODE that we previously solved. Now, it must also satisfy our boundary conditions, i.e. \\(X(0) = 0\\) and \\(X(1) = 0\\), so let's write that out. 
\\[X(0) = 0 = Acos(\sqrt{-k}\times 0) + Bsin(\sqrt{-k}\times 0)\\] this simplifies to \\[Acos(0) + Bsin(0) = 0\\] We know that \\(sin(0) = 0\\) and that \\(cos(0) = 1\\). So our equation simplifies to: \\[A = 0\\] This tells us that \\(A\\) is \\(0\\), so now we can write \\[X(x) = Bsin(\sqrt{-k}x)\\] Since \\(A\\) being \\(0\\) cancels out the \\(cos\\) term. \
However, we also need to satisfy \\(X(1) = 0\\). So plugging in \\(x = 1\\) we get, \\[X(1) = Bsin(\sqrt{-k}) = 0\\]
Now, we cannot let \\(B = 0\\), since our solution will be trivial (i.e. \\(X(x) = 0, \forall x \\) and that would mean \\(u(x,t) = 0\times T(t) \implies \ u(x,t) = 0\\), a trivial solution). \
Therefore, we need \\(\sqrt{-k}\\) to **force** \\(sin(\sqrt{-k})\\) to be \\(0\\), \\(\forall k\\), in order to satisfy our boundary condition. We know that \\(sin(x) = 0\\) when \\(x\\) is an integer multiple of \\(\pi\\). This tells us that if \\(\sqrt{-k} = n\pi\\), \\(\forall n \in \mathbb{Z}^+\\), then \\(sin(\sqrt{-k}) = 0\\). So we let \\(\sqrt{-k} = n\pi\\), and solve for \\(k\\), we get that \\[k = -(n\pi)^2\\] Now we substitute \\(-(n\pi)^2\\) in, for \\(k\\). Doing that, we get \\[Bsin(\sqrt{(n\pi)^2})\\] which reduces to \\[Bsin(n\pi)\\] and \\[Bsin(n\pi) = 0\\] Which satisfies our boundary condition, so \\(X_n(x) = Bsin(n\pi x)\\). We subscript \\(X(x)\\) (and later \\(T(t)\\)) because we have a different function for each \\(n\\).\
**Note**: We also substitute \\(-(n\pi)^2\\) in for \\(k\\) in our function of \\(t\\) \\[T(t) = Ae^{k\alpha^2t}\\] Becomes \\[T_n(t) = Ae^{-(n\pi\alpha)^2t}\\]
This was one of the last major steps, we now know the solution to the (homogenous 1 dimensional) heat equation with Dirichlet boundary conditions is: \\[u_n(x,t) = A_ne^{-(n\pi\alpha)^2t}sin(n\pi x)\\] However, this is a sequence of solutions. Each positive integer \\(n\\) can produce a solution to the heat equation with our boundary conditions. So to consolidate this into one solution, we also consider the *initial condition*. For generality, we will consider an arbitrary function \\(\phi(x)\\).

Final Step: Extending the Solution to Solve with an Initial Condition
=====
So, our initial condition is, \\[u(x,0) = \phi(x)\\]
By **The Law of Superposition**, the linear combination of any solutions to a PDE, is itself a solution to the PDE. Essentially, if solutions to a PDE exist, then they form a vector space. With this in mind, we would like to sum up all possible solutions we had (basically sum up each \\(u_n(x,t)\\)) in such a way that satisfies the initial condition. This problem led Joseph Fourier to the conclusion that any *nice* function can be written as an infinite sum of \\(sin\\) and \\(cos\\) waves. What this means, is that for some random function \\(f(x)\\) defined on the interval \\([0, L]\\) we can write, \\[f(x) = \sum_{n = 1}^{\infty}a_nsin(\frac{(n\pi)}{L}x)\\]
