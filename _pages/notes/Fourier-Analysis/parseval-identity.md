---
layout: archive
title: "Parseval's Identity and Fourier Reciprocity Formula"
permalink: /notes/fourier-analysis/Parseval's-Identity/
author_profile: false
--- 
<hr style="border: 2px solid black;">
First we will consider the Fourier Reciprocity Formula, and how it leads us to Parseval's Identity. We begin by considering a function
\\[f(\theta) = \sum_{n=-\infty}^{\infty}C_ne^{in\theta}\\]
Where \\(C_n\\) is the \\(n^{\text{th}}\\) Fourier coefficient, defined by
\\[C_n = \frac{1}{2\pi}\int_{-\pi}^{\pi}f(\theta)e^{-in\theta}d\theta\\]
Where 
\\[\sum_{n =-\infty}^{\infty}\left|C_n\right| < \infty\\]
We should note a few things about this function, first we recall the Weierstrass M test, which in summary says:\\
\\
If we have a sequence of functions, such that for a sequence of non-negative numbers \\(\{M_n\}\\) 
\\[\left|f_n(x)\right| \leq M_n \ \ \ \forall n \geq 0\\]
and
\\[\sum_{n=0}^{\infty}M_n  \ \ \text{converges}\\]
Then we have that,
\\[\sum_{n=0}^{\infty}f_n(x) \ \ \text{converges}\\]
This is absolutely and uniformly convergent, which then implies that the function described by this series, is continuous on the defined set. Since this converges for every point, we know that this function is bounded. More concretely, this means we are not considering functions with singularities at the endpoints of the interval, and furthermore, our functions are then bounded and continuous. We have continuity, since by the M-test we can consider the series form of our function
\\[f(\theta) = \sum_{n=-\infty}^{\infty}C_ne^{in\theta}\\]
Then
\\[\left|C_ne^{in\theta}\right| = \left|C_n\right| \ \ \text{by the complex modulus }( \left|e^{ix}\right| = 1)\\]
So we have that 
\\[\left|C_ne^{in\theta}\right| \leq \left|C_n\right| \ \ \forall n \text{ and } \forall \theta\\]
We assumed that,
\\[\sum_{n=-\infty}^{\infty}\left|C_n\right| <\infty \ \ \ \text{(i.e. convergent)}\\]
So we then have that the series
\\[\sum_{n=-\infty}^{\infty}C_ne^{in\theta} \ \ \ \text{ converges uniformly and absolutely on the circle } (-\pi, \pi]\\]
Therefore, \\(f(x)\\) is continuous and finite on the circle (finite in the sense that it only takes on real values on the interval, so it's not an extended value function that can output \\(\infty\\) as a value). Therefore, we can conclude that this function is also in \\(L^1({\mathbb{T}})\\), where \\(\mathbb{T} = (-\pi, \pi]\\). We are now in a position to consider another function in \\(L^1(\mathbb{T})\\) (note that although \\(L^p\\) is a space of equivalence classes with the relation of almost everywhere equal, we are talking about functions in those equivalence classes when we say elements of \\(L^p\\)). Recall, a function 
\\[h(\theta) \in L^1(A) \implies \int_{A}\left|h(\theta)\right|d\theta <\infty\\]
Now let,
\\[g \in L^1(\mathbb{T})\\]
and similar to above,
\\[D_n = \frac{1}{2\pi}\int_{-\pi}^{\pi}g(\theta)e^{-in\theta}d\theta\\]
Now, we consider 
\\[\int_{-\pi}^{\pi}f(\theta)g(\theta)d\theta\\]
We can carry out integration by parts
\\[u = f(\theta) \ \ \ \ \ du = f'(\theta)\\]
\\[dv = g(\theta) \ \ \ \ \ v = \int g(\theta)d\theta\\]
