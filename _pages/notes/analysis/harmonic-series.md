---
layout: archive
title: "Divergence of the Harmonic Series"
permalink: /notes/analysis/harmonic-series/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\[\sum_{n = 1}^{\infty} \frac{1}{n}\\]
The harmonic series is one of the most important series in analysis. It shows that following our intuition alone may lead us to false conclusions. However, once we establish the proof of
its divergence, it will be much more apparent where our intuition went wrong.

First a Reminder of Sequences
===
If you are familiar with sequences, the first sequence you usually study is the sequence 
\\[\{x_n\} = \frac{1}{n}\\]
We know this sequence converges (in limit as \\(n \to \infty\\)) by an \\(\varepsilon\\)-\\(\delta\\) proof. To quickly demonstrate this, we say that a sequence of real numbers converge to a limit \\(L\\), if

\\[\forall \varepsilon > 0 \text{, } \exists N \in \mathbb{N} \text{ such that } \forall n > N\\]
\\[\left|x_n - L \right| < \varepsilon\\]
In our example, our claim would be that if
\\[\{x_n\} = \frac{1}{n}\\]
then
\\[\frac{1}{n} \rightarrow 0\\] 
or equivalently
\\[\lim_{n \to \infty} \frac{1}{n} = 0\\]
Now we have to prove this. So the proof would be to find \\(n\\) as a function of \\(\varepsilon\\), doing this we start with:
\\[\left|\frac{1}{n} - L\right| < \varepsilon\\]
Where \\(L = 0\\), so our inequality reduces to
\\[\left|\frac{1}{n}\right| < \varepsilon\\]
We know that since \\(n \in \mathbb{N}\\) that \\(n \ge 1, \forall n\\) and this implies that \\(\frac{1}{n} \ge 0, \forall n\\). So we can drop the absolute values in our inequality around \\(\frac{1}{n}\\) since we know it's always positive. Doing that leaves:
\\[\frac{1}{n} < \varepsilon\\]
We come to the conclusion taht 
\\[\frac{1}{\varepsilon} < n\\]
In other words, for any \\(\varepsilon > 0\\), we can find a corresponding natural number \\(n\\), such that any point in our sequence past the index \\(n\\) will be less than a distance of \\(\varepsilon\\) away from our limit point (in this scenario 0). If you notice, as \\(\varepsilon\\) gets smaller and smaller, \\(\frac{1}{\varepsilon}\\) gets larger and larger, this forces \\(n\\) to be a larger and larger naturally number since \\(\frac{1}{\varepsilon} < n\\). Now this should make sense to you, after all, we would need to go further and further along the sequence to get within a smaller and smaller \\(\varepsilon\\) distance away from the limit point.

Why is the Harmonic Series Counterintuitive?
===
Well series are simply a sum of a sequence. In other words, instead of considering the behavior of the points \\(\frac{1}{n}\\) as \\(n \to \infty}, we consider what happens if we add up each of these terms. Now, since we know that 
\\[\lim_{n \to \infty} \frac{1}{n} = 0\\]
It would be intuitive to assume that eventually, we would be adding up numbers that are so small that they don't really add anything. Since we know these points eventually get as close as possible to 0, then adding up these tiny numbers would end up not affecting the sum. However this **sum** goes to \\(\infty\\), in other words, it **diverges**. This will be an informal proof, but generally, if a sum converges to a value, then at some index, the sum of every point past that index is arbitrarily small. Like in our sequence example, past a certain \\(n\\), our points were as close to 0 as we wanted. If we wanted closer and closer points, we just consider a smaller and smaller epsilon value. Now let's look at the series:
\\[\sum_{n = 1}^{\infty} \frac{1}{n}\\]
Consider the first term, \\(n = 1\\), we get the value \\(\frac{1}{1} = 1\\), now we know if we kept adding 1 an infinite number of times, that this value would diverge. In other words, it would not converge to a number, but rather grow without bound. Our goal is to show that we can partition the series to keep giving us the value of 1, and therefore an infinite sum of 1's would diverge (grow to infinity). Now let's consider the next 3 terms \\(n = 2, n = 3, n = 4\\):
\\[\frac{1}{2} + \frac{1}{3} + \frac{1}{4} = \frac{13}{12}\\]
We know that \\(\frac{13}{12} > 1\\) so adding this value will maintain the divergence we are looking for. Now we consider the next 8 terms, from \\(n = 5\\) to \\(n = 12\\):
\\[\frac{1}{5} + \frac{1}{6} + \frac{1}{7} + \frac{1}{8} + \frac{1}{9} + \frac{1}{10} + \frac{1}{11} + \frac{1}{12} \approx 1\\]



