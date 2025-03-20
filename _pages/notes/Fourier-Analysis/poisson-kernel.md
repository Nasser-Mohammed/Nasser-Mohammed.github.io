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
\\[\frac{1}{1-re^{i\theta}}\cdot \frac{\overline{1-re^{i\theta}}}{\overline{1-re^{i\theta}}} = \frac{1}{1-re^{i\theta}}\cdot \frac{1-re^{-i\theta}}{1-re^{-i\theta}}\\]
