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
\\[\frac{R^{\''}(r) +\frac{1}{r}R^{\'}(r)}{R(r)}r^2 = - \frac{\Theta^{\''}(\theta)}{\Theta(\theta)} = \lambda \\]
Breaking this into two separate equations yields:
\\[\frac{R^{\''}(r) +\frac{1}{r}R^{\'}(r)}{R(r)}r^2 = \lambda \\]
and 
\\[- \frac{\Theta^{\''}(\theta)}{\Theta(\theta)} = \lambda \\]
We will use standard ODE theory to solve these ODEs. First, let's rewrite them in a more ODE-esque way
\\[r^2R^{\''}(r) +rR^{\'}(r) - \lambda R(r) = 0 \\]
and
\\[\Theta^{\''}(\theta) + \lambda \Theta(\theta) = 0 \\]
These are both second order ODEs. We will solve the ODE in \\(\Theta\\), since it it simpler.
\\[\Theta^{\''}(\theta) + \lambda \Theta(\theta) = 0 \\]
From our work with the heat equation, we know that the solution to this has 3 possible forms:




\\[r^2R^{\''}(r) +rR^{\'}(r) - \lambda R(r) = 0 \\]
Is called an Euler Differential Equation. These differential equations are of the form
\\[\alpha x^2y^{\''} + \beta xy^{\'} + \omega y = 0\\]
Where \\(\alpha, \beta, \omega\\) are all constants. In other words, it's a differential equation, with constants multiplied to the **independent** variable being raised to the same power as the order of the derivative of \\(\y\\) that it's being multiplied to. To solve our example (with variables \\(r\\) and function \\(R\\)), we assume \\(R = r^{\gamma}\\) where \\(\gamma\\) is a constant that we will find. So, computing the necessary derivatives yields:
\\[R^{\''} = \gamma^2 r^{\gamma - 2}\\]
\\[R^{\'} = \gamma r^{\gamma - 1}\\]
Plugging these into our DE, we get
\\[r^2(\gamma^2 r^{\gamma - 2}) +r(gamma r^{\gamma - 1}) - \lambda r^{\gamma} = 0\\]
We then do algebraic manipulation by dividing out \\(x^{\gamma}\\), and we will get an algebraic equation. However, in our case we don't know what \\(\lambda\\) is, which would affect our solution. So instead of computing the solution for each possible \\(\lambda\\), I will just state them and we will try to determine which ones are possible. 

