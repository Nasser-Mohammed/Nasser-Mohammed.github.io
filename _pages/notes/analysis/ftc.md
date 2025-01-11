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
The first question, does integrability on an interval imply the existence of a derivative. Additionally, does the derivative of the integrated function, return the unintegrated function. More formally:
\\[\text{If f is an integrable function on an interval } \[a,b\], \text{ where } F(x) = \int_a^x f(y) dy \\]
\\[\text{can we say for certain that } F^{\'} \text{ exists, and furthermore, can we conclude that } F^{\'} = f \text{ (at least for almost every } x)\\]
The second question, flips this question in the other direction. What restrictions do we have to place on a function \\(F\\) defined on an interval \\(\[a,b\]\\), such that we can ensure the derivative exists (at least for almost every \\(x\\)), and furthermore, that this function is integrable, and that the integral of this differentiated function equals the function \\(F\\) evaluated at \\(b\\) minus the function \\(F\\) evaluated at \\(a\\). More formally, we ask:
\\[\text{What characteristics must } F \text{ have such that the derivative } F^{\'} \text{ exists almost everywhere,}\\]
\\[\text{the differentiated function is integrable, and }\\]
\\[\text{that } F(b) - F(a) = \int_a^bF^{\'}(x) dx \text{  holds}\\]
In other words, the first question is concerned with differentiation of an integrated function. Whereas the second question is concerned with integrating a differentiated function. In both cases we are concerned with existence of a derivative, integrability, and ensuring an inverse operation. However, the difference is in the order we apply these operations. As mentioned, we will begin with the first question. 

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
To simplify the notation, since we know that we have an interval \\(\[x,x+h\]\\), then we can denote this by a ball \\(B\\). We also replace \\(\frac{1}{h}\\) as \\(\frac{1}{m(B)}\\) where \\(m(B)\\) is simply the measure of the ball, since the measure of the interval \\(\[x,x+h\]\\) is just \\(h\\). Now, we also replace our notion of \\(h \to 0\\) with \\(m(B) \to 0\\). Then our limit becomes
\\[\lim_{m(B) \to 0} \frac{1}{m(B)}\int_Bf(y)dy\\]
Now we have existence, the next step is to ask whether 
\\[\lim_{m(B) \to 0} \frac{1}{m(B)}\int_Bf(y)dy = f(x) \text{ for a.e } x\\]
This is known as the **averaging problem**. This comes from the fact that
\\[\frac{1}{m(B)}\int_Bf(y)dy\\]
Is simply the average value of the function \\(f\\). If it still isn't obvious, we can look at the integral as a sort of sum of values produced by \\(f\\), the average of a sum of values is simply the sum of values divided by the amount of stuff we added together. This is analogous to our expression above. It's basically asking if the average value of a function converges to the value of the function as the interval we are averaging the function over, gets smaller and smaller around the point. Now as mentioned, the question is whether or not the equation holds for almost every \\(x\\). I will begin by showing this equality holds for continuous functions.\\
\\
First, to recall, a function \\(f\\) is continuous if
\\[\forall \varepsilon > 0, \exists \delta > 0 \text{ such that }\\]
\\[\left|y - x\right| < \delta \implies \left|f(y) - f(x)\right| < \varepsilon\\]
With this in mind.
\\[\text{Assume } f \text{ is a continuous function, then if our claim is that}\\]
\\[\lim_{m(B) \to 0} \frac{1}{m(B)}\int_Bf(y)dy = f(x)\\]
\\[\text{Then by the definition of convergence, we are trying to show}\\]
\\[\left|\frac{1}{m(B)}\int_Bf(y)dy - f(x)\right| < \varepsilon\\]
First we note that 
\\[\frac{1}{m(B)}\int_Bf(y)dy - f(x) = \frac{1}{m(B)}\int_B(f(y) - f(x))dy\\]
It might not be obvious why, so first note that the integral is with respect to \\(y\\), meaning when we integrate a function of \\(x\\), we essentially just have a constant function with respect to \\(y\\). It might help to write out what carrying out the integral yields, 
\\[\int_Bf(x)dy = f(x)\int_Bdy = f(x)m(B)\\]
So if we were to write \\(f(x)\\) by itself, it would require us to multiply the term by \\(\frac{1}{m(B)}\\). Then it's easy to see that 
\\[\frac{1}{m(B)}\int_Bf(y)dy - f(x) = \frac{1}{m(B)}\int_Bf(y)dy - \frac{1}{m(B)}\int_Bf(x)dy\\]
and as we saw,
\\[\frac{1}{m(B)}\int_Bf(x)dy = \frac{1}{m(B)}f(x)\frac{1}{m(B)} = f(x)\\]
Then we can just pull out the integral and \\(\frac{1}{m(B)}\\) term out of the expression
\\[\frac{1}{m(B)}\int_Bf(y)dy - \frac{1}{m(B)}\int_Bf(x)dy = \frac{1}{m(B)}\int_B(f(y) - f(x))dy\\]
And finally we see,
\\[\frac{1}{m(B)}\int_Bf(y)dy - f(x) = \frac{1}{m(B)}\int_B(f(y) - f(x))dy\\]

With this in mind we can rewrite our expression in the absolute value as
\\[\left|\frac{1}{m(B)}\int_B(f(y) - f(x))dy\right|\\]
Now by the triangle inequality:
\\[\left|\frac{1}{m(B)}\int_B(f(y) - f(x))dy\right| < \frac{1}{m(B)}\int_B\left|(f(y) - f(x))\right|dy\\]
Now since we know (by our assumption that \\(f\\) is continuous) that 
\\[\left|x - y\right| < \delta \implies \left|f(y)-f(x)\right| < \varepsilon\\]
Now all we have to do is consider that our ball \\(B\\) has radius \\(\frac{\delta}{2}\\) (i.e. \\(B_{\frac{\delta}{2}}\\)). We do this, since we want to ensure any two points in the ball are less than a distance \\(\delta\\) from each other, since this will enforce \\(\left|f(y) - f(x)\right| < \varepsilon\\) by our assumption that \\(f\\) is continuous. Now, two points in a ball can be a maximum distance of 2 times the radius of the ball away from each other, i.e. \\(2\delta\\). So if we make the radius of the ball less than \\(\frac{\delta}{2}\\), then two points will always be less than \\(2\frac{\delta}{2} = \delta\\), and we ensure continuity. Now we have our continuity condition, we can apply this to our inequalities. **Note:** we can also note the property of absolute continuity, that is.
\\[m(E) < \delta \implies \int_E|g| < \varepsilon\\]
However, I prove our problem without this assertion, so combining the inequalities gives:
\\[\left|\frac{1}{m(B)}\int_B(f(y) - f(x))dy\right| < \frac{1}{m(B)}\int_B\left|(f(y) - f(x))\right|dy < \frac{1}{m(B)}\int_B\varepsilon dy = \frac{1}{m(B)}\varepsilon m(B) = \varepsilon\\]
And we can say that 
\\[\left|\frac{1}{m(B)}\int_B(f(y) - f(x))dy\right| < \varepsilon\\]
We know that 
\\[\left|\frac{1}{m(B)}\int_B(f(y) - f(x))dy\right| = \left|\frac{1}{m(B)}\int_Bf(y)dy - f(x)\right|\\]
Plugging this in gives
\\[\left|\frac{1}{m(B)}\int_Bf(y)dy - f(x)\right| < \varepsilon\\]
And we have proven that the limit of the average value is indeed the function evaluated at that point. In other words, when \\(f\\) is continuous we have that: 
\\[\lim_{m(B) \to 0} \frac{1}{m(B)}\int_Bf(y)dy = f(x) \text{ for a.e } x\\]
Now to prove this for more general functions requires a pretty technical covering theorem with spheres, and use of the [Hardy-Littlewood Maximal Function](https://en.wikipedia.org/wiki/Hardy%E2%80%93Littlewood_maximal_function), instead we will just state the final conclusion of this investigation.\\
**The Lebesgue Differentation Theorem:**\\
If \\(f\\) is any integrable function on \\(\mathbb{R}^d\\), then 
\\[\lim_{m(B) \to 0}\frac{1}{m(B)}\int_Bf(y)dy = f(x) \text{ for almost every } x \text{ with } x \in B\\]
So we have found the necessary conditions for the first question. In other words, the derivative of the integral of a function is in fact just the unintegrated function (the integrand of the function), granted that the function is integrable.\\
\\
There are a few more things to consider. In our assumptions above, \\(f\\) was integrable, and integrability speaks to the global behavior of a function. However, there are several functions that we can still show that the **Lebesgue Differentiation Theorem** holds for *locally*. So we introduce the concept of *local integrability*, that is for a function \\(f\\), if \\(B\\) is a ball then,
\\[\forall B, \int f(x)\chi_{B}(x) < \infty\\]
That is, if the function is integrable, on any finite ball, we then say that the function is *locally integrable*. We denote the space of these functions as
\\[L_{\text{loc}^1(\mathbb{R}^d\\]
What we are showing in defining this, is that the way a function acts at its extremities (infinity), should not affect how the integral acts on the function everywhere else. Since we proved that the Lebesgue Differentiation Theorem works for any integrable function, and local integrability is a "softer" requirement, then it also follows that the Lebesgue Differentation Theorem holds for locally integrable function too. This result leads to a result about a characteristic of measurable sets.\\
\\
**Lebesgue Density:**\\
For a measurable set \\(E\\) and a real number \\(x\\) (or vector of real numbers in higher dimensional sets), then \\(x\\) is a point of **Lebesgue Density** of \\(E\\) if
\\[\lim_{m(B) \to 0}\frac{m(B \cap E)}{m(B)} = 1 \text{  where } x \in B\\]
What this says, is that a point of Lebesgue Density, when covered by smaller and smaller balls, will have those balls completely contained in the set \\(E\\). This makes sense intuitively and leads to an important corollary and another definition.\\
\\
**Corollary:**\\
For any measurable subset \\(E\\) of \\(\mathbb{R}^d\\)
- almost every point in \\(E\\) is a point of density (in \\(E\\))
- almost every point not in \\(E\\) is not a point of density (in \\(E\\))

\\
and finally, we define one more thing.\\
\\
**Lebesgue Set:**\\
This refers to a set of points that cause a function (that is locally integrable) to behave a certain way. That is, the **Lebesgue Set** of a function \\(f\\) is the set of points \\(x\\) such that 
\\[\lim_{m(B)\to 0}\frac{1}{m(B)}\int_B\left| f(y) - f(x) \right|dy = 0\\]
Note that this is essentially a stronger version of the Lebesgue Differentiation Theorem. We note that if we have a Lebesgue Set \\(E\\), then \\(x \in E \implies f \text{ is continuous at } x\\). And as mentioned, we have the Lebesgue Differentiation theorem for any point in the Lebesgue Set. The last thing to remark, is that local integrability implies that almost every point in \\(\mathbb{R}^d\\) is in the Lebesgue Set of \\(f\\). \\
\\
That covers most of the considerations of the question raised at the beginning. I did not cover things like kernels/approximations to the identity. However, in some scenarios they are essentially tools used to "recover" approximated functions (from my understanding).



The Integral of a Differentiated Function
===
Now we turn to the other question, we are looking how we can ensure the following equality holds:
\\[F(b) - F(a) = \int_a^bF^{\'}(x)dx\\]
However, not all functions are differentiable, we can't even say all continuous functions are differentiable almost everywhere because of the existence of a continuous everywhere but nowhere differentiable function. See the [Weierstrass function](https://en.wikipedia.org/wiki/Weierstrass_function). Even if we ensure that the derivative exists, we need to find a way to ensure that the differentiated function is integrable (since if it's not, \\(F(b) - F(a)\\) would be meaningless). We begin this investigation with the introduction of bounded variation. \\
\\
**Bounded Variation:**\\
A function \\(F\\) is said to be of bounded variation if the variation over all partitions of the interval is bounded by some value. Formally, this says
\\[\sum_{j = 1}^{N}\left|F(t_j) - F(t_{j-1})\right| \leq M\\]
Where \\(t_j\\) and \\(t_{j-1}\\) are points of the partition of \\(\[a,b\]\\). i.e. 
\\[a = t_0 < t_1 <......< t_N = b\\]
An important observation is that a refinement of a partition will cause the variation to increase (or at worst, stay the same). This makes sense, if we consider these partitions as approximating a curve with lines running from point to point of the partition. With only a few lines, we miss out on a lot of the curve (and therefore variation) of the function. See a poor demonstration below, where the first curve is approximate with 3 lines, and the bottom curve is approximated with several. The variation of a line is obviously less than a curve, so we miss out on less of the curve with more and more lines. !(variation)[poly.png]
Naturally, we say that the **total variation** of a function \\(F\\) is
\\[T_F(a,x) = sup\sum_{j = 1}^N\left| F(t_j) - F(t_{j- 1})\right|\\]
Where we take the supremum over all partitions of \\(\[a,x\]\\). Now I will define the positive and negative variation, which measure how much variation the curve has in the positive and negative direction. 
\\[\text{Positive variation: } P_F(a,x) = sup\sum_{(+)}F(t_j) - F(t_{j-1})\\]
Note that \\((+)\\) indicates that we are only summing up the parts where \\(F(t_j) \ge F(t_{j-1})\\)
\\[\text{Negative variation: } N_F(a,x) = sup\sum_{(-)}-\[F(t_j) - F(t_{j-1})\]\\]
Note that here \\((-)\\) means we are summing up the portions where \\(F(t_j) \le F(t_{j-1})\\).\\
In both cases, the supremum is taken over all partitions of \\(\[a,x\]\\). There are two more things to consider with functions of bounded variation, that are used to prove our wanted result (the existence of the derivative). The first is that a function \\(f\\) of bounded variation on \\(\[a,b\]\\) has the following two equalities:
\\[F(x) - F(a) = P_F(a,x) - N_F(a,x)\\]
\\[T_F(a,x) = P_F(a,x) + N_F(a,x)\\]
The last tool that we need, is the following statement:
\\[\text{A function } F \text{ is of bounded variation on } \[a,b\] \text{ if and only if } F \text{ is }\\]
\\[\text{the difference of two increasing functions}\\]
This is pretty easy to see to show, first to show the \\(\rightarrow\\) direction. We assume \\(F = F_1 - F_2\\), and \\(F_1\\) and \\(F_2\\) are both increasing and of bounded variation. It directly follows that \\(F\\) is of bounded variation. For the \\(\leftarrow\\) direction, we assume \\(F\\) is of bounded variation and show it's decomposition. We can let 
\\[F_1(x) = P_F(a,x) + F(a)\\]
and
\\[F_2(x) = N_F(a,x)\\]
Both \\(F_1\\) and \\(F_2\\) are increasing and of bounded variation. Using the equalities above
\\[F(x) - F(a) = P_F(a,x) - N_F(a,x)\\]
\\[T_F(a,x) = P_F(a,x) + N_F(a,x)\\]
We see that 
\\[F(x) = P_F(a,x) - N_F(a,x) + F(a)\\]
Rearranging the terms to 
\\[F(x) = P_F(a,x) + F(a) - N_F(a,x)\\]
We see that \\(F(x) = F_1(x) + F_2(x)\\) where they are both increasing and of bounded variation. So the proof is completed. Now, we have our final result for the existence of a derivative:\\
**Differentiation Existence Theorem:**\\
If a function \\(F\\) is of bounded variation on an interval \\(\[a,b\]\\), then \\(F\\) is differentiable almost everywhere. i.e.
\\[\lim_{h \to 0}\frac{F(x+h) - F(x)}{h}\\]
exists almost everywhere. Which is what we were looking for. Now we know what conditions ensure the existence of a derivative. The next step is to find out when the integral of this derivative gives us our wanted equality presented at the beginning of the section. First we get this important corollary:\\
**Corollary:**\\
If \\(F\\) is increasing and continuous (meaning it's of bounded variation), then \\(F^{\'}\\) exists almost everywhere, and we have the following inequality (note that \\(F^{\'}\\) is non-negative and measurable):
\\[\int_a^bF^{\'}(x)dx \le F(b) - F(a)\\]
If you notice, this is almost what we want, however, we want the conditions for strict equality. A famous counter example to the equality we want (\\\int_a^bF^{\'}(x)dx = F(b) - F(a)\\)), is the [Cantor-Lebesgue Function](https://en.wikipedia.org/wiki/Cantor_function). The reason this is a counter example, is due ot the fact that this function is differentiable almost everywhere, with the derivative equal to \\(0\\) and because of that, the integral of the function from \\(0\\) to \\(1\\) is \\(0\\). But the function \\(F\\) has the following values at the endpoints: \\(F(0) = 0\\) and \\(F(1) = 1\\). So we see that 
\\[\int_a^bF^{\'}(x)dx \neq F(b) - F(a)\\]
Since
\\[\int_a^bF^{\'}(x)dx = 0\\]
and 
\\[F(b) - F(a) = 1\\]
But we do have that 
\\[\int_a^bF^{\'}(x)dx \le F(b) - F(a)\\]
This leads us to our last condition to get the Fundamental Theorem of Calculus. That is the condition of Absolute Continuity.\\
\\
**Absolute Continuity:**\\
A function \\(F\\) is absolutely continuous on an interval \\(\[a,b\]\\) if
\\[\forall \varepsilon > 0, \exists \delta > 0 \text{ such that }\\]
\\[\sum_{k = 1}^N(b_k - a_k) < \delta \implies \sum_{k = 1}^N\left|F(b_k) - F(a_k)\right| < \varepsilon\\]
Now this is a stronger version of continuity, than even uniform continuity (i.e. absolute continuity \\(\implies\\) uniform continuity). Finally, we have our much wanted result from this condition. In the proof of this result, we need very techinical tools like [the vitali covering lemma](https://en.wikipedia.org/wiki/Vitali_covering_lemma), however, I will not go into detail on this. Now our final result is as follows.\\
\\
**Theorem on the Integral of the Derivative:**\\
If \\(F\\) is an absolutely continuous function on \\(\[a,b\]\\), then \\(F^{\'}\\) exists almost everywhere and is integrable, and we have our much desired equality:
\\[F(x) - F(a) = \int_a^xF^{\'}(y)dy \text{  for all } a \leq x \leq b\\]

Conclusion
===
This sums up most of the content establishing the relationship between the integral (specifically the Lebesgue Integral) and differentiation. I did skim over some covering theorems, and other technical results like [the rising sun lemma](https://en.wikipedia.org/wiki/Rising_sun_lemma), [Dini numbers](https://en.wikipedia.org/wiki/Dini_derivative), and also [jump functions](https://math.stackexchange.com/questions/2910803/what-is-a-jump-function-and-which-measure-does-it-induce). A quick result to note from jump discontinuities, is that a bounded increasing function on an interval has at most a countable number of discontinuities (this is a pretty important result since it allows a one to one correspondence between discontinuities of a function and rational numbers). However, this does cover the key results that are used. For more technical details, check out the proof of some of the proposed results, as well as the links I included. 




