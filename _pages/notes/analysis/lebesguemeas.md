---
layout: archive
title: "The Lebesgue Measure"
permalink: /notes/analysis/lebmeasure/
author_profile: false
--- 
<hr style="border: 2px solid black;">
The Lebesgue Measure was introduced to generalize our intuition of *sizes*, to subsets of \\(\mathbb{R}^n\\) (Euclidean Space). Our intuition of sizes naturally comes from the known sizes of the basic geometric shapes, such as, circles, rectangles, cubes, etc. With this in mind, we try to "cover" these subsets of \\(\mathbb{R}^n\\) with these shapes, and calculate the *size* of the sets with the shapes that cover it. Here we note two important theorems: \
\
**Theorem 1:** Every open subset \\(\mathbb{O}\\) of \\(\mathbb{R}\\) can be written **uniquely** as a countable union of disjoint intervals.\
\
Extending this to \\(\mathbb{R}^n\\), we have the next theorem. \
\
**Theorem 2:** Every open subset \\(\mathbb{O}\\) of \\(\mathbb{R}^d\\) with \\(d \ge 1\\) can be written (not necessarily uniquely) as a countable union of almost disjoint closed cubes.\
\
**Note:** Almost disjoint means that these cubes are disjoint, except possibly, at the boundaries. In other words, their interiors are disjoint.

Size of Intervals and Basic Shapes
=====
To ensure no confusion, I will cover the basic sizes of our shapes. First, a (closed) rectangle R in \\(\mathbb{R}^d\\) is given by the product of intervals: R = \\([a_1, b_1]\times[a_2, b_2]\times.....\times[a_d, b_d]\\), where the size of each interval \\([a_j, b_j] \text{  is 
 } b_j - a_j\\). We can now say that the *size* of R, denoted \\(\left| R \right|=\\) \\[\sum_{j = 1}^{d}b_j - a_j\\]

Here we note two important lemmas: \
\
**Lemma 1:** If \\(R_1, R_2, R_3, ...... , R_N\\) are rectangles **and** \\[R \subset \bigcup_{j = 1}^NR_j\\] Then we can conclude
\\[\left| R \right| \leq \sum_{j =  1}^N\left| R_j\right|\\]
 

