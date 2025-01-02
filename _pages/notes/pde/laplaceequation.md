---
layout: archive
title: "Laplace's Equation"
permalink: /notes/pde/laplaceeq/
author_profile: false
--- 

<hr style="border: 2px solid black;">
\\[\nabla^2 u = 0\\]
\\(\nabla^2\\) is called **the Laplace operator** (or just Laplacian for short), and is arguably one of the most important operators in math and physics. The Laplacian essentially tells us how the value of a function at a point compares to the average of its neighbors. If \\(\nabla^2u > 0\\), then \\(u\\) (at that point) is less than the average of its neighbors. Visually, in 3 dimensions, this would look like a little dip in a stretched out fabric. If \\(\nabla^2u < 0\\), then \\(u\\) (at that point) is greater than the average of its neighbors. Visually, in 3 dimensions, this would look like someone poking their finger upwards from below a stretched out fabric, creating a little "peak". If \\(\nabla^2u = 0\\), then the region we are looking at would appear flat, since \\(u\\) (at that point) would be the same as the average of its neighbors. \\(\nabla^2u\\) is defined as the sum of all the spatial second partial derivatives. In two spatial dimensions (x,y), this looks like:
\\[\nabla^2u = \frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2}\\]
In 3 spatial dimensions (x,y,z), this looks like:
\\[\nabla^2u = \frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2} + \frac{\partial^2 u}{\partial z^2}\\]
We notice, that our function is no longer dependent on time. Initially, I found it hard to try and imagine a physical system that doesn't evolve with time. However, there are several, and the one that made most sense to me was the example of a static electric field. In a static electric field, we have a field that is at a steady-state, and will not change with time. Imagine a magnet, its magnetic field will not vary with time, but will vary with space, that is, if you were a charged particle and sat somewhere in a magnet's magnetic field, you will be pushed somewhere and eventually come to rest. Once you come to rest, no matter how long you sit there, the magnetic field will not change. This indicates that it is not changing with respect to time. However, if you somehow obtained the force needed to move through the magnetic field, the field itself would change as you move through it. This indicates that the field changes with respect to space. These are a couple of examples where Laplace's equation could be used to model the system. Now let's look at solving Laplace's equation.

Laplace's Equation in Polar Coordinates
====
The geometry of the boundaries of many problems that utilize Laplace's equation, are circular in some way (spherical, cylindrical, etc). So we shall consider Laplace's equation in polar coordinates. Then,
\\[\nabla^2u = 0\\]
Becomes
\\[u_{rr}+\frac{1}{r}u_r + \frac{1}{r^2}u_{\theta \theta} = 0\\]
This, for example, would be used to describe some steady state solution of a system with circular geometry (in 2 dimensions). If you do not see how we got here, recall the definition of polar coordinates:
\\[r^2 = x^2+y^2\\]
\\[\theta = \tan^{-1}(\frac{y}{x})\\]
or
\\[x = r\cos(\theta)\\]
\\[y = r\sin(\theta)\\]
From here we use the chain rule for partial derivatives, which is tedious but straightforward, so I will not include it here. Regardless, after transformation, we have the PDE: 
\\[u_{rr}+\frac{1}{r}u_r + \frac{1}{r^2}u_{\theta \theta} = 0\\]
Our boundary condition will usually be radially symmetric, in other words, it will be a function of \\(\theta\\).

Associated Boundary Conditions
====
We have the typical boundary conditions
1. Dirichlet: The value of the boundary is explicitly given (usually in terms of \\(\theta\\))
2. Neumann: The **flux** is given at the boundary (the derivative of the function with respect to \\(r\\) is given in terms of \\(\theta\\))
3. Robin: A combination of the two above

We will mostly concern ourselves with Dirichlet boundary conditions. The primary problems dealing with Laplace's equation and Dirichlet boundary conditions are called the *Interior Dirichlet Problem* and the *Exterior Dirichlet Problem*. To put it briefly, the former deals with solving Laplace's equation on the interior of a circle where the value at boundary of the circle is given. The latter deals with solving Laplace's equation on the outside of a circle, where the value of the function is given on the circle. We will solve the first problem below.

