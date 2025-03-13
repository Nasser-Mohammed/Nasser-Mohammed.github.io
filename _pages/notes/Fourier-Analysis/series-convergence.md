---
layout: archive
title: "Cauchy Product of Two Series Converges to Product of Sums"
permalink: /notes/fourier-analysis/cauchy-product/
author_profile: false
--- 
<hr style="border: 2px solid black;">
There are various tests/comparisons for determining if a series converges or not. Knowing the main ones is crucial for the study of Fourier Analysis, so I will cover the most used ones.

## Comparison Test
If we have that,
\\[0 \leq |a_n| \leq b_n \ \ \forall n \text{ sufficiently large and } \sum b_n \ \text{ converges, then } \implies \sum a_n \ \text{converges}\\]

## Limit Comparison Test
For two series
\\[\sum a_n, \ \ \sum b_n\\]
If
\\[\lim_{n \to \infty} \frac{|a_n|}{b_n} = c,  \ \ \ 0 < c < \infty\\]
Then both series either converge or diverge together. What this means, is that if we know the behavior of one of the series, we can conclude the behavior of the other by this limit comparison test.

## Ratio Test
\\[\lim \sup_{n \to \infty} |\frac{a_{n+1}}{a_n}| < 1 \implies \sum a_n \ \text{ converges absolutely}\\]

## Cauchy Criterion
A series
\\[\sum a_n\\] 
Converges if and only if 
\\[\forall \epsilon > 0, \ \exists N \in \mathbb{N} \ \text{ such that } \ \forall m,n \geq N\\]
\\[\implies |\sum_{k = m}^{n}a_k| < \epsilon\\]
What this says, is that the tail end of a convergent series will be arbitrarily small.

## Weierstrass M-Test (Uniform Convergence)
If \\(|f_n(x)| \leq M_n \ \forall x\\) and \\(\sum M_n\\) converges, then
\\[\sum f_n(x) \ \ \text{converges uniformly}\\]
Furthermore, this convergence is absolute.
