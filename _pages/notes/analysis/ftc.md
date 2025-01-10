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
\\[\text{If f is an integrable function on an interval} \[a,b\], \text{ where } F(x) = \int_a^x f(y) dy \\]
\\[\text{can we say for certain that } F^{\'} \text{ exists, and furthermore, can we conclude that } F^{\'} = f \text{ (at least for almost every } x\\]
The second question, flips this question in the other direction. What restrictions do we have to place on a function \\(F\\) defined on an interval \\(\[a,b\]\\), such that we can ensure the derivative exists (at least for almost every \\(x\\)), and furthermore, that this function is integrable, and does the integral of this differentiated function equal the function \\(F\\) evaluated at \\(b\\) minus the function \\(F\\) evaluated at \\(a\\). More formally, we ask:
\\[\text{What characteristics must } F \text{ have such that the derivative } F^{\'} \text{ exists almost everywhere, the differentiated function is integrable, and }\\]
\\[\text{that } F(b) - F(a) = \int_a^bF^{\'}(x) dx \text{ holds}\\]
In other words, the first question is concerned with differentiation an integrated function. Whereas the second question is concerned with integrating a differentiated function. In both cases we are concerned with existance, integrability, and ensuring an inverse operation. However, the difference is in the order we apply these operations. As mentioned, we will begin with the first question. 

The Derivative of an Integral
===
We define a function that serves as the definite integral of a function as:
\\[F(x) = \int_a^xf(y)dy : a \leq x \leq b\\]
In this case \\(x\\) can take any value, between and including \\(a\\) and \\(b\\). We write this as a function of \\(x\\) because we want \\(y\\) to vary along any interval that we defined by \\(\[a, x\]\\), so the value of the integral is determined by \\(x\\), where \\(y\\) is sometimes just called a "dummy" variable, meaning it just represents a value that varies between our boundaries. So first, we want to see if the derivative even exists. To do this, we will utilize the standard limit definition of a derivative: 
\\[F^{\'}(x) = \lim_{h \to 0} \frac{F(x + h) - F(x)}{h}\\]
Substituting our expression for \\(F\\) we get:
\\[\lim_{h \to 0} \frac{\int_a^{x+h}f(y)dy - \int_a^x f(y)dy}{h}\\]
