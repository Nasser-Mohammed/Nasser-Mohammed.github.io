---
layout: archive
title: "The Lebesgue Integral"
permalink: /notes/analysis/lebintegral/
author_profile: false
--- 
<hr style="border: 2px solid black;">
This will be a pretty brief section. I will list the primary ideas of integration theory and their applications. We begin with defining the integral on the easiest case, simple functions.

Integral of Simple Function
===
A simple function \\(\phi (x)\\) is defined as
\\[\phi(x) = \sum_{k = 1}^M c_k\mathcal{X}_{E_k}(x)\\]
In other words, this is a **finite** sum of some constants multiplied to a characteristic function defined on a **measurable** subset \\(E_k\\). What we can interpret this as, is for some input \\(x\\), we loop through every partition \\(E_k\\), of a domain. The value will be a 0 everywhere except for 1 subset, say \\(E_j\\), and at that subset, the function will return \\(c_j\\) because \\(\mathcal{X}_{E_j}\\) will simply be 1. This basically lets us assign some value other than 1, to every partition of a domain. We know \\(x\\) cannot be in two different \\(E_k\\)s because they are partitioned that way (they are in a canonical form). If you notice, this is just a generalization of the *step* functions introduced in the Riemann Sum, however, in our case, our sets \\(E_k\\) only have to be measurable, whereas the Riemann Sum limits them to rectangles (essentially intervals). Note that each \\(a_k\\) is distinct and non-zero, and as mentioned each \\(E_k\\) is disjoint, as part of our canonical form. Intuitively, the *Lebesgue* integral of \\(\phi (x)\\) is defined as
\\[\int_{\mathbb{R}^d}\phi(x) dx = \sum_{k = 1}^M c_k\mathcal{X}_{E_k}\\]
We can then easily define the integral over a specific subset \\(F\\) of \\(\mathbb{R}^d\\) as:
\\[\int_{F}\phi(x) dx = \int_{\mathbb{R}^d}\phi(x)\mathcal{X}_F(x) dx\\]
