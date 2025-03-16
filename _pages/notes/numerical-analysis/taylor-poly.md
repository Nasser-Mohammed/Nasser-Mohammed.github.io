---
layout: archive
title: "Trigonometric Fourier Representation of Odd and Even Functions"
permalink: /notes/fourier-analysis/odd-even-fourier-rep/
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
