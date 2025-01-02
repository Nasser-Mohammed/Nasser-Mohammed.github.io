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
\\
**Case 1:** \\(\Theta (\theta) = A\theta + B\\) \\
\\
Let's test \\(2\pi\\)-periodicity. So we need, \\(\Theta (\theta) = \Theta (2\pi + \theta)\\). Plugging this in we get,
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
**Case 2:** \\(\Theta (\theta) = A\cos(\sqrt{k} \theta) + B\sin(\sqrt{k} \theta)\\). Now let's check if this can be \\(2\pi\\)-periodic, i.e. \\(\Theta (\theta) = \Theta (2\pi + \theta)\\). Note here, that since \\(k > 0\\), \\(\sqrt{-k}\\) produces an imaginary unit, so \\(\sqrt{-k} = \sqrt{k}i\\). So we will consider \\(\sqrt{k}\\) in our equation. Plugging this in yields,
\\[A\cos(\sqrt{k} \theta) + B\sin(\sqrt{k} \theta) = A\cos(\sqrt{k} (2\pi + \theta)) + B\sin(\sqrt{k} (2\pi + \theta))\\]
Now to simplify this we will need the following trig-identities:
\\[\cos(\sqrt{k}(2\pi + \theta)) = \cos (2\pi\sqrt{k}) \cos (\sqrt{k}\theta) - \sin (2\pi\sqrt{k}) \sin (\sqrt{k}\theta)\\]
\\[\sin(\sqrt{k}(2\pi + \theta)) = \sin (2\pi\sqrt{k}) \cos (\sqrt{k}\theta) + \cos (2\pi\sqrt{k}) \sin (\sqrt{k}\theta)\\]
Substituting this into our solution, this
\\[A\cos(\sqrt{k} \theta) + B\sin(\sqrt{k} \theta) = A\cos(\sqrt{k} (2\pi + \theta)) + B\sin(\sqrt{k} (2\pi + \theta))\\]
Changes into below,
\\[A\cos(\sqrt{k} \theta) + B\sin(\sqrt{k} \theta) = A\[\cos (2\pi\sqrt{k}) \cos (\sqrt{k}\theta) - \sin (2\pi\sqrt{k}) \sin (\sqrt{k}\theta)\] + B\[\sin (2\pi\sqrt{k}) \cos (\sqrt{k}\theta) + \cos (2\pi\sqrt{k}) \sin (\sqrt{k}\theta)\]\\]
As we did in our first case, we will essentially compare the constants in front of our functions to make a statement about equality. It is important to note which terms are constants here, \\(A, B, \cos(2\pi \sqrt{k}), \sin(2\pi \sqrt{k})\\). Any term with a \\(\theta\\) is **not** constant. Now rewriting the equation and distributing \\(A\\) and \\(B\\), the right hand side of the equation becomes
\\[A\cos (2\pi\sqrt{k}) \cos (\sqrt{k}\theta) - A\sin (2\pi\sqrt{k}) \sin (\sqrt{k}\theta) + B\sin (2\pi\sqrt{k}) \cos (\sqrt{k}\theta) + B\cos (2\pi\sqrt{k}) \sin (\sqrt{k}\theta)\\]
Now, we want to push all of the constants in front of our \\(\cos(\sqrt{k}\theta), \sin(\sqrt{k}\theta)\\) terms so that we can compare them directly to the left hand side of the equation. First grouping \\(\cos(\sqrt{k}\theta), \sin(\sqrt{k}\theta)\\) yields:
\\[\[A\cos (2\pi\sqrt{k}) \cos (\sqrt{k}\theta) + B\sin (2\pi\sqrt{k}) \cos (\sqrt{k}\theta)\] + \[- A\sin (2\pi\sqrt{k}) \sin (\sqrt{k}\theta) + B\cos (2\pi\sqrt{k}) \sin (\sqrt{k}\theta)\]\\]
Now we pull out the non constant term in each "group" to get:
\\[\cos(\sqrt{k}\theta)\[A\cos (2\pi\sqrt{k}) + B\sin (2\pi\sqrt{k})\] + \sin(\sqrt{k}\theta)\[- A\sin (2\pi\sqrt{k}) + B\cos (2\pi\sqrt{k})\]\\]
Now we are in a position to compare both sides of the equation, recall the full equation is 
\\[\cos(\sqrt{k} \theta)A + \sin(\sqrt{k} \theta)B = \cos(\sqrt{k}\theta)\[A\cos (2\pi\sqrt{k}) + B\sin (2\pi\sqrt{k}\] + \sin(\sqrt{k}\theta)\[- A\sin (2\pi\sqrt{k}) + B\cos (2\pi\sqrt{k})\]\\]
Now observe that on the left hand side of the equation, the \\(A\\) and \\(B\\) terms are constants being multiplied to \\(\cos(\sqrt{k} \theta)\\) and \\(\sin(\sqrt{k} \theta)\\) and must **match** the constants being multiplied to \\(\cos(\sqrt{k} \theta)\\) and \\(\sin(\sqrt{k} \theta)\\). Again, this is because they are **constant** and cannot change. So we can essentially set the coefficients of each of those terms equal to the corresponding coefficient on the right hand side, in doing this we get two equations:
\\[A = A\cos(2\pi\sqrt{k}) + B\sin(2\pi\sqrt{k})\\]
and 
\\[B = -A\sin(2\pi\sqrt{k}) + B\cos(2\pi\sqrt{k})\\]
Now we note an important fact, \\(\cos(x) = 0 \implies \sin(x) = \pm 1\\) and the reverse is true, \\(\sin(x) = 0 \implies \cos(x) = \pm 1\\). Now let's use this to analyze the equation. For the first equation, I want the \\(B\sin(2\pi\sqrt{k})\\) term to be 0, and I want the \\(\cos(2\pi\sqrt{k}\\) term to be 1, so that we are left with \\(A = A\\). Now, if we ignore the option of \\(B = 0\\), we note that \\(\sin(2\pi\sqrt{k}) = 0 \implies \cos(2\pi \sqrt{k}) = \pm 1\\), so this is almost what we want, now we simply want to limit the values of \\(\cos(2\pi \sqrt{k})\\) that give a \\(-1\\) to only give \\(1\\). We know that \\(\sin(x) = 0\\) at integer multiples of \\(\pi\\), however, \\(cos(n\pi) = \pm 1\\) depending on \\(n\\). However, we do know that \\(\cos(x) = 1\\) at *even* integer multiples of \\(\pi\\) and \\(sin(x) = 0\\) at *even* integers of \\(\pi\\) as well, so if we make make \\(2\pi\sqrt{k}\\) an even integer multiple of \\(\pi\\) we will have \\(2\pi\\)-periodicity. In other words
\\[2\pi\sqrt{k} = 2\pi n \: n \in 0, 1, 2, ...... \\]
Solving for this tells us that 
\\[k = n^2\\]
This also solves the other equation for \\(B\:\\) \\(B = -A\sin(2\pi n) + B\cos(2\pi n)\\) 
Now we have a sequence of possible solutions, plugging the new value of \\(k\\) into our general solution for \\(\Theta\\) gives
\\[\Theta_n(\theta) = a_n\cos(n\theta) + b_n\sin(n\theta)\\]
What about the periodic solution when \\(k = 0\\)? If we recall, that was \\(\Theta (\theta) = C\\), luckily this solution is "baked" into our solution above. If we plug \\(n = 0\\) into our general solution, we get 
\\[\Theta_0 (\theta) = a_0\\]
Since \\(\cos(0) = 1\\) and \\(\sin(0) = 0\\), so we have a constant, and that takes care of the case where \\(k = 0\\). \\
\\
Now we will tackle the other ODE
\\[r^2R^{\''}(r) +rR^{\'}(r) - k R(r) = 0 \\]
This is called a Cauchy-Euler Differential Equation. These differential equations are of the form
\\[\alpha x^2y^{\''} + \beta xy^{\'} + \omega y = 0\\]
Where \\(\alpha, \beta, \omega\\) are all constants. In other words, it's a differential equation, with constants multiplied to the **independent** variable being raised to the same power as the order of the derivative of \\(y\\) that it's being multiplied to. To solve our example (with variables \\(r\\) and function \\(R\\)), we assume \\(R = r^{\gamma}\\) where \\(\gamma\\) is a constant that we will find. So, computing the necessary derivatives yields:
\\[R^{\''} = \gamma(\gamma - 1) r^{\gamma - 2}\\]
\\[R^{\'} = \gamma r^{\gamma - 1}\\]
Plugging these into our DE, we get
\\[r^2(\gamma(\gamma - 1) r^{\gamma - 2}) +r(\gamma r^{\gamma - 1}) - k r^{\gamma} = 0\\]
This simplifies to 
\\[(\gamma^2 - \gamma) r^{\gamma} + \gamma r^{\gamma} - kr^{\gamma} = 0 \\]
We can pull out and divide out a \\(r^{\gamma}\\) to get
\\[\gamma^2 - \gamma + \gamma - k = 0\\]
\\[\gamma^2 - k = 0\\]
This is the associated **characteristic equation**, solving this will tell us the possible form of the solution. The solution to this equation is
\\[\gamma = \sqrt{k}\\]
Now like the other 2nd order ODE, we have 3 possible solutions depending on the nature of \\(k\\). However, we know \\(\sqrt{k} = n \: k \ge 0\\). So we can simply consider the two solutions that are possible. Those are:
\\[k = 0\: R(r) = a + b\ln(r)\\]
\\[k > 0\: R(r) = ar^{n} + br^{-n}\\]
If you recall, there were two physical restrictions on our solutions. The first being the \\(2\pi\\)-periodic restriction on \\(\Theta(\theta)\\), the other, was that we want our solution to be bounded (i.e. not blow up). If we look at the first possible solution for \\(R\\), as \\(r \rightarrow 0^{+} \: \ln(r) \rightarrow -\infty\\), so this cannot work unless \\(b = 0\\), so in other words, \\(R(r) = C\\), a constant. For the second possibility
\\[R(r) = ar^{n} + br^{-n}\\]
Since \\(n \ge 0 \implies -n < 0\\) then \\(br^{-n}\\) is the same as \\(\frac{b}{r^n}\\). As \\(r \rightarrow 0^{+} \: \frac{b}{r^n} \rightarrow \infty\\), and actually the fact that \\(r\\) is being raised to the \\(n\\) power makes this divergence even faster. So we must throw away that term by letting \\(b = 0\\). So now we have our solutions for \\(R(r)\\). Much like the solution for \\(\Theta(\theta)\\), the solution \\(R_n(r) = a_nr^{n}\\) has the solution \\(R(r) = C\\) (where C is a constant) baked in. That is at \\(n = 0, R_0 = a_0(1) = a_0\\) where \\(a_0\\) is simply a constant. So we can just say that \\(R_n(r) = a_nr^n\\). Finally, we have a sequence of solutions:
\\[u_n(r,\theta) = R_n(r)\Theta_n(\theta) = r^n\[a_n\cos(n\theta)+b_n\sin(n\theta)\]\\]
By our known **Law of Superposition**, the solutions to a linear homogenous PDE, forms a vector space. The reason we represent it as a sum, is because any solution that does exist, is baked into this sum. That is, every solution is found in this sum, we just have to configure the coefficients appropriately. So we say that the general solution is:
\\[u(r,\theta) = a_0 + \sum_{n = 1}^{\infty}x^n\[a_n\cos(n\theta) + b_n\sin(n\theta)\]\\]
Where I simply wrote the initial coefficient out before the summation, and started the summation index at 1 insead of 0. Now, the final step is to configure this sum to match our boundary condition.
\\[u(1, \theta) = g(\theta) = a_0 + \sum_{n = 1}^{\infty}\[a_n\cos(n\theta) + b_n\sin(n\theta)\]\\]
Here, we use orthogonality and **cross** orthogonality. Below are the important satements about this,

<div style="text-align: center;">
$$
\begin{align}
\int_0^{2\pi}{\sin(n \theta) \sin(m \theta) \ d\theta} = 
\begin{cases}
\\ \pi &: \text{if } n = m \\
0 &: \text{if } n \neq m
\end{cases} 
\end{align}
$$
</div>

<div style="text-align: center;">
$$
\begin{align}
\int_0^{2\pi}{\cos(n \theta) \cos(m \theta) \ d\theta} = 
\begin{cases}
\\ \pi &: \text{if } n = m \\
0 &: \text{if } n \neq m
\end{cases} 
\end{align}
$$
</div>

\\[\int_0^{2\pi}{\sin(n \theta) \cos(m \theta) \ d\theta} = 0 \forall n,m \in \mathbb{Z}^{+}\\]

With this in hand, we can to find the necessary coefficients that make our infinite sum agree with the boundary condition. As mentioned above:
\\[u(1, \theta) = g(\theta) =\sum_{n = 0}^{\infty}\[a_n\cos(n\theta) + b_n\sin(n\theta)\]\\]
So we will work on this equation
\\[g(\theta) = \sum_{n = 0}^{\infty}\[a_n\cos(n\theta) + b_n\sin(n\theta)\]\\]
Now we are going to multiply both sides by \\(\sin(m\theta)\\) and integrate from \\(0\\) to \\(2\pi\\). 
\\[\int_0^{2\pi}\sin(m \theta)g(\theta)d\theta = \int_0^{2\pi}\sum_{n = 0}^{\infty}\[a_n\sin(m\theta)\cos(n\theta) + b_n\sin(m\theta)\sin(n\theta)\]d\theta\\]
By the linearity of the integral, we can rewrite the right hand side as
\\[\sum_{n = 0}^{\infty}\int_0^{2\pi}\[a_n\sin(m\theta)\cos(n\theta) + b_n\sin(m\theta)\sin(n\theta)\]d\theta\\]
Now we know that when \\(m \neq n\\) we get 0's, so this will simplify to 
\\[\int_0^{2\pi}\[a_n\sin(m\theta)\cos(n\theta) + b_n\sin(m\theta)\sin(n\theta)\]d\theta\\]
This is equal to 
\\[\int_0^{2\pi} a_n\sin(n\theta)\cos(n\theta)d\theta + \int_0^{2\pi}b_n\sin(n\theta)\sin(n\theta)d\theta\\]
By the orthogonality above, this reduces to
\\[b_n\pi\\]
Which is equal to the original left hand side of the equation
\\[\int_0^{2\pi}\sin(m \theta)g(\theta)d\theta = b_n\pi\\]
Then our equation for \\(b_n\\) becomes
\\[b_n = \frac{1}{\pi}\int_0^{2\pi}\sin(m \theta)g(\theta)d\theta\\]
Now to solve for \\(a_n\\) we will restart this process with the equation
\\[g(\theta) = \sum_{n = 0}^{\infty}\[a_n\cos(n\theta) + b_n\sin(n\theta)\]\\]
We multiply both sides of the equation by \\(\cos(m\theta)\\) and integrate from \\(0\\) to \\(2\pi\\) to get
\\[\int_0^{2\pi}\cos(m \theta)g(\theta)d\theta = \int_0^{2\pi}\sum_{n = 0}^{\infty}\[a_n\cos(m\theta)\cos(n\theta) + b_n\cos(m\theta)\sin(n\theta)\]d\theta\\]
Like usual, we get 0's everywhere except when \\(m = n\\), so it simplifies to
\\[\int_0^{2\pi}\cos(n \theta)g(\theta)d\theta = \int_0^{2\pi}\[a_n\cos(mntheta)\cos(n\theta) + b_n\cos(n\theta)\sin(n\theta)\]d\theta\\]
Which is equivalent to 
\\[\int_0^{2\pi}\cos(n \theta)g(\theta)d\theta = \int_0^{2\pi}a_n\cos(n\theta)\cos(n\theta) + \int_0^{2\pi}b_n\cos(n\theta)\sin(n\theta)\]d\theta\\]
Then using orthogonality, we get
\\[\int_0^{2\pi}\cos(m \theta)g(\theta)d\theta = a_n\pi\\]
Finally, our expression for \\(a_n\\) is 
\\[a_n = \frac{1}{\pi}\int_0^{2\pi}\cos(m \theta)g(\theta)d\theta\\]
That's the entire solution, we have solved the Interior Dirichlet Problem on a circle. There is one last thing to consider, since we essentially write \\(g(\theta)\\) as its Fourier Series, we need it to match the fact that the Fourier Series has an initial term of \\(\frac{a_0}{2}\\), so we will write our initial term as such. To recap, the solution is given by

\\[u(r,\theta) = \frac{a_0}{2} + \sum_{n = 1}^{\infty}x^n\[a_n\cos(n\theta) + b_n\sin(n\theta)\]\\]
\\[\text{where }a_n = \frac{1}{\pi}\int_0^{2\pi}\cos(m \theta)g(\theta)d\theta\\]
\\[\text{and where } b_n = \frac{1}{\pi}\int_0^{2\pi}\sin(m \theta)g(\theta)d\theta\\]

