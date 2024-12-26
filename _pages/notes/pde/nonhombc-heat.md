---
layout: archive
title: "The Heat Equation with Non-Homogenous Boundary Conditions"
permalink: /notes/pde/nonhombc-heat/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\[u_t=\alpha^2u_{xx}\\] 

As you can see, the PDE is the same as before. However, we will want to consider non-homogenous Dirichlet boundary conditions. That is, we want our boundary conditions to be either some constant other than 0, or a function of time only. For simplicity, we are still considering the one dimensional metal rod of length 1. An example of non-homogenous Dirichlet boundary conditions are below,

\\[u(t, 0) = 5, u(t, 1) = 2\\]
\\[u(t, 0) = 3t, u(t, 1) = t^2\\]

So how do we go about solving such a problem? Well, it turns out that we assume the solution takes a particular form. That is, we assume that the solution \\(u\\) is the sum of a steady-state and transient solution. Our goal is to "homogenize" the boundary conditions, and solve a PDE for another function which is related to the solution of our problem in a known way. 
\\[u(x,t) = S(x,t) + U(x,t)\\]
\\[\text{Where } S(x,t) \text{ is our stead-state, and } U(x,t) \text{ is our transient part}\\]
A steady-state solution (sometimes called a "homogenizer"), is one that handles the boundary conditions, so we form this function in such a way that equals the boundary conditions at \\(x = 0\\) and \\(x = 1\\).
It takes some trial and error to find a proper "homogenizer", but usually, we start off with simple functions like lower degree polynomials, and increase the degree as we need more and more constants to solve for the two boundary condition. 

Constant (Non-Zero) Boundary Conditions
====
Imagine we hold both ends of our metal rod at a certain temperature, say \\(C_1\\) and \\(C_2\\). We know that as \\(t \rightarrow \infty\\) (in other words as time goes to infinity), that we will eventually get some sort of line between \\(C_1\\) and \\(C_2\\). If this is not intuitive, note that the end of the rods will not change their temperature, however, the interior part of the rod does, and therefore, will eventually tend to the average of the endpoints, depending on its proximity to each end. We know that the interior of the rod is not generating any heat (for now) so all of the heat will eventually tend towards the equilibrium brought about by the end points. Another analogy, would be to consider your oven pre-heated to 450\\(\degree\\), then after you turn your oven off, you know there is no longer any heat being applied, and the heat will eventually converge towards the temperature of your kitchen. This is because the "boundary condition" in this scenario, is the room temperature of your kitchen. Now, we typically begin by selecting lower degree polynomials, and increasing the degree as needed. For example, if our boundary conditions are \\(u(0, t) = 1\\) and \\(u(1, t) = 5\\) then we will assume
\\[S(x,t) = Ax + B\\]
Then we know we want this to equal the boundary conditions, so 
\\[S(0,t) = B = u(0,t) = 1 \implies B = 1\\]
So, we can write our stead-state solution as \\(S(x,t) = Ax + 1\\)
Now, to deal with the other boundary condition, \\(u(1, t) = 5\\)
\\[S(1, t) = A + 1 = u(1, t) = 5 \implies A = 4\\]
So, our steady state solution is now, \\(S(x,t) = 4x + 1\\). As mentioned above, \\(u(x,t) = S(x,t) + U(x,t)\\), so let's make that substitution into the PDE. But first we will compute the partial derivatives of \\(u\\) in terms of its new form. So 
\\[u_t = S_t(x,t) + U_t(x,t)\\]
And
\\[u_{xx} = S_{xx}(x,t) + U_{xx}(x,t)\\]
Substituting those into
\\[u_t = \alpha^2u_{xx}\\] 
We get
\\[S_t(x,t) + U_t(x,t) = \alpha^2(S_{xx}(x,t) + U_{xx}(x,t))\\]
But \\(S(x,t) = 4x + 1 \implies S_t(x,t) = 0\\) and \\(S_{xx}(x,t) = 0\\). So our equation simplifies to, 
\\[U_t(x,t) = \alpha^2U_{xx}(x,t))\\]
This is simply the heat equation for the function \\(U(x,t)\\), but if we can find this function, we know that \\(u(x,t) = S(x,t) + U(x,t)\\) and we already know \\(S(x,t)\\). But we must convert our boundary conditions to solve this, we know these boundary conditions will become 0, because we designed \\(S(x,t)\\) that way, but I will still go through the computation. Our boundary conditions were, \\(u(0, t) = 1\\) and \\(u(1, t) = 5\\), now substituting \\(S(x,t) + U(x,t)\\) in place for \\(u(x,t)\\). We get,
\\[u(0,t) = S(0, t) + U(0,t) = 1\\]
But we know \\(S(0,t) = 1\\), so we substract it from both sides to get \\[U(0,t) = 0\\] 
Now you see why we designed \\(S(x,t)\\) that way. Carrying out the same substitution for \\(x = 1\\) we get,
\\[u(1,t) = S(1,t) + U(1,t) = 5\\]
But \\(S(1,t) = 5\\), so subtracting it from both sides leaves us with, \\[U(1, t) = 0\\] 
We know have the heat equation in terms of \\(U(x,t)\\) and homogenous boundary conditions for \\(U(x,t)\\). We know (from the previous section) that the solution for the 1-D heat equation with homogenous Dirichlet boundary condition is
\\[U(x,t) = A_ne^{-(n\pi\alpha)^2t}sin(n\pi x)\\]
\\[\text{Where:  } A_n = 2\int_0^1\phi(x)sin(n\pi x)\\]
Where \\(\phi(x)\\) is an arbitrary initial condition. We are not quite done, recall \\[u(x,t) = S(x,t) + U(x,t)\\]
Making those substitutions we get the solution to the non-homogenous boundary condition problem, 
\\[u(x,t) = 4x + 1 + A_ne^{-(n\pi\alpha)^2t}sin(n\pi x)\\]
\\[\text{Where:  } A_n = 2\int_0^1\phi(x)sin(n\pi x)\\]


