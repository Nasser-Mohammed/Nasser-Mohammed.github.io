---
layout: archive
title: "The Heat Equation on an Infinite and Semi-Infinite Rod"
permalink: /notes/pde/laplace-fourier-heat/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\[u_t=\alpha^2u_{xx}\\]

Our PDE here looks the same, however, we are going to consider when our rod is semi-infinite and infinite in length. That means we will have
1 and 0 boundary conditions respectively. Until now, our techniques have only worked on homogenous boundary conditions. We now introduce a method
that does not rely on homogenous boundary conditions. This is due to the fact that these transforms essentially transform our derivatives into 
multiplication. In other words, we can sometimes turn differential equations into algebraic ones. Even when this does not happen, we essentially
get an ODE in the variable that we did not transform, and this ODE is one degree lower than our PDE. This makes solving problems much easier, once
we solve the transformed problem, we can just invert the transformation to get our solution to the original problem. Now that we know the motivation
behind these transforms, we can start to consider some very common and useful ones.

The Fourier Transform
====
We have already considered the sin and cos transforms of some functions, by means of a series (called the Fourier sin/cos series). However, to 
generalize the functions we can apply this sort of apply this type of transform to, we consider the *Fourier Integral Representation*, sometimes
called the continuous frequency resolution. This extension, now allows us to transform non-periodic functions on \\(\mathbb{R}\\) as well. The Fourier Transform is defined as:
\\[\\mathcal{F}\[f\] = F(\xi) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}f(x)e^{-i\xi x}dx\\]
With the Inverse Fourier Transform is defined as:
\\[\\mathcal{F}^{-1}\[F\] = f(x) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}F(\xi)e^{i\eta x}d\xi\\]
Now a lot of the times, we don't have to actually compute this integral. If the function we are transforming is in a form with a well known transformation, we can usually just write its transform (usually given by a table of transforms in the back of textbooks). For example, the Fourier Transform for \\(e^{-a^2x^2}\\) is given by  \\[\mathcal{F}\[e^{-a^2x^2}\] = \frac{1}{a\sqrt{2}}e^{\frac{-\omega^2}{4a^2}}\\]
We typically use the Fourier Transform to transform the spatial derivative \\(x\\), in doing this, we will get an ODE in \\(t\\). 
Before we can transform the PDE, we need to note the transforms of some partial derivatives:
\\[\mathcal{F}\[u_x\] = i\xi\mathcal{F}\[u\]\\]
\\[\mathcal{F}\[u_{xx}\] = -\xi^2\mathcal{F}\[u\]\\]
\\[\mathcal{F}\[u_t\] = \frac{\partial}{\partial t}\mathcal{F}\[u\]\\]
\\[\mathcal{F}\[u_{tt}\] = \frac{\partial^2}{\partial t^2}\mathcal{F}\[u\]\\]
Finally, there are two quick things to note before we can solve the heat equation this way. The first is something called a **convolution**. The formula for a convolution of two functions \\(f\\) and \\(g\\) is defined as 
\\[(f \ast g)(x) = \frac{1}{\sqrt{2\pi}\int_{-\infty}^{\infty}f(x - \xi)g(\xi)d \xi \\]
A convolution (without going into much theory) allows us to take the Fourier Inverse of a product of two transformed functions. In other words,
\\[\mathcal{F}\[f(x)g(x)\] \neq \mathcal{F}\[f\]\mathcal{F}\[g\]\\]
Instead we have to use the convolution, denoted \\(f\ast g\\). Where 
\\[f\ast g = \mathcal{F}^{-1}\[\mathcal{F}\[f\]\mathcal{F}\[g\]\]\\]
In English, this says that to find the inverse transform of a product of functions, all we have to do is find the inverse of each function and then compute the convolution between them after to get the final inverted function. The last remark, is that even though we transform \\(x\\), you might see \\(\xi\\) in the transformed functions and might think that this is a multivariable function and therefore cannot be solved as an ODE, however, we treat \\(\xi\\) (or \\(\omega\\) whichever one is being used) as a parameter, so the transformed function \\(U(\xi, t)\\) is really just a function of \\(U(t)\\) and therefore subject to treatment as an ODE. Now to solve the heat equation on an **infinite** rod. This means we have no boundary conditions (since the rod is infinite). Using the transformed partial derivative above, we can rewrite the heat equation 
\\[u_t=\alpha^2u_{xx} \text{ with initial condition } u(x,0) = \phi(x)\\]
to 
\\[\frac{\partial}{\partial t}U(t) = \alpha^2-\xi^2U(t)\\]
Since \\(\mathcal{F}\[u\]\\) is simply just the transformed function of \\(u\\) which we call \\(U\\).
With a transformed initial condition of \\[U(0) = \mathcal{F}\[\phi (x)\]\\]
Now the partial derivative of \\(U\\) with respect to \\(t\\) is simply the derivative of \\(U\\) with respect to \\(t\\) (i.e. not partial) since \\(U\\) is only a functin of \\(t\\). So we can rewrite this equation as
\\[U' = -\alpha^2\xi^2U\\]
It's readily apparent that the solution to this equation is \\(Ae^{-(\alpha \xi)^2t}\\). Now we must account for the initial condition,
\\(U(0) = \Phi (\xi)\\), where \\(\Phi(\xi)\\) is simply the Fourier Transform of our initial condition \\(\phi(x)\\) and \\(\xi\\) is just a constant. Now, plugging 0 into \\(U\\) yields:
\\[U(0) = \Phi (\xi) = Ae^{-(\alpha \xi)^2\times 0} = Ae^0 = A \implies A = \Phi(\xi)\\]
So, our solution to this ODE is:
\\[U(t) = \Phi(\xi)e^{-(\alpha \xi)^2t}\\]
Now we must take the inverse of this to find our solution. 
\\[\mathcal{F}^{-1}\[\Phi(\xi)e^{-(\alpha \xi)^2t}\]\\]
Now using our convolution property, if we can find the inverse of each factor, we can just compute the convolution of their inverses to solve this. In other words,
\\[\mathcal{F}^{-1}\[\Phi(\xi)e^{-(\alpha \xi)^2t}\] = \mathcal{F}^{-1}\[\Phi (\xi)\] \ast \mathcal{F}^{-1}\[e^{-(\alpha \xi)^2t}\]\\]
We know that \\(\mathcal{F}^{-1}\[\Phi (\xi)\]\\) is simply \\(\phi (x)\\) (whatever that function may be) and through our known inverse transforms. \\[\mathcal{F}^{-1}\[e^{-(\alpha \xi)^2t}\] = \frac{1}{\alpha \sqrt{2t}}e^{-(\frac{x^2}{2\alpha^2t})}\\]
Now we compute the convolution 
\\[\phi (x) \ast \frac{1}{\alpha \sqrt{2t}}e^{-(\frac{x^2}{2\alpha^2t})}\\]
Which is equal to 
\\[\frac{1}{2\alpha \sqrt{\pi t}}\int_{-\infty}^{\infty}\phi(\xi)e^{-(frac{x-\xi)^2}{4\alpha^2t})}d\xi\\]
And that is our final solution to the heat equation on the infinite rod.
