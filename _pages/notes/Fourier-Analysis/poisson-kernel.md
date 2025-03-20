---
layout: archive
title: "Derivation of the Poisson Kernel"
permalink: /notes/fourier-analysis/poisson-kernel/
author_profile: false
--- 
<hr style="border: 2px solid black;">
The Poisson kernel is frequently used and studied in the context of partial differential equations and harmonic analysis. I will not go over its importance in those fields. Instead I will introduce its derivation, and why it shows up naturally.

## Derivation
The absolute convergence of the infinite series below is well known,
\\[\sum_{k = 0}^{\infty}p^k = \frac{1}{1-p} \ \ \ \text{ where } |p| < 1\\]
Now, we know some functions that are also bounded between \\((-1,1)\\). Namely, \\[\sin, \cos\\] Furthermore, we can multiply any value in the interval \\((-1,1)\\) to another value in the same interval and the result would still be in the interval. In other words, the interval \\((-1,1)\\) is closed under multiplication. With that, if we let 
\\[p = re^{i\theta}\\]
We can be assured by our earlier statement that \\(|p| < 1\\). Then our expression becomes
\\[\sum_{k = 0}^{\infty}p^k = \sum_{k = 0}^{\infty}r^ke^{ik\theta} = \frac{1}{1-re^{i\theta}}\ \ \ \text{ where } |p| < 1\\]
Now, we want to consider the real part of this function. To do so, I'll multiply our expression by \\(1\\) represented by the complex conjugate. 
\\[\frac{1}{1-re^{i\theta}}\cdot \frac{\overline{(1-re^{i\theta})}}{\overline{(1-re^{i\theta})}} = \frac{1}{1-re^{i\theta}}\cdot \frac{1-re^{-i\theta}}{1-re^{-i\theta}}\\]
Recall [Euler's formula](https://en.wikipedia.org/wiki/Euler%27s_formula), which can be summarized as
\\[e^{i\theta} = \cos(\theta) + i\sin(\theta)\\]
We can also derive the following,
\\[e^{-i\theta} = \cos(-\theta) + i\sin(-\theta)\\]
Now \\(\cos\\) is an even function so \\[\cos(-\theta) = \cos(\theta)\\]
\\(\sin\\) is an odd function so,
\\[\sin(-\theta) = -\sin(\theta)\\]
then we have that,
\\[e^{-i\theta} = \cos(\theta) - i\sin(-\theta)\\]
Now we can use these to rewrite our expression
\\[\frac{1}{1-re^{i\theta}}\cdot \frac{1-re^{-i\theta}}{1-re^{-i\theta}} = \frac{1-re^{-i\theta}}{1 - re^{-i\theta}-re^{i\theta} + r^2e^{-i\theta}e^{i\theta}}\\]
Which just results from multiplying out the denominator. Now let's analyze the denominator,
\\[1 - re^{-i\theta}-re^{i\theta} + r^2e^{-i\theta}e^{i\theta}\\]
We can rewrite
\\[-re^{-i\theta}-re^{i\theta} = -r(e^{-i\theta}+e^{i\theta}) = -r(\cos(\theta) -i\sin(\theta) + \cos(\theta) + i\sin(\theta) \\] 
\\[= -2r\cos(\theta)\\]
Which was just an application of Euler's formula. Now let's consider the other part of the denominator,
\\[r^2e^{-i\theta}e^{i\theta} = r^2\cdot 1\\]
Since \\(e^{-i\theta}\cdot e^{i\theta} = 1\\). Then plugging everything in, we have
\\[\frac{1-re^{-i\theta}}{r^2-2r\cos(\theta) + 1}\\]
Using Euler's formula again for the numerate, we have
\\[\frac{1-r\cos(\theta) + ir\sin(\theta)}{r^2-2r\cos(\theta) + 1}\\]
We can break this up as,
\\[\frac{1-r\cos(\theta) + ir\sin(\theta)}{r^2-2r\cos(\theta) + 1} = \frac{1-r\cos(\theta)}{r^2-2r\cos(\theta) + 1} + \frac{ir\sin(\theta)}{r^2-2r\cos(\theta) + 1}\\]
Then we can easily extract the real part of this as
\\[P_r(\theta) = \frac{1-r\cos(\theta)}{r^2-2r\cos(\theta) + 1}\\]
In most settings, we will see this slightly altered, so I will also continue to getting the more common form. We know that we took the real part of this series, meaning it is equivalent to if we had take the real part of 
\\[\sum_{k = 0}^{\infty}p^k = \sum_{k = 0}^{\infty}r^ke^{ik\theta}\\]
Taking the real part of the series above gives,
\\[\Re (\sum_{k = 0}^{\infty}r^ke^{ik\theta}) = \sum_{k = 0}^{\infty}r^k\cos(k\theta)\\]
and we know this is equivalent to our derived expression, so
\\[\frac{1-r\cos(\theta)}{r^2-2r\cos(\theta) + 1} = \sum_{k = 0}^{\infty}r^k\cos(k\theta)\\]
At \\(k=0\\), \\(\cos(0) = 1\\) and \\(r^0 =1\\). So, we have
\\[\frac{1-r\cos(\theta)}{r^2-2r\cos(\theta) + 1} = 1 + \sum_{k=1}^{\infty}r^k\cos(k\theta)\\]
We note that,
\\[\sum_{k=1}^{\infty}r^k\cos(k\theta) = \sum_{k=-1}^{-\infty}r^{|k|}\cos(|k|\theta)\\]
Again, we know \\(\cos\\) is even so \\(\cos(-k\theta) = \cos(k\theta)\\), so we can drop the absolute value sign.
\\[\sum_{k=-1}^{-\infty}r^{|k|}\cos(|k|\theta) = \sum_{k=-1}^{-\infty}r^{|k|}\cos(k\theta)\\]
Then, the series
\\[\sum_{k=-1}^{-\infty}r^{|k|}\cos(k\theta) + \sum_{k=1}^{\infty}r^{k}\cos(k\theta)\\]
Is just 
\\[2\sum_{k=-1}^{-\infty}r^{|k|}\cos(k\theta)\\]
and therefore, to preserve the fact that we only have half of this sum (the positive half) originally, we can rewrite our series as half of this sum, so
\\[1 + \sum_{k=1}^{\infty}r^k\cos(k\theta) = \frac{1}{2}\cdot(1+\sum_{k\in \mathbb{Z}}r^{|k|}\cos(k\theta))\\]
Which is just
\\[\frac{1}{2}+\frac{1}{2}\sum_{k\in \mathbb{Z}}r^{|k|}\cos(k\theta)\\]
Finally, recall
\\[e^{k\theta} = \cos(k\theta) + i\sin(k\theta)\\]
Then we can replace \\(\cos(k\theta\\) with \\(e^{k\theta}\\), since 
\\[\forall k, -k, \ \text{ we would have } r^{|k|}e^{k\theta} + r^{|-k|}e^{-k\theta}\\]
It's easy to see that
\\[ r^{|k|}e^{k\theta} + r^{|-k|}e^{-k\theta} = r^{|k|}(\cos(k\theta) + i\sin(k\theta) + \cos(-k\theta) - i\sin(k\theta)\\]
Therefore, \\(\forall k\\), this expression reduces to 
\\[2r^{|k|}\cos(k\theta)\\]
Which is double what we have, so we can make this substitution as long as we make sure to half it, doing so gives.
\\[\frac{1}{2}+\frac{1}{2}\sum_{k\in \mathbb{Z}}r^{|k|}\cos(k\theta)\\]