Time Varying Boundary Conditions
==== 
A common template for finding the homogenizer of time varying boundary conditions is using the following function
\\[S(x,t) = A(t)\[1-\frac{x}{L}\] + B(t)\[\frac{x}{L}\]\\]
Where \\(L\\) is the length of the rod, in our case 1.
Let's consider the boundary conditions below,
\\[u(t, 0) = 3t, u(t, 1) = \frac{1}{t}\\]
Then as mentioned, we want this function to equal our boundary conditions. So
\\[S(0, t) = A(t) = u(0, t) = 3t \implies A(t) = 3t\\]
\\[\text{Then substitute our found function of } A(t) \text{ into our steady-state solution to get } S(x,t) = 3t\[1-x\] + B(t)\[x\]\\]
And for the other boundary condition
\\[S(1, t) = B(t) = u(1, t) = 1 \implies B(t) = 1\\]
So, our steady state solution is complete,
\\[S(x,t) = 3t[1-x] + x\\]
As mentioned above, \\(u(x,t) = S(x,t) + U(x,t)\\), so let's make that substitution into the PDE. But first we will compute the partial derivatives of \\(u\\) in terms of its new form. So 
\\[u_t = S_t(x,t) + U_t(x,t)\\]
And
\\[u_{xx} = S_{xx}(x,t) + U_{xx}(x,t)\\]
Substituting those into
\\[u_t = \alpha^2u_{xx}\\] 
We get
\\[S_t(x,t) + U_t(x,t) = \alpha^2(S_{xx}(x,t) + U_{xx}(x,t))\\]
Now, \\(S_t(x,t) = 3-3x\\) and \\(S_{xx} = 0\\), plugging that in above we get,
\\[3-3x + U_t(x,t) = \alpha^2U_{xx}(x,t)\\] 
We can rewrite it in a way, more akin to the heat equation we first saw, so
\\[U_t(x,t) = \alpha^2U_{xx}(x,t) + 3x - 3\\]
This is a **non-homogenous** version of the heat equation, and will cover how to solve it in the next section. However, we know we have homogenous boundary conditions, \\[U(0, t) = 0 \text{ and } U(1,t) = 0\\]

