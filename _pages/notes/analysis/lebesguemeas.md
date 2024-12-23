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
**Theorem 2:** Every open subset \\(\mathbb{O}\\) of \\(\mathbb{R}^d\\) with \\(d \ge 1\\), can be written (not necessarily uniquely) as a countable union of almost disjoint closed cubes.\
\
**Note:** Almost disjoint means that these cubes are disjoint, except possibly, at the boundaries. In other words, their interiors are disjoint.

Size of Intervals and Basic Shapes
=====
To ensure no confusion, I will cover the basic sizes of our shapes. First, a (closed) rectangle R in \\(\mathbb{R}^d\\) is given by the product of intervals: R = \\([a_1, b_1]\times[a_2, b_2]\times.....\times[a_d, b_d]\\), where the size of each interval \\([a_j, b_j] \text{  is 
 } b_j - a_j\\). We can now say that the *size* of R, denoted \\(\left| R \right|=\\) \\[\sum_{j = 1}^{d}b_j - a_j\\]

Here we note an important lemma: \
\
**Lemma 1:** If \\(R_1, R_2, R_3, ...... , R_N\\) are rectangles **and** \\[R \subset \bigcup_{j = 1}^NR_j\\] Then we can conclude
\\[\left| R \right| \leq \sum_{j =  1}^N\left| R_j\right|\\]

The Exterior Measure
=
As the name suggests, the exterior measure involves assigning a measure (size) to **any** subset \\(E\\) of \\(\mathbb{R}^d\\), by covering \\(E\\) with shapes from the outside. That is, we consider the smallest possible shape that \\(E\\) is contained in. To put this more formally, the exterior measure, denoted \\(m_{\ast}\\), assigns **any** subset \\(E\\) of \\(\mathbb{R}^d\\) a measure by the below equation
\\[m_{\ast}(E) = inf\sum_{j = 1}^{\infty}\left| Q_j \right|\\]
\\(inf\\) is simply the infimum, taken over all countable coverings of E, where \\[E \subset \bigcup_{j = 1}^{\infty}Q_j\\]
**Note:** \\(Q_j\\) is simply a closed cube \
\
The exterior measure can be any value from 0 to \\(\infty\\) including both 0 and \\(\infty\\), i.e. \\(0 \leq m_{\ast}(E) \leq \infty\\)
Once we realize that single points and the empty set \\(\emptyset\\), both have an exterior measure of 0, we can start to make some important obversations. I will not go into detail for each one, but the main two are: \
\
**Monotonicity:** If \\(E_1 \subset E_2 \text{ then } m_{\ast}(E_1) \leq m_{\ast}(E_2)\\) \
\
**Countable Sub-Additivity:** If \\[E = \bigcup_{j = 1}^{\infty}E_j\\] Then \\[m_{\ast}(E) \leq \sum_{j = 1}^{\infty}m_{\ast}(E_j)\\]

The second obvservation, countable sub-additivity, initially did not make sense to me. However, we have to consider that we are approximating our sets from the outside, therefore, it is possible for our set to be written as a countable union of shrinking/growing subsets, that don't add any "size" to our set. To put it more clearly, assume we have a set \\(E = [0,3]\\), a simple interval. However, we could also say that \\[E = \bigcup_{j = 1}^{\infty}(0, 3-\frac{1}{j})\\] To further analyze this, let's consider each \\(j\\) and the interval it produces: \
\
\\[j = 1: (0, 2)\\]
\\[j = 2: (0, 2\frac{1}{2})\\]
\\[j = 3: (0, 2\frac{2}{3})\\]
\\[.\\]
\\[.\\]
\\[.\\]
\\[j = 1000: (0, 2.999)\\]
We can see that as \\(j \rightarrow \infty\\), our intervals will \\(\rightarrow (0, 3)\\). However, if we try to consider a finite number of unions, we will not get the full interval \\((0, 3)\\). So then we must have
\\[E = \bigcup_{j = 1}^{\infty}(0, 3-\frac{1}{j})\\]
However, \\[m_{\ast}(E) \neq \sum_{j = 1}^{\infty}3 - \frac{1}{j} - 0\\]
If we consider the sum, it simplifies to \\[\sum_{j = 1}^{\infty}3 - \frac{1}{j}\\]
And since \\(\frac{1}{j} \rightarrow 0\\), it is obvious that \
\\[\sum_{j = 1}^{\infty}3 - \frac{1}{j}\ \rightarrow \infty\\]
However, we know the size of the interval \\((0,3) = 3 - 0 = 3\\)
And it's apparent to see \\[3 \neq \infty\\]
So we can conclude that
\\[E = \bigcup_{j = 1}^{\infty}(0, 3-\frac{1}{j})\\]
Does **NOT** imply
\\[m_{\ast}(E) \eq \sum_{j = 1}^{\infty}3 - \frac{1}{j} - 0\\]
The strongest thing we can say is that
[m_{\ast}(E) \leq \sum_{j = 1}^{\infty}m_{\ast}(E_j)\\]
 

