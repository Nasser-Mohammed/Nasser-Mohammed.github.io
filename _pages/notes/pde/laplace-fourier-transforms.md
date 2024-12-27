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
\\[\\mathcal{F}^{-1}\[F\] = f(x) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}F(\xi)e^{i\xi x}d\xi\\]
Now a lot of the times, we don't have to actually compute this integral. If the function we are transforming is in a form with a well known transformation, we can usually just write its transform (usually given by a table of transforms in the back of textbooks). For example, the Fourier Transform for \\(e^{-a^2x^2}\\) is given by  \\[\mathcal{F}\[e^{-a^2x^2}\] = \frac{1}{a\sqrt{2}}e^{\frac{-\omega^2}{4a^2}}\\]
We typically use the Fourier Transform to transform the spatial derivative \\(x\\), in doing this, we will get an ODE in \\(t\\). 
Before we can transform the PDE, we need to note the transforms of some partial derivatives:
\\[\mathcal{F}\[u_x\] = i\xi\mathcal{F}\[u\]\\]
\\[\mathcal{F}\[u_{xx}\] = -\xi^2\mathcal{F}\[u\]\\]
\\[\mathcal{F}\[u_t\] = \frac{\partial}{\partial t}\mathcal{F}\[u\]\\]
\\[\mathcal{F}\[u_{tt}\] = \frac{\partial^2}{\partial t^2}\mathcal{F}\[u\]\\]
Finally, there are two quick things to note before we can solve the heat equation this way. The first is something called a **convolution**. The formula for a convolution of two functions \\(f\\) and \\(g\\) is defined as 
\\[(f \ast g)(x) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}f(x - \xi)g(\xi)d \xi \\]
A convolution (without going into much theory) allows us to take the Fourier Inverse of a product of two transformed functions. In other words,
\\[\mathcal{F}\[f(x)g(x)\] \neq \mathcal{F}\[f\]\mathcal{F}\[g\]\\]
Instead we have to use the convolution, denoted \\(f\ast g\\). Where 
\\[f\ast g = \mathcal{F}^{-1}\[\mathcal{F}\[f\]\mathcal{F}\[g\]\]\\]
In English, this says that to find the inverse transform of a product of functions, all we have to do is find the inverse of each function and then compute the convolution between them after to get the final inverted function. The last remark, is that even though we transform \\(x\\), you might see \\(\xi\\) in the transformed functions and might think that this is a multivariable function and therefore cannot be solved as an ODE, however, we treat \\(\xi\\) (or \\(\omega\\) whichever one is being used) as a parameter, so the transformed function \\(U(\xi, t)\\) is really just a function of \\(U(t)\\) and therefore subject to treatment as an ODE. Now to solve the heat equation on an **infinite** rod. This means we have no boundary conditions (since the rod is infinite). Using the transformed partial derivative above, we can rewrite the heat equation \\
\\(u_t=\alpha^2u_{xx}\\) with initial condition \\(u(x,0) = \phi(x)\\) \\
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
We know that \\(\mathcal{F}^{-1}\[\Phi (\xi)\]\\) is simply \\(\phi (x)\\) (whatever that function may be) and through our known inverse transforms. \\[\mathcal{F}^{-1}\[e^{-(\alpha \xi)^2t}\] = \frac{1}{\alpha \sqrt{2t}}e^{-(\frac{x^2}{4\alpha^2t})}\\]
Now we compute the convolution 
\\[\phi (x) \ast \frac{1}{\alpha \sqrt{2t}}e^{-(\frac{x^2}{4\alpha^2t})}\\]
Which is equal to 
\\[\frac{1}{2\alpha \sqrt{\pi t}}\int_{-\infty}^{\infty}\phi(\xi)e^{-(\frac{(x-\xi)^2}{4\alpha^2t})}d\xi\\]
And that is our final solution to the heat equation on the infinite rod. \\
**Note:** As mentioned, \\(\xi\\) is a constant when we are solving our ODE, however, it is the variable of integration during the inverse Fourier transform, while \\(t\\) is treated as a constant. 

