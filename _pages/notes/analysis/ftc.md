---
layout: archive
title: "The Fundamental Theorem of Calculus with the Lebesgue Integral"
permalink: /notes/analysis/ftc/
author_profile: false
--- 
<hr style="border: 2px solid black;">
Most people are familiar with the sort of inverse relationship between the integral operation and the derivative, referred to as **The Fundamental Theorem of Calculus**. We are typically introduced to this relationship in a first term calculus course. I will provide a more rigorous outline of this relationship, with the Lebesgue integral, and show that that it (under certain circumstances) still obeys this relationship (if it didn't, we would be doing something wrong). Really there are two statements to consider (and for me to prove). I will state them both and then resolve them in order. 

What to Consider
==
The first question, does integrability on an interval imply the existance of a derivative. Additionally, does the derivative of the integrated function, return the unintegrated function. More formally:
\\[\text{If f is an integrable function on an interval } \[a,b\], \text{ where } F(x) = \int_a^x f(y) dy \\]
\\[\text{can we say for certain that } F^{\'} \text{ exists, and furthermore, can we conclude that } F^{\'} = f \text{ (at least for almost every } x)\\]
The second question, flips this question in the other direction. What restrictions do we have to place on a function \\(F\\) defined on an interval \\(\[a,b\]\\), such that we can ensure the derivative exists (at least for almost every \\(x\\)), and furthermore, that this function is integrable, and that the integral of this differentiated function equals the function \\(F\\) evaluated at \\(b\\) minus the function \\(F\\) evaluated at \\(a\\). More formally, we ask:
\\[\text{What characteristics must } F \text{ have such that the derivative } F^{\'} \text{ exists almost everywhere,}\\]
\\[\text{the differentiated function is integrable, and }\\]
\\[\text{that } F(b) - F(a) = \int_a^bF^{\'}(x) dx \text{  holds}\\]
In other words, the first question is concerned with differentiation of an integrated function. Whereas the second question is concerned with integrating a differentiated function. In both cases we are concerned with existance of a derivative, integrability, and ensuring an inverse operation. However, the difference is in the order we apply these operations. As mentioned, we will begin with the first question. 

The Derivative of an Integral and The Lebesgue Differentation Theorem
==
We define a function that serves as the definite integral of a function as:
\\[F(x) = \int_a^xf(y)dy \text{     } a \leq x \leq b\\]
In this case \\(x\\) can take any value, between and including \\(a\\) and \\(b\\). We write this as a function of \\(x\\) because we want \\(y\\) to vary along any interval that we defined by \\(\[a, x\]\\), so the value of the integral is determined by \\(x\\), where \\(y\\) is sometimes just called a "dummy" variable, meaning it just represents a value that varies between our boundaries. So first, we want to see if the derivative even exists. To do this, we will utilize the standard limit definition of a derivative: 
\\[F^{\'}(x) = \lim_{h \to 0} \frac{F(x + h) - F(x)}{h}\\]
Substituting our expression for \\(F\\) we get:
\\[\lim_{h \to 0} \frac{\int_a^{x+h}f(y)dy - \int_a^x f(y)dy}{h}\\]
We note that
\\[\int_a^{x+h}f(y)dy = \int_a^xf(y) dy + \int_x^{x+h}f(y)dy\\]
By substituting this into our fraction above, we get
\\[\lim_{h \to 0} \frac{\int_a^xf(y) dy + \int_x^{x+h}f(y)dy - \int_a^x f(y)dy}{h}\\]
It's apparent now, that this simplifies to
\\[\lim_{h \to 0} \frac{\int_x^{x+h}f(y)dy}{h}\\]
We can rewrite this as 
\\[\lim_{h \to 0} \frac{1}{h}\int_x^{x+h}f(y)dy\\]
To simplify the notation, since we know that we have the interval \\(\[x,x+h\]\\), so we can denote this by a ball \\(B\\). We also replace \\(\frac{1}{h}\\) as \\(\frac{1}{m(B)}\\) where \\(m(B)\\) is simply the measure of the ball, since the measure of the interval \\(\[x,x+h\]\\) is just \\(h\\). Now, we also replace our notion of \\(h \to 0\\) with \\(m(B) \to 0\\). Then our limit becomes
\\[\lim_{m(B) \to 0} \frac{1}{m(B)}\int_Bf(y)dy\\]
Now we have existance, the next step is to ask whether 
\\[\lim_{m(B) \to 0} \frac{1}{m(B)}\int_Bf(y)dy = f(x) \text{ for a.e } x\\]
This is known as the **averaging problem**. This comes from the fact that 
\\[\frac{1}{m(B)}\int_Bf(y)dy\\]
This is simply the average value of the function \\(f\\). If it still isn't obvious, we can look at the integral as a sort of sum of values produced by \\(f\\), the average of a sum of values is simply the sum of values divided by the amount of stuff we added together. This is analogous to our expression above. It's basically asking if the average value of a function converges to the value of the function as the interval we are averaging the function over, gets smaller and smaller around the point. Now as mentioned, the question is whether or not the equation holds for almost every \\(x\\). I will begin by showing this equality holds for continuous functions.\\
\\
First, to recall, a function \\(f\\) is continuous if
\\[\forall \varepsilon > 0, \exists \delta > 0 \text{ such that }\\]
\\[\left|f(y) - f(x)\right| < \varepsilon \implies \left|y - x\right| < \delta\\]
With this in mind.
\\[\text{Assume } f \text{ is a continuous function, then if our claim is that}\\]
\\[\lim_{m(B) \to 0} \frac{1}{m(B)}\int_Bf(y)dy = f(x)\\]
\\[\text{Then by the definition of convergence, we are trying to show}\\]
\\[\left|\frac{1}{m(B)}\int_Bf(y)dy - f(x)\right| < \varepsilon\\]
First we note that 
\\[\frac{1}{m(B)}\int_Bf(y)dy - f(x) = \frac{1}{m(B)}\int_B(f(y) - f(x))dy\\]
With this in mind we can rewrite our expression in the absolute value as
\\[\left|\frac{1}{m(B)}\int_B(f(y) - f(x))dy\right|\\]
Now by the triangle inequality:
\\[\left|\frac{1}{m(B)}\int_B(f(y) - f(x))dy\right| < \frac{1}{m(B)}\int_B\left|(f(y) - f(x))\right|dy\\]
Now since we know (by our assumption that \\(f\\) is continuous) that 
\\[\left|x - y\right| < \delta \implies \left|f(y)-f(x)\right| < \varepsilon\\]
Now all we have to do is consider that our ball \\(B\\) has radius \\(\frac{\delta}{2}\\) (i.e. \\(B_{\frac{\delta}{2}}\\)), this means that \\(m(B) < \frac{\delta}{2}\\). We do this, since we want to ensure any two points in the ball are less than a distance \\(\delta\\) from each other, since this will enforce \\(\left|f(y) - f(x)\right| < \varepsilon\\) by our assumption that \\(f\\) is continuous. Now, two points in a ball can be a maximum distance of 2 times the radius of the ball away from each other, i.e. \\(2\delta\\). So if we make the radius of the ball less than \\(\frac{delta}{2}\\), then two points will always be less than \\(2\frac{\delta}{2} = \delta\\), and we ensure continuity. Now, that we have our continuity condition, putting the above inequalities together. 
\\[\left|\frac{1}{m(B)}\int_B(f(y) - f(x))dy\right| < \frac{1}{m(B)}\int_B\left|(f(y) - f(x))\right|dy < \frac{1}{m(B)}\varepsilon\\]
And we can say that 
\\[\left|\frac{1}{m(B)}\int_B(f(y) - f(x))dy\right| < \frac{1}{m(B)}\varepsilon\\]
We know that 
\\[\left|\frac{1}{m(B)}\int_B(f(y) - f(x))dy\right| = \left|\frac{1}{m(B)}\int_Bf(y)dy - f(x)\right|\\]
Plugging this in gives
\\[\left|\frac{1}{m(B)}\int_Bf(y)dy - f(x)\right| < \frac{1}{m(B)}\varepsilon\\]
Now since we can make \\(\varepsilon\\) as small as possible, we can write \\(\frac{1}{m(B)}\varepsilon\\) as \\(\varepsilon\\). This gives us
\\[\left|\frac{1}{m(B)}\int_Bf(y)dy - f(x)\right| < \varepsilon\\]
And we have proven that the limit of the average value is indeed the function evaluated at the point. In other words, when \\(f\\) is continuous we have that: 
\\[\lim_{m(B) \to 0} \frac{1}{m(B)}\int_Bf(y)dy = f(x) \text{ for a.e } x\\]
Now to prove this for more general functions requires a pretty technical covering theorem with spheres, and use of the [Hardy-Littlewood Maximal Function](https://en.wikipedia.org/wiki/Hardy%E2%80%93Littlewood_maximal_function), instead we will just state the final conclusion of this investigation. The Lebesgue Differentiation Theorem.\\
**The Lebesgue Differentation Theorem:**\\
If \\(f\\) is any integrable function on \\(\mathbb{R}^d\\), then 
\\[\lim_{m(B) \to 0}\frac{1}{m(B)}\int_Bf(y)dy = f(x) \text{ for almost every } x \text{ with } x \in B\\]
So we have found the necessary conditions for the first question. In other words, the derivative of the integral of a functoin is in fact just the unintegrated function (the function in the integrand), granted that the function is integrable. 

The Integral of a Differentiated Function
===



