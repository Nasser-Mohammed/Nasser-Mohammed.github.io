---
layout: archive
title: "The Lebesgue Integral"
permalink: /notes/analysis/lebintegral/
author_profile: false
--- 
<hr style="border: 2px solid black;">
This will be a pretty brief section. I will list the primary ideas of integration theory and their applications. We begin with defining the integral on the easiest case, simple functions. I will skip Bounded Convergence theorem, as the other two convergence theorems are much more useful and important.

Integral of Simple Functions
===
A simple function \\(\phi (x)\\) is defined as
\\[\phi(x) = \sum_{k = 1}^M c_k\chi_{E_k}(x)\\]
In other words, this is a **finite** sum of some constants multiplied to a characteristic function defined on a **measurable** subset \\(E_k\\). What we can interpret this as, is for some input \\(x\\), we loop through every partition \\(E_k\\), of a domain. The value will be a 0 everywhere except for 1 subset, say \\(E_j\\), and at that subset, the function will return \\(c_j\\) because \\(\chi_{E_j}\\) will simply be 1. This basically lets us assign some value other than 1, to every partition of a domain. We know \\(x\\) cannot be in two different \\(E_k\\)s because they are partitioned that way (they are in a canonical form). If you notice, this is just a generalization of the *step* functions introduced in the Riemann Sum, however, in our case, our sets \\(E_k\\) only have to be measurable, whereas the Riemann Sum limits them to rectangles (essentially intervals). Note that each \\(a_k\\) is distinct and non-zero, and as mentioned each \\(E_k\\) is disjoint, as part of our canonical form. Intuitively, the *Lebesgue* integral of \\(\phi (x)\\) is defined as
\\[\int_{\mathbb{R}^d}\phi(x) dx = \sum_{k = 1}^M c_k\chi_{E_k}\\]
We can then easily define the integral over a specific subset \\(F\\) of \\(\mathbb{R}^d\\) as:
\\[\int_{F}\phi(x) dx = \int_{\mathbb{R}^d}\phi(x)\chi_F(x) dx\\]
Since \\(\phi(x)\chi_F(x)\\) is a simple function too. This basically sets the function to 0 everywhere, except the part that we care about. There are a few important properties of this integral that I will simply list.
- Linearity: \\(\int_{\mathbb{R}^d}(a\phi(x) + b\psi(x)) dx = a\int_{\mathbb{R}^d}\phi(x)dx + b\int_{\mathbb{R}^d}\psi(x)dx\\)
- Additivity: \\(\int_{E\cup F}\phi = \int_{E}\phi + \int_{F}\phi\\)
- Monotonicity: \\(\phi \leq \psi \implies \int\phi \leq \int\psi\\)
- Triangle Inequality: \\(\| \int \phi \|\leq \int \| \phi \|\\) \\
These properties will continue to hold for our more generalized integrals. Also note, that we assume \\(E\\) and \\(F\\) are disjoint and finite measure in the additivity property. One last thing to note, is that if \\(\phi\\) is a simple function then so is \\(\| \phi\|\\)

Integral of Nonnegative Functions
===
Before we get into these, we define **integrability** as:
\\[\text{A measurable function } f \text{ is integrable if: } \int_{\mathbb{R}^d} f(x)dx < \infty\\]

For a non-negative function \\(f\\), we define its integral as:
\\[\int f(x)dx = \underset{g}{sup}\int g(x)dx\\]
We are taking the supremum over all measurable bounded functions \\(g\\) supported on a set of finite measure such that \\(0 \leq g \leq f\\) (this allows for use of the Bounded Convergence Theorem). We have the same properties as the last integral, i.e. we have linearity, additivity, monotonicity, and the triangle inequality. However, there are a couple of other things to consider:
- If \\(g\\) is integrable and \\(0 \leq f \leq g \implies f \\) is integrable.
- \\(f\\) being integrable \\(\implies f < \infty \text{ } a.e \text{ } x\\)
- If the integral of a function is 0, then that function is 0 almost everywhere. More formally: \\(\int f = 0 \implies f(x) = 0 \text{ } a.e \text{ } x\\)

Now I will introduce a very important lemma

Fatou's Lemma
===
Although we know that we can always find a sequence of measurable functions \\(f_n\\) such that
\\[f_n(x) \to f(x)\\]
We actually cannot assume that 
\\[\int f_n dx \to \int f dx\\]
This is due to some counterexamples that prevent this straightforward approach. Instead we have Fatou's Lemma

\\[\text{Assume we have a sequence of measurable functions } f_n \text{ with } f_n \ge 0. \text{ Then, if } \lim_{n \to \infty}f_n(x) = f(x) \text{ } a.e \text{ } x \text{ then }\\]
\\[\int f \leq \lim_{n \to \infty}\text{inf} \int f_n\\]

From this, we get an important corollary that when combined with Fatou's Lemma above, will give us a convergence theorem. \\
\\
**Corollary:**
\\[\text{If } f \text{ is a non-negative measurable function and we have a sequence of measurable non-negative functions } f_n \\]
\\[\text{ that converge almost everywhere to } f \text{ with } f_n(x) \leq f(x) \text{ then }\\]
\\[\lim_{n \to \infty} \int f_n = \int f\\]
In other words, under these conditions, **the limit of the integral is the integral of the limit**. But we want to generalize this to where we don't have to put restrictions on \\(f\\). This leads us to the next big result, the Monotone Convergence Theorem.

Monotone Convergence Theorem
===
This theorem is used for nonnegative measurable functions, in essence, it allows us to say the same thing as the last corollary, but in a more generalized setting. That is, it lets us say that the **limit of the integral is the integral of the limit**. The theorem is stated below:
\\[\text{Let } f_n \text{ be a sequence of non-negative measurable functions } f_n \nearrow f \text{, then }\\]
\\[\lim_{n \to \infty}\int f_n = \int f\\]
This theorem implies another important result, with the way a series of non-negative measurable functions interacts with an integral:\\
**Corollary:**
\\[\text{If we have a series of non-negative measurable functions: } \sum_{k = 1}^{\infty}\phi_k(x) \text{ then }\\]
\\[\int\sum_{k = 1}^{\infty}\phi_k(x) dx = \sum_{k = 1}^{\infty}\int \phi_k(x)dx\\]


The Generalized Integral
===
Before, we had restrictions on our functions, we now tackle the problem of defining an integral on any measurable function. Here, we say that a function \\(f\\) is integrable if
\\[\left|f\right| < \infty\\]
We must now define another way to write a measurable function, we say that we can decompose any measurable function \\(f\\) as:
\\[f = f^{+} - f^{-}\\]
Where
\\[f^{+}(x) = max(f(x), 0) \text{    and    } f^{-}(x) = max(-f(x), 0)\\]
We can now define the integral with tools that we've been building up to this point. That is because each term \\(f^{+}\\) and \\(f^{-}\\) are non-negative measurable functions, and we can therefore use prior results on them.\\
**The Lebesgue Integral of a Measurable Function** \\(f\\):
\\[\int f = \int f^{+} - \int f^{-}\\]