The Laplace Transform
====
The main difference between the Laplace Transform and the Fourier Transform, are the boundaries of integration, and the kernel. The kernel is essentially the function that we are multiplying (i.e. transforming) to our function before integration. A kernel that decays sufficiently fast, will allow for more general functions to have a meaningful integral when multiplied to that kernel. Since these integrals are infinite (in the case of the Laplace Transform, it is more so considered semi-infinite but infinite nonetheless), we have to worry about convergence. That is, the subject of our integration, needs to decay so that our integral can converge to some function/value. The Laplace Transform is defined below,
\\[\mathcal{L}\[f\] = F(s) = \int_{0}^{\infty}f(t)e^{-st}dt\\]
With the Inverse Laplace Transform defined as
\\[\mathcal{L}^{-1}\[F\] = f(t) = \frac{1}{2\pi i}\int_{c-i\infty}^{c+i\infty}F(s)e^{st}ds\\]
Let's note some things here. First, the reason we call is semi-finite, is that the transformation takes place across the half real line (i.e. \\(\mathbb{R}^{+} \cup {0}\\) the positive real numbers and 0). This means that the variable that we want to transform, must have be defined only on the set \\((0, \infty)\\). So, naturally we could transform the time variable \\(t\\), since \\(t \in (0,\infty)\\). Or, we can transform the spatial variable \\(x\\), if we are considering the semi-infinite rod. In other words, we have a rod that goes off in only one direction, so \\(x \in (0, \infty )\\) The other thing to note is the kernel, \\(e^{-st}\\) compared to the Fourier Transform kernel of \\(e^{-i\xi x\\). If we recall, \\(e^{-i\xi x} = \cos(\xi x) - i\sin(\xi x)\\) so the kernel in the Fourier Transform doesn't involve decay necessarily, but is rather oscillitory. Then, the function that we are trying to transform by multiplying by \\(e^{-i\xi x}\\) must then ensure the decay. However, the Laplace Transform has a \\(e^{-st}\\) factor. Since \\(t \ge 0\\) and \\(s = \sigma + i\omega\\), then substituting that in we get,
\\[e^{-(\sigma + i\omega)t} = e^{-\sigma t}e^{-i\omega t}\\]
Now \\(e^{-i\omega t}\\) is simply the same kernel from the Fourier Transform, which we know doesn't necessarily cause decay. However, we also have a \\(e^{-\sigma t}\\) factor. Since \\( t \ge 0\\) then the numerator of \\(e^{-\sigma t}\\) can either grow exponentially or decay exponentially depending on \\(\sigma\\), that way we can handle both oscillitory and decaying signals. Those are the main differences between the two important transforms. Now to solve the heat equation on the semi-infinite rod. We must note the transforms of the partial derivatives and the convolution property first. The important partial deriviative transforms are below, defined for transforming the \\(t\\) variable (although since the rod is semi-finite, we could have also transformed the \\(x\\) variable).
\\[\mathcal{L}\[u_t\] = sU(x,s) - u(x,0)\\]
\\[\mathcal{L}\[u_{tt}\] = s^2U(x,s) - su(x,0) - u_t(x, 0)\\]
\\[\mathcal{L}\[u_x\] = \frac{\partial U}{\partial x}(x,s)\\]
\\[\mathcal{L}\[u_{xx}\] = \frac{\partial^2 U}{\partial x^2}(x,s)\\]
Where we know that \\(\mathcal{L}\[u(x,t)\] = U(x,s)\\). Note that here \\(s\\) is the "constant" and is only treated as a variable when we take the inverse Laplace Transform (and x is treated as a constant during that inversion). So our PDE
\\[u_t = \alpha^2u_{xx}\\] 
After taking the Laplace Transform, becomes
\\[sU(x,s) - u(x, 0) = \alpha^2\frac{\partial^2 U}{\partial x^2}(x,s)\\]
