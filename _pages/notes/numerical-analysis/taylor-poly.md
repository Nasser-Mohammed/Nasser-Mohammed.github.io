---
layout: archive
title: "The Taylor Series"
permalink: /notes/numerical-analysis/taylor-series/
author_profile: false
--- 
<hr style="border: 2px solid black;">
The Taylor expansion of a function (also called the Taylor series of a function) is a very useful way to view functions. This expansion, is an infinite series given by a general formula. The important thing to understand here conceptually, is why the Taylor series is as 
important as it is. First, here is the formula for calculating the Taylor series of a function,
\\[\sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n\\]
Where \\(f^{(n)}\\) is the \\(n\\)-th derivative, and \\((x-a)^n\\) is the \\(n\\)-th power. Again, what is the point of this 
decomposition? The amazing thing about the Taylor series, is that we can write (almost) any function using this formula. Furthermore,
this means that we can reconstruct (almost) any function as long as we know the value of the function at a point for every derivative
(or to the degree of accuracy we want). Again, this is not a small result. We can completely reconstruct a function to an arbitrary degree
with one (kind of two) piece(s) of information (for every degree of accuracy we want), the value of a function at **one** single point 
for each derivative of the function. More than just this, this is almost necessary in computational cases (as in your computer, phone, etc)
since we cannot represent functions like \\(\sin, \cos, e^x\\) in their typical form. How would you compute \\(\sin\\) on a computer?
That is exactly where this Taylor series comes in, on all of our devices and calculators, we represent these functions in their 
Taylor series, and compute the functions to an arbitrary degree of accuracy.

## Derivation of the Taylor Series
I will provide a simple derivation of this series, as this formula alone does not really tell the whole story. After all, without context this seems like an arbitrary decomposition of a function. So, first let's assume we want to approximate our function \\(f(x)\\) with some polynomial of arbitrary length. So,
\\[f(x) = a_0 + a_1x + a_2x^2 + ..... + a_nx^n + .....\\]
Now the challenge here would be to find the right coefficients \\(a_n\\) that make this polynomial very close to our function. Well it's obvious that if we let \\(x=0\\), we'll be left with \\(a_0\\) and therefore have found our first coefficient. 
\\[f(0) = a_0\\]
Differentiating our polynomial, we get
\\[f'(x) = a_1 + 2\cdot a_2x + 3\cdot a_3x^2..... + n\cdot a_nx^{n-1} + .....\\]
Again, clearly we can set \\(x=0\\) to find \\(a_1\\)
\\[f'(0) = a_1\\]
Repeating this one more time,
\\[f^{\'\'}(x) = 2\cdot a_2 + 3\cdot 2 \cdot a_3x + ..........\\]
We can now start to see a pattern. So we can start to rewrite our function as
\\[f(x) = f(0) + f'(0)x + \frac{f^{\'\'}(0)}{2}x^2 + ....... + \frac{f^{(n)}(0)}{n!}x^n + ......... +\\]
Or more generally
\\[f(x) = \sum_{n=0}^{\infty}\frac{f^{(n)}(0)}{n!}x^n\\]
Why does this differ from the first formula? Well, we made an implicit assumption during this derivation. We assumed that we wanted our function to be \\(0\\) at \\(x=0\\). But what if the our function is zero at some other point, say for some \\(a\\)? Then we'd want our \\(x\\) terms to cancel out at \\(x = a \implies x - a = 0\\). Then we can replace this in the original equation to get
\\[\sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n\\]
