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
However, we know the size of the interval \\((0,3) = 3 - 0 = 3\\).
And it's apparent to see \\[3 \neq \infty\\]
So we can conclude that
\\[E = \bigcup_{j = 1}^{\infty}(0, 3-\frac{1}{j})\\]
Does **NOT** imply
\\[m_{\ast}(E) = \sum_{j = 1}^{\infty}3 - \frac{1}{j} - 0\\]
The strongest thing we can say is that
\\[m_{\ast}(E) \leq \sum_{j = 1}^{\infty}m_{\ast}(E_j)\\]
However, there are restrictions that we can apply to sets that allows us to have countable additivity. One more thing to note, is that even in contrast to the example I gave above, if I used a countable union of disjoint sets, we still cannot ensure countable additivity on all subsets of \\(\mathbb{R}^d\\) because of some highly pathalogical sets. Below are two examples where we have better additivity.\
\
**Observation 3:** If \\[E = \bigcup_{j = 1}^{\infty}Q_j\\] Where each \\(Q_j\\) is an almost disjoint cube, then 
\\[m_{\ast}(E) = \sum_{j = 1}^{\infty}\left|Q_j\right|\\] \
\
**Observation 4:** If \\[E = E_1 \cup E_2\\] Where \\(d(E_1, E_2) > 0\\) then \\[m_{\ast}(E) = m_{\ast}(E_1) + m_{\ast}(E_2)\\]

Measurability of Sets
=====
With these observations in mind, we will introduce the definition of *measurability*. This definition is used to limit the exterior measure, (currently defined on all subsets of a set \\(\mathbb{R}^d\\)) to a certain collection of subsets of \\(\mathbb{R}^d\\), which form a \\(\sigma\\)-algebra. Additionally, the exterior measure \\(m_{\ast}\\) will be countably additive on this \\(\sigma\\)-algebra, which we call the **Lebesgue Measurable Sets** of \\(\mathbb{R}^d\\). The definition is as follows:
\\[\text{A set } \mathbb{E} \text{, is measurable if } \forall \epsilon > 0, \exists \text{ an open set } \mathbb{O} \text{ with } \mathbb{E} \subset \mathbb{O} \text{ such that } m_{\ast}(\mathbb{O} - \mathbb{E}) \leq \epsilon\\] 
\\[\text{Where } \mathbb{O}-\mathbb{E} \text{ is defined as the set difference operation: } \mathbb{O}-\mathbb{E} = \mathbb{O}\cap\mathbb{E}^c\\]
Without much justification, I will list some basic measurable sets.
- Closed sets
- Open sets
- Null sets (sets with an exterior measure of 0)
- Subsets of Null sets

\
**Note:** To avoid any confusion, an open set is defined below:
\\[\text{A set } O \text{ is open, if } \forall x \in O, \exists B_r(x) \text{ such that } B_r(x) \subseteq O\\]
In English, this means that for any point in \\(O\\) there exists a ball of radius \\(r\\), centered at \\(x\\), such that the ball is entirely contained within \\(O\\). With this defined, a closed set is simply a set whose complement is an open set. \
Since we know the sets listed above are elements of the **Lebesgue Measurable Sets** (a \\(\sigma\\)-algebra), then we can also conclude that a countable union or intersection of these sets are also measurable. Now to recall some set theory, we know a countable union of open sets is an open set, and a countable intersection of closed sets is a closed set. However, we cannot say for certain whether or not a countable intersection of open sets is open, or if a countable union of closed sets is closed. This leads to the definition of two types of measurable sets below:
\\[\text{A } G_{\delta} \text{ is a countable intersection of open sets}\\]
\\[\text{An } F_{\sigma} \text{ is a countable union of closed sets}\\]
These sets are important, because every set in the **Lebesgue Measurable Sets** is sandwhiched between an \\(F_{\sigma} \text{ and a } G_{\delta}\\). Meaning every measurable set will have the same measure as some \\(F_{\sigma} \text{ and some } G_{\delta}\\)
We also write \\(m_{\ast}(E) = m(E)\\) when \\(E\\) is a **Lebesgue Measurable Set**, since the exterior measure on this \\(\sigma\\)-algebra, is a proper measure. 
Finally, we have countable additivity as defined below:
\\[\text{If }E_1, E_2, ..... ,E_n \text{ are disjoint measurable sets, and } E = \bigcup_{n = 1}^{\infty}E_n \text{  then,  } m(E) = \sum_{n = 1}^{\infty}m(E_n)\\]
The last thing to consider with measurable sets is how limits interact with sequences of sets and their measure.
\\
$$
\text{If } E_1, E_2, ..... , E_n \text{ are measurable sets, and }  \{E_n\} \rightarrow E \text{ then } \lim_{n \rightarrow \infty}m(E_n) = m(E)
$$
\\
**Note:** If the sets are shrinking to \\(E\\), then eventually one of the sets \\(E_j\\) must have \\(m(E_j) < \infty\\), otherwise we obviously can't have the statement above.

Measurability of Functions
====
After defining what a measurable set is, it is natural to consider what a measurable function might look like. In fact, we need to consider these measurable functions to further develop integration theory.

<div style="text-align: center;">
$$
\begin{align*}
&\text{A function } f \text{ (defined on a measurable subset } E \subset \mathbb{R}^d \text{) is measurable, if }\\
&\forall a \in \mathbb{R} \text{, the set } f^{-1}([-\infty, a]) = \{x \in E: f(x) < a\} \text{ is itself measurable}
\end{align*}
$$
</div>

Now that we have a notion of measurable functions, we will begin to outline some notable measurable functions. First, the building block of integration theory, the characteristic function defined on a set \\(E\\): 
<div style="text-align: center;">
$$
\chi_E(x) = 
\begin{cases}
1: \text{ if } x \in E \\
0: \text{ if } x \notin E
\end{cases} 
$$
</div>
In other words, this function acts as a sort of switch, that tells us if some number is in the set \\(E\\). We can now build the simple function, which in the future essentially let us approximate any *measurable* function by considering the limit of simple functions. I will go into more detail about that later. The simple function is essentially a generalization of the step function used in Riemann Integration, and allows us to consider a wider range of functions. A simple function \\(\text{ }f \text{ }\\) is defined as the finite sum below: 
\\[f = \sum_{k = 1}^{M}a_k\chi_{E_k}\\]
Where each \\(E_k\\) is measurable and has finite measure, and each \\(a_k\\) is simply a constant. The most important properties of **measurable** functions are listed below:
<div style="text-align: center;">
$$
\begin{align*}
&\text{(1): If } \{f_n\}_{n=1}^{\infty} \text{ is a sequence of measurable functions and } \lim_{n\rightarrow\infty}f_n(x) = f(x), \\
&\text{then f is measurable} \\
&\text{(2): If } f \text{ and } g \text{ are measurable and finite valued, then } f+g \text{ and } fg \text{ are measurable} \\
&\text{(3): If } f \text{ is measurable, and } f(x) = g(x) \text{ for } a.e x, \text{ then } g \text{ is measurable}
\end{align*}
$$
</div>

<div style="text-align: center;">
$$
\begin{align*}
&\text{The notation } a.e x, \text{means "almost everywhere x". Which is defined as, }\\
&f(x) = g(x) a.e x \text{ if the set } \{x: f(x) \neq g(x)\} \text{has measure 0}
\end{align*}
$$
</div>
What this means in English, is that the set of x-values, where \\(f(x) \neq g(x)\\) has measure 0.

