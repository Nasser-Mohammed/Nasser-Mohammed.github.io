---
layout: archive
title: "Derivation of the Derivative Rules"
permalink: /notes/analysis/derivatives/
author_profile: false
--- 
<hr style="border: 2px solid black;">
Many students first encounter the derivative "rules" in a first year calculus course. However, many never learn where these rules come from, and why functions of certain forms follow certain rules. I will derive the primary derivative rules by use of limits, and the limit definition of derivative. After all, the derivative is the limit definition, and everything else comes after. Naturally, we will begin with the properties of a limit.

## Limit Definition of a Derivative
The derivative is defined in terms of a limit as such. For a function \\(f(x)\\), 
\\[f'(x) = \lim_{h\to } \frac{f(x+h)-f(x)}{h}\\]
Now, we need to note a few properties of limits before we start the derivation. Below are the most funadmental properties,
\\[\text{Sums: } \lim_{x \to a}(f(x) + g(x)) = \lim_{x \to a}f(x) + \lim_{x\to a}g(x)\\]
\\[\text{Scalar multiplication: } \lim_{x\to a}cf(x) = c\cdot \lim_{x \to a}f(x) \ \ \text{for a constant } c\\]
\\[\text{Products: } \lim_{x \to a}(f(x)\cdot g(x)) = \lim_{x\to a}f(x) \cdot \lim_{x \to a}g(x)\\]
\\[\text{Powers: } \lim_{x\to a}(f(x))^n = (\lim_{x\to a}f(x))^n\\]
With these, we can now begin the derivation. Let's start with the most common, the power rule:
\\[\text{Let } f(x) = x^n \implies f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}\\]
Replacing \\(f(x)\\) with \\(x^n\\), we see that we have
\\[\lim_{h \to 0} \frac{(x+h)^n - x^n}{h}\\]
We will use [Binomial Theorem](https://en.wikipedia.org/wiki/Binomial_theorem), to expand the \\(x+h)^n\\)
