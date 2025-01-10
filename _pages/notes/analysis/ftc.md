---
layout: archive
title: "The Fundamental Theorem of Calculus with the Lebesgue Integral"
permalink: /notes/analysis/ftc/
author_profile: false
--- 
<hr style="border: 2px solid black;">
Most people are familiar with the sort of inverse relationship between the integral operation and the derivative, referred to as **The Fundamental Theorem of Calculus**. We are typically introduced to this relationship in a first term calculus course. I will provide a more rigorous outline of this relationship, with the Lebesgue integral, and show that that it (under certain circumstances) still obeys this relationship (if it didn't, we would be doing something wrong). Really there are two statements to consider (and for me to prove). I will state them both and then resolve them in order. 

What to Consider
===
The first, does integrability on an interval imply the existance of a derivative. Additionally, does the derivative of the integrated function, return the unintegrated function. More formally:
\\[\text{If f is an integrable function on an interval \[a,b\], where F(x) = \int_a^x f(y) dy \\]
\\[\text{can we say for certain that } F^{\'} \text{ exists, and furthermore, can we conclude that } F^{\'} = f \text{ (at least for almost every } x\\]
The second question, flips this question in the other direction. What restrictions do we have to place on a function \\(F\\) defined on an interval \\(\[a,b\]\\), such that we can ensure the derivative exists (at least for almost every \\(x\\)), and furthermore, if this function is integrable, and if it is, does the integral of this differentiated function equal the function \\(F\\) evaluated at \\(b\\) minus the function \\(F\\) evaluated at \\(a\\). More formally, we ask:
\\[\text{What characteristics must } F \text{ have such that the derivative } F^{\'} \text{ exists almost everywhere, the differentiated function is integrable, and }\\]
\\[\text{that } F(b) - F(a) = \int_a^bF^{\'}(x) dx \text{ holds}\\]
