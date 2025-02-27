---
layout: archive
title: "Trigonometric Fourier Representation of Odd and Even Functions"
permalink: /notes/fourier-analysis/odd-even-fourier-rep/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\
We begin by recalling the definition of an even and odd function.\\
\\
An even function has the property that
\\[f(-x) = f(x)\\]
In other words, this function is symmetric across the y-axis.\\
\\
An odd function has the property that
\\[f(-x) = -f(x)\\]
In other words, this function is **rotationally symmetric** about the origin. That is, in \\(\mathbb{R}^2\\), the function can be rotated \\(180^{\circ}\\) and remain unchanged. \\
\\
Now we will consider the trigonometric Fourier Series of a function on the circle \\((-\pi, \pi]\\).
\\[f(\theta) = a_0 + \sum_{n = 1}^{\infty}\left(a_n\cos\left(n\theta\right) +b_n\sin\left(n\theta\right)\right)\\]
\\[a_0  = \frac{1}{2\pi}\int_{-\pi}^{\pi}f(\theta)d\theta \ \ \ \ \ \ \ \ \ \ \\]
\\[a_n = \frac{1}{\pi}\int_{-\pi}^{\pi}f(\theta)\cos(n\theta)d\theta\\]
\\[b_n = \frac{1}{\pi}\int_{-\pi}^{\pi}f(\theta)\sin(n\theta)d\theta\\]
I will show that a function that is even will be comprised of only cosine waves, as cosine is an even function. Similarly, I will show that an odd function will be comprised of only sine waves, as sine is an odd function.\\
\\
Let \\(f(\theta)\\) be an even function, defined on \\((-\pi, \pi]\\). Then we know that \\(f(-\theta) = f(\theta)\\). Now let's consider its Fourier Series representation.
\\[f(\theta) = a_0 + \sum_{n = 1}^{\infty}a_n\cos(n\theta) + b_n\sin(n\theta)\\]
Then by property of \\(f\\) being even, we know that \\(f(\theta) = f(-\theta)\\), so let's analyze the Fourier coefficients.
\\[a_n = \frac{1}{\pi}\int_{-\pi}^{\pi}f(\theta)\cos(n\theta)d\theta = \frac{1}{\pi}\int_{-\pi}^{\pi}f(-\theta)\cos(-n\theta)d\theta = \frac{2}{\pi}\int_{0}^{\pi}f(\theta)\cos(n\theta)d\theta\\]
Above follows directly from substituting in \\(f(\theta) = f(-\theta)\\) and \\(\cos(n\theta) = \cos(-n\theta)\\), since both are even functions.\\
\\
\\[b_n = \frac{1}{\pi}\int_{-\pi}^{\pi}f(\theta)\sin(n\theta)d\theta = \frac{1}{\pi}\left(\int_{0}^{\pi}f(\theta)\sin(n\theta)d\theta + \int_{-\pi}^{0}f(\theta)\sin(n\theta)d\theta\right)\\]
Note that
\\[\int_{-\pi}^{0}f(\theta)\sin(n\theta)d\theta = \int_{0}^{\pi}f(-\theta)\sin(-n\theta)d\theta = -\int_{0}^{\pi}f(\theta)\sin(n\theta)d\theta\\]
By the property that \\(f\\) is even, and \\(\sin\\) is odd. Substituting this in, we get
\\[\frac{1}{\pi}\left(\int_{0}^{\pi}f(\theta)\sin(n\theta)d\theta -\int_{0}^{\pi}f(\theta)\sin(n\theta)d\theta\right) = \frac{1}{\pi}\cdot 0 = 0\\]
Therefore, we see that 
\\[\forall n \in \mathbb{N} \text{ and } \forall \theta \in (-\pi, \pi] \ \ \ b_n = 0\\]
Finally, our Fourier Series of our even function is simply
\\[f(\theta) = a_0 + \sum_{n=1}^{\infty}a_n\cos(n\theta)\\]
\begin{tcolorbox}[colback=white, colframe=black]
\[
\sum_{n=1}^{\infty}\frac{1}{n^4} = \frac{\pi^4}{90}
\]
\end{tcolorbox}
