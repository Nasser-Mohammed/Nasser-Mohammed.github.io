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

Why is the Harmonic Series Counterintuitive?
===
If you are familiar with sequences, the first sequence you usually study is the sequence 
\\[\{x_n\} = \frac{1}{n}\\]
We know this sequence converges by an \\(\varepsilon\\)-\\(\delta\\) proof. To quickly demonstrate this, we say that a sequence of real numbers converge to a limit \\(L\\), if
<div style="text-align: center;">
$$
\forall \varepsilon > 0 \text{, } \exists N \in \mathbb{N} \text{ such that } \forall n > N \newline
\left|x_n - L \right| < \varepsilon
$$
</div>
In our example 
\\[\{x_n\} = \frac{1}{n}\\]
So the proof would be to find \\(n\\) as a function of \\(\varepsilon\\)