Interior Dirichlet Problem
====
We shall consider the following IBVP:
\\[\text{PDE: } u_{rr}+\frac{1}{r}u_r + \frac{1}{r^2}u_{\theta \theta} = 0 \text{, } \ \ \ 0 < r < 1\\]
\\[\text{Boundary Condition: } u(1, \theta) = g(\theta) \text{,  } \ \ \ 0 \leq \theta < 2\pi\\]
We will use the separation of variables technique again. Here we make the assumption that 
\\[u(r,\theta) = R(r)\Theta(\theta)\\]
I will compute the necessary partial derivatives below:
\\[u_{rr} = R^{\''}(r)\Theta(\theta)\\]
\\[u_r = R^{\'}(r)\Theta(\theta)\\]
\\[u_{\theta \theta} = R(r)\Theta^{\''}(\theta)\\]
Plugging this into our PDE:
\\[u_{rr}+\frac{1}{r}u_r + \frac{1}{r^2}u_{\theta \theta} = 0\\]
Becomes
\\[R^{\''}(r)\Theta(\theta) +\frac{1}{r}R^{\'}(r)\Theta(\theta) + \frac{1}{r^2}R(r)\Theta^{\''}(\theta) = 0\\]
Now we will try to move the two respective functions to opposite sides of the equation.
\\[\Theta(\theta)\[R^{\''}(r) +\frac{1}{r}R^{\'}(r)\] + \frac{1}{r^2}R(r)\Theta^{\''}(\theta) = 0\\]
Dividing by \\(\Theta(\theta)\\) we get:
\\[R^{\''}(r) +\frac{1}{r}R^{\'}(r) + \frac{1}{r^2}\frac{R(r)\Theta^{\''}(\theta)}{\Theta(\theta)} = 0\\]
Now dividing by \\(R(r)\\) we get:
\\[\frac{R^{\''}(r) +\frac{1}{r}R^{\'}(r)}{R(r)} + \frac{1}{r^2}\frac{\Theta^{\''}(\theta)}{\Theta(\theta)} = 0\\]
Moving the sum to opposite sides yields:
\\[\frac{R^{\''}(r) +\frac{1}{r}R^{\'}(r)}{R(r)} = - \frac{1}{r^2}\frac{\Theta^{\''}(\theta)}{\Theta(\theta)}\\]
But we want all functions of \\(r\\) to be on the same side of the equation, so we multiply both sides by \\(r^2\\) to get:
\\[\frac{R^{\''}(r) +\frac{1}{r}R^{\'}(r)}{R(r)}r^2 = - \frac{\Theta^{\''}(\theta)}{\Theta(\theta)}\\]
Finally, we now can conclude that since we have the variables completely separated, that these ratios must be equal to some constant, say \\(\lambda\\). We will now be able to produce two ODEs that are readily solvable.
\\[\frac{R^{\''}(r) +\frac{1}{r}R^{\'}(r)}{R(r)}r^2 = - \frac{\Theta^{\''}(\theta)}{\Theta(\theta)} = k \\]
Breaking this into two separate equations yields:
\\[\frac{R^{\''}(r) +\frac{1}{r}R^{\'}(r)}{R(r)}r^2 = k \\]
and 
\\[- \frac{\Theta^{\''}(\theta)}{\Theta(\theta)} = k \\]
We will use standard ODE theory to solve these ODEs. First, let's rewrite them in a more ODE-esque way
\\[r^2R^{\''}(r) +rR^{\'}(r) - k R(r) = 0 \\]
and
\\[\Theta^{\''}(\theta) + k \Theta(\theta) = 0 \\]
These are both second order ODEs. We will solve the ODE in \\(\Theta\\), since it is simpler. Note though, that our cases are flipped for \\(k < 0\\) and \\(k > 0\\), this is because in the ODE produced by the heat equation, we had a \\(-k\\) term, but here we just have \\(k\\).
\\[\Theta^{\''}(\theta) + k \Theta(\theta) = 0 \\]
From our work with the heat equation, we know that the solution to this has 3 possible forms:
1. \\(k = 0: \Theta(\theta) = A\theta + B\\)
2. \\(k > 0: \Theta(\theta) = A\sin(\beta \theta) + B\cos(\beta \theta)\\)
3. \\(k < 0: \Theta(\theta) = Ae^{\beta \theta} + Be^{-\beta \theta}\\)

Although we don't have the same restrictions as before, there are some to note. We want  \\(u(r\theta)\\) to be \\(2\pi\\)-periodic and be bounded at the origin. The second restriction will be important when solving the other ODE, we use the first restriction for our ODE in \\(\Theta\\). So let's go through all the cases, I will begin with case 3.
\\
\\
**Case 3:** \\(k < 0\\), now let's find the roots of the characteristic equations. 
\\[\lambda^2 + k = 0 \implies \lambda = \sqrt{-k}\\]
Now by assumption \\(k < 0\\), so \\(-k\\) is a positive number. This will imply that \\(\sqrt{-k}\\) produces two real values, a positive and negative value of \\(\sqrt{-k}\\). So \\(\lambda_1 = \sqrt{-k}\\) and \\(\lambda_2 = -\sqrt{-k}\\), and the corresponding solution for two real roots is 
\\[\Theta (\theta) = Ae^{\sqrt{-k} \theta} + Be^{-\sqrt{-k} \theta}\\]
Now, as mentioned we need this to be \\(2\pi\\)-periodic \\(\implies \Theta (\theta) = \Theta (\theta + 2\pi)\\) must be true. So writing this out we get,
\\[\Theta (\theta) = Ae^{\sqrt{-k} \theta} + Be^{-\sqrt{-k} \theta} = \Theta (\theta + 2\pi) = Ae^{\sqrt{-k}(2\pi + \theta)} + Be^{-\sqrt{-k}(2\pi + \theta)}\\]
So,
\\[Ae^{\sqrt{-k} \theta} + Be^{-\sqrt{-k} \theta} = Ae^{\sqrt{-k}(2\pi + \theta)} + Be^{-\sqrt{-k}(2\pi + \theta)}\\]
We can break the \\(e^{\sqrt{-k}(2\pi + \theta)}\\) into \\(e^{2\pi \sqrt{-k}}e^{\sqrt{-k} \theta}\\), rewriting the equation this way, we get
\\[Ae^{\sqrt{-k} \theta} + Be^{-\sqrt{-k} \theta} = Ae^{2\pi \sqrt{-k}}e^{\sqrt{-k} \theta} + Be^{-2\pi \sqrt{-k}}e^{-\sqrt{-k} \theta}\\]
So if we look at this equation, we see that the expression being multiplied by \\(A\\) on the left hand side must match the expression being multiplied to \\(A\\) on the right hand side. We can repeat this observation for \\(B\\). Doing this we get the following two conclusions:
\\[e^{\sqrt{-k} \theta} = e^{2\pi \sqrt{-k}}e^{\sqrt{-k} \theta}\\]
And
\\[e^{-\sqrt{-k} \theta} = e^{-2\pi \sqrt{-k}}e^{-\sqrt{-k} \theta}\\]
We can simplify these expressions to 
\\[e^{2\pi \sqrt{-k}} = 1\\]
\\[e^{-2\pi \sqrt{-k}} = 1\\]
Now here, we know that \\(e^x = 1 \implies x = 0\\), this means \\(2\pi \sqrt{-k} = 0\\) and \\(-2\pi \sqrt{-k} = 0\\). The only way for this to be possible, is if \\(\sqrt{-k} = 0\\), however this contradicts our assumption that \\(k < 0 \implies \sqrt{-k} \neq 0\\). So this solution cannot work, since this expression is not \\(2\pi\\)-periodic, and we now also know that \\(k \ge 0\\). \\
\\
Now let's try case 1. \\
**Case 1:** \\(\Theta (\theta) = A\theta + B\\), now let's test \\(2\pi\\)-periodicity. So we need, \\(\Theta (\theta) = \Theta (2\pi + \theta)\\). Plugging this in we get,
\\[A\theta + B = A(2\pi + \theta) + B\\]
This simplifies to
\\[A\theta + B = 2\pi A + A\theta + B\\]
Subtracting \\(B\\) from both sides yields, 
\\[A\theta = 2\pi A + A\theta\\]
Subtracting \\(A\theta\\) to get
\\[2\pi A = 0 \implies A = 0\\]
So for our solution to be \\(2\pi\\)-periodic, we need \\(A = 0\\), so our solution simplifies to a constant \\(C\\)
\\[\Theta (\theta) = C\\]
Now for our final case, case 2\\
**Case 2:** \\(\Theta (\theta) = A\cos(\sqrt{-k} \theta) + B\sin(\sqrt{-k} \theta)\\). Now let's check if this can be \\(2\pi\\)-periodic, i.e. \\(\Theta (\theta) = \Theta (2\pi + \theta)\\). Note here, that since \\(k > 0\\), \\(\sqrt{-k}\\) produces an imaginary unit, so \\(\sqrt{-k} = \sqrt{k}i\\). So we will consider \\(\sqrt{k}\\) in our equation. Plugging this in yields,
\\[A\cos(\sqrt{k} \theta) + B\sin(\sqrt{k} \theta) = A\cos(\sqrt{k} (2\pi + \theta)) + B\sin(\sqrt{k} (2\pi + \theta))\\]
Now to simplify this we will need the following trig-identities:
\\[\cos(\sqrt{k}(2\pi + \theta)) = \cos (2\sqrt{k}\pi) \cos (\sqrt{k}\theta) - \sin (2\sqrt{k}\pi) \sin (\sqrt{k}\theta)\\]
\\[\sin(\sqrt{k}(2\pi + \theta)) = \sin (2\sqrt{k}\pi) \cos (\sqrt{k}\theta) + \cos (2\sqrt{k}\pi) \sin (\sqrt{k}\theta)\\]
Substituting this into our solution, this
\\[A\cos(\sqrt{-} \theta) + B\sin(\sqrt{k} \theta) = A\cos(\sqrt{k} (2\pi + \theta)) + B\sin(\sqrt{k} (2\pi + \theta))\\]
Changes into below,
\\[A\cos(\sqrt{k} \theta) + B\sin(\sqrt{k} \theta) = A(\cos (2\sqrt{k}\pi} \cos (\sqrt{k}\theta) - \sin (2\sqrt{k}\pi} \sin (\sqrt{k}\theta)) + B(\sin (2\sqrt{k}\pi} \cos (\sqrt{k}\theta) + \cos (2\sqrt{k}\pi} \sin (\sqrt{k}\theta))\\]
As we did in our first case, we will essentially compare the constants in front of our functions to make a statement about equality. It is important to note which terms are constants here, \\(A, B, \cos{2\pi\sqrt{-k}}, \cos(2\pi \sqrt{k}), \sin(2\pi \sqrt{k})\\). Any term with a \\(\theta\\) is **not** constant. Now rewriting the equation and distributing \\(A\\) and \\(B\\), we get
\\[\cos(\sqrt{k} \theta)A + \sin(\sqrt{k} \theta)B = A\cos (2\sqrt{k}\pi) \cos (\sqrt{k}\theta) - A\sin (2\sqrt{k}\pi) \sin (\sqrt{k}\theta)) + B\sin (2\sqrt{k}\pi) \cos (\sqrt{k}\theta) + B\cos (2\sqrt{k}\pi) \sin (\sqrt{k}\theta))\\]
Now, we want to push all of the constants in front of our \\(\cos(\sqrt{k}\theta), \sin(\sqrt{k}\theta)\\) terms so that we can compare them directly to the left hand side of the equation. First grouping \\(\cos(\sqrt{k}\theta), \sin(\sqrt{k}\theta)\\) yields:
\\[\cos(\sqrt{k} \theta)A + \sin(\sqrt{k} \theta)B = (A\cos (2\sqrt{k}\pi) \cos (\sqrt{k}\theta) + B\sin (2\sqrt{k}\pi} \cos (\sqrt{k}\theta)) + (- A\sin (2\sqrt{k}\pi) \sin (\sqrt{k}\theta) + B\cos (2\sqrt{k}\pi) \sin (\sqrt{k}\theta))\\]

\\
\\
\\
\\[\Theta^{\''}(\theta) + k \Theta(\theta) = 0 \\]
We get
\\[\lambda^2 + k = 0 \implies \lambda = \sqrt{-k}\\]
Where \\(k > 0\\), since to get a complex root (which produces solution 2.) then \\(k > 0\\) ensures that we are taking the square root of a negative number (and producing an imaginary unit as a result). However, \\(\Theta(\theta)\\) must match our initial condition, since we assumed \\(u(r,\theta) = R(r)\Theta (\theta)\\), then the initial condition \\(u(1,\theta) = g(\theta) \implies g(\theta) = \Theta (\theta)\\). If it still isn't obvious, \\(u(1,\theta) = g(\theta)\\) tells us that when we plug \\(1\\) into our solution, we get \\(u(1,\theta) = R(1)\Theta (\theta)\\). Here \\(R(1)\\) is essentially a constant \\(c\\) times \\(\Theta (\theta)\\), which is \\(ca_nsin(\sqrt{k} \theta) + cb_ncos(\sqrt{k} \theta\\), and it's easy to see that \\(ca_n\\) and \\(cb_n\\) are just themselves constants. Now, we expand \\(g(\theta)\\) as a Fourier-Series to get
\\[g(\theta) = \sum_{n = 0}^{\infty}a_n\cos(n\theta) + b_n\sin(n\theta)\\]
And as mentioned \\(g(\theta) = \Theta (\theta)\\), writing this out yields
\\[g(\theta) = \sum_{n = 0}^{\infty}c_n\cos(n \theta) + d_n\sin(n \theta) = \Theta (\theta) = \sum_{n = 0}^{\infty}a_n\cos(\sqrt{k} \theta) + b_n\sin(\sqrt{k} \theta)\\]
This tells us that \\[\forall n, \Theta_n (\theta) = c_n\cos(n \theta) + d_n\sin(n \theta) \implies \sqrt{k} = n \implies k = n^2\\]

Now we will tackle the other ODE
\\[r^2R^{\''}(r) +rR^{\'}(r) - k R(r) = 0 \\]
Is called an Euler Differential Equation. These differential equations are of the form
\\[\alpha x^2y^{\''} + \beta xy^{\'} + \omega y = 0\\]
Where \\(\alpha, \beta, \omega\\) are all constants. In other words, it's a differential equation, with constants multiplied to the **independent** variable being raised to the same power as the order of the derivative of \\(y\\) that it's being multiplied to. To solve our example (with variables \\(r\\) and function \\(R\\)), we assume \\(R = r^{\gamma}\\) where \\(\gamma\\) is a constant that we will find. So, computing the necessary derivatives yields:
\\[R^{\''} = \gamma^2 r^{\gamma - 2}\\]
\\[R^{\'} = \gamma r^{\gamma - 1}\\]
Plugging these into our DE, we get
\\[r^2(\gamma^2 r^{\gamma - 2}) +r(\gamma r^{\gamma - 1}) - k r^{\gamma} = 0\\]
We then do algebraic manipulation by dividing out \\(r^{\gamma}\\), and we will get an algebraic equation. However. we know what \\(k\\) is so the equation becomes
\\[r^2(\gamma^2 r^{\gamma - 2}) +r(\gamma r^{\gamma - 1}) - n r^{\gamma} = 0\\]
And without going through all the possible cases, depending on the roots to this characteristic equation, we get different possible solutions. In this case, we get the following solution:
\\[R(r) = ar^{n} + br^{-n}\\]
We have to be careful here, since \\(r \in (0, 1)\\), then it's a "small" decimal value, if we raise this number to a negative power \\(-n\\) we will get \\(\frac{1}{r^n}\\), the numerator \\(r^n\\) will be even smaller than \\(r\\) so we will get 1 divided by a really small number, which produces a very large number. As \\(n \rightarrow \infty\\) these denominators will get smaller and smaller, making \\(\frac{1}{r^n} \rightarrow \infty\\). Our solution obviously should be bounded, especially since we know \\(n \rightarrow \infty\\), so we can conclude that \\(b = 0\\), essentially throwing away the unbounded term \\(r^{-n}\\). So we now have solutions to both of our ODEs and we can say
\\[u(r, \theta) = \sum_{n = 0}^{\infty}R(r)\Theta(\theta) = \sum_{n = 0}^{\infty}a_nr^n\[b_n\cos(n \theta) + c_n\sin(n \theta)\]\\]
This simplifies to 
\\[u(r, \theta) = = \sum_{n = 0}^{\infty}r^n\[a_n\cos(n \theta) + b_n\sin(n \theta)\]\\]
Where \\(a_n\\) and \\(b_n\\) are constants that we will find based on our initial condition.
\\[u(1, \theta) = g(\theta)  = \sum_{n = 0}^{\infty}a_n\cos(n \theta) + b_n\sin(n \theta)\\]
When \\(n = 0\\) we get that 
\\[g(\theta) = a_0\cos(0) + b_0\sin(0)\\]
\\[\cos(0) = 1, \ \ \ \sin(0) = 0\\]
Our equation simplifies to
\\[g(\theta) = a_0\cos(0)\\]
Multiplying both sides of the equation by \\(\cos(0)\\) and integrating from \\(0\\) to \\(2\pi\\). We get 
\\[\int_0^{2\pi}\cos(0)g(\theta)d\theta = \int_0^{2\pi}\cos(0)\cos(n \theta) d\theta\\]
Using the fact that  \\(\cos(n \theta)\\) is orthogonal on \\(\[0,2\pi\]\\). This means the right hand side integral 

So instead of computing the solution for each possible \\(k\\), I will just state them and we will try to determine which ones are possible. 

