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

Integral of Bounded Functions Supported on Sets of Finite Measure
===
Supported on a set just means that the function is non-zero on that set, i.e. \\(f(x)\\) is supported on \\(E \implies f(x) \ne 0\\) where \\(x \in E\\). There isn't much to note with the following definition for the integral, we do however, use it for building the next type of integral. Before we define it, we must note an important conclusion. We assume here that \\(f\\) is a bounded function supported on a set \\(E\\) of finite measure.\\
\\
\\[\text{If } \phi_n(x) \text{ is a sequence of simple functions that converges to } f \text{ } a.e \text{ } x \\]
\\[\text{, and each } \phi_n(x) \text{ is supported on } E \text{ and is bounded by } M \text{ then, }\\]
\\[1. \lim_{n \to \infty}\int \phi_n \text{ exists}\\]
\\[2. f = 0 \implies \lim_{n \to \infty}\int\phi_n = 0\\]
Now we define the integral of a bounded function supported on a set of finite measure as:\\
\\[\int f(x) dx = \lim_{n \to \infty}\int\phi_n(x)dx\\]
This integral enjoys the same properties as our first integral, **linearity, monotonicity, additivity, and respects the triangle inequality**. We will now introduce the first convergence theorem, the Bounded Convergence Theorem.

Bounded Convergence Theorem
===
This is the first of our convergence theorems, but sort of becomes obsolete once we introduce the more powerful convergence theorems. However, it is a necessary stepping stone to developing those theorems. The theorem is as follows: 
\\[\text{If we have a sequence of measurable functions, bounded by } M \text{ and supported on a set } E \text{ of finite measure}\\]
\\[\text{with the sequence of functions converging to } f\\]
\\[\text{i.e  } \phi_n(x) \to f(x) \text{ } a.e \text{  }x \text{ as } n \to \infty \text{, we then have that }\\]
\\[\int \phi_n(x) \to \int f \text{ as } n \to \infty\\]
We now move on to a less restrictive integral.


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
This theorem implies another important result, with the way a series of non-negative measurable functions interacts with an integral.\\
\\
**Corollary:**
\\[\text{If we have a series of non-negative measurable functions: } \sum_{k = 1}^{\infty}\phi_k(x) \text{ then }\\]
\\[\int\sum_{k = 1}^{\infty}\phi_k(x) dx = \sum_{k = 1}^{\infty}\int \phi_k(x)dx\\]
We also can conclude that if 
\\[\sum_{k = 1}^{\infty}\int \phi_k(x)dx < \infty \implies \\sum_{k = 1}^{\infty} \phi_k(x) \text{ converges to a finite value for almost every } x\\]


The Generalized Integral (For any measurable function)
===
Before, we had restrictions on our functions, we now tackle the problem of defining an integral on any measurable function. Here, we say that a function \\(f\\) is integrable if
\\[\left|f\right| < \infty\\]
We must now define another way to write a measurable function, we say that we can decompose any measurable function \\(f\\) as:
\\[f = f^{+} - f^{-}\\]
Where
\\[f^{+}(x) = max(f(x), 0) \text{    and    } f^{-}(x) = max(-f(x), 0)\\]
We can now define the integral with tools that we've been building up to this point. That is because each term \\(f^{+}\\) and \\(f^{-}\\) are non-negative measurable functions, and we can therefore use prior results on them.\\
\\
**The Lebesgue Integral of a Measurable Function** \\(f\\):
\\[\int f = \int f^{+} - \int f^{-}\\]
If a function is integrable, the integral, like the ones before, is **additive, linear, monotonic, and respects the triangle inequality.**\\
Additionally, we have a very important property, sometimes called **absolute continuity**. Informally, it says that if a function is integrable, we can find a small enough set such that the integral on that set is also very small. More formally:
\\[\text{If } f \text{ is an integrable function, then } \forall \varepsilon > 0:\\]
\\[\exists \delta > 0 \text{ such that if } m(E) < \delta \text{ then}\\]
\\[\int_E \left| f \right| < \varepsilon\\]
Another thing to note, is that we can also find a ball such that the integral of the absolute value of the function, over the complement of the ball is arbitrarily small (i.e. \\(< \varepsilon\\)).


The Dominated Convergence Theorem
===
This is pretty much the summation of the results so far. It gives us the criteria for the integral of a sequence of functions to converge to the integral of the function that they converge to. Formally:

\\[\text{If } f_n \text{ is a sequence of measurable functions, where } f_n(x) \to f(x) \text{ } a.e \text{ } x \text{ as } n \to \infty \text{ and }\\]
\\[\left| f_n(x) \right| \leq g(x) \text{ where } g \text{ is an integrable function, then }\\]
\\[\int f_n \to \int f \text{ as } n \to \infty\\]
In other words, if we can "dominate" our sequence by a function that we know is integrable, then we can conclude that the limit of the integral is the integral of the limit.\\

Conclusion
===
This covered the majority of the results in Lebesgue Integration Theory, there are some other considerations such as the \\(L^1\\) space, however I will cover that in the section about \\(L^p\\) theory. There are also things like the convolution, dilation, etc, that I will cover in the section on Fubini's Theorem and Tonelli's Theorem.

