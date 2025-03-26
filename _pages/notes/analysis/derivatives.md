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
We will use [Binomial Theorem](https://en.wikipedia.org/wiki/Binomial_theorem), to expand the \\((x+h)^n\\) into 
\\[\sum_{k = 0}^{n} \binom{n}{k}x^kh^{n-k} = x^n + \binom{n}{1}hx^{n-1} + \binom{n}{2}x^{n-2}h^2 + .... h^n\\]
Then subtracting both sides by \\(x^n\\) gives,
\\[(x+h)^n - x^n = \binom{n}{1}hx^{n-1} + \binom{n}{2}x^{n-2}h^2 + .... h^n\\]
Dividing by \\(h\\), we have
\\[\frac{(x+h)^n - x^n}{h} = \binom{n}{1}x^{n-1} + \binom{n}{2}x^{n-2}h + .... h^{n-1}\\]
Now we consider the limit as \\(h \to 0\\),
\\[\lim_{h \to 0}\frac{(x+h)^n - x^n}{h} = \binom{n}{1}x^{n-1} + \binom{n}{2}x^{n-2}h + .... h^{n-1}\\]
\\[\lim_{h \to 0}\frac{(x+h)^n - x^n}{h} = \lim_{h \to 0}\binom{n}{1}x^{n-1} + \lim_{h \to 0}\binom{n}{2}x^{n-2}h + .... \lim_{h \to 0}h^{n-1}\\]
Each term goes to \\(0\\), except for the first. 
\\[\lim_{h \to 0}\frac{(x+h)^n - x^n}{h} = \lim_{h \to 0}\binom{n}{1}x^{n-1} = \binom{n}{1}x^{n-1}\\]
Since the right hand side doesn't depend on \\(h\\). Therefore, we have that 
\\[f'(x) = \binom{n}{1}x^{n-1} = \frac{n!}{1!(n-1)!}x^{n-1} = nx^{n-1}\\]
And we have the known rule that,
\\[f'(x) = nx^{n-1}\\]
