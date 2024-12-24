---
layout: archive
title: "Sigma Algebras"
permalink: /notes/analysis/sigmaAlgebras/
author_profile: false
--- 
<hr style="border: 2px solid black;">
A \\(\sigma\\)-Algebra \\(M\\), of **subsets** of a set \\(X\\), is a collection of subsets of \\(X\\) that satisfies the following properties.
$$
\begin{align}
\\
(1)&\text{ M contains the empty set: } \emptyset \in \text{M} \\
\\
(2)&\text{ Closure under complementation: If } B \in \text{M, then } B^c \in \text{M} \\
\\
(3)&\smash{\text{ Closure under countable union: If } B_1, B_2, ..... , B_n \in \text{M, then } \bigcup_{n = 1}^{\infty}B_n \in \text{M}} \\
\end{align}
$$

There are two things to consider with this definition. The first is that since \\(\emptyset \in\\) M, and M is closed under complementation \\(\implies \emptyset^c \in M \text{ and } \emptyset^c = X \implies X \in M\\). \
The second concerns the choice of countable union. For some set \\(E \in M\\), where 
\\[E = \bigcup_{n = 1}^{\infty}E_n\\]  and where each \\(E_n\\) is some element of \\(M\\). Then we know \\(E \in M \implies E^c \in M\\), so if we replace \\(E\\) by the union of sets that it's comprised of, we get
\\[E = \bigcup_{n = 1}^{\infty}E_n \text{ then } E^c = (\bigcup_{n = 1}^{\infty}E_n)^c\\]
By De Morgan's Law \\[(\bigcup_{n = 1}^{\infty}E_n)^c = \bigcap_{n = 1}^{\infty}E_n^c\\]
Now, we know each \\(E_n \in M \implies E_n^c \in M\\). So in our above expression, we have the countable intersection of elements in \\(M\\). Finally, know that we simply rewrote our original set \\(E^c\\), so \\[E^c = (\bigcup_{n = 1}^{\infty}E_n)^c = \bigcap_{n = 1}^{\infty}E_n^c\\] 
Implies, \\[E^c =\bigcap_{n = 1}^{\infty}E_n^c\\] And we know \\(E^c \in M\\) since \\(E \in M\\), finally this implies \\[\bigcap_{n = 1}^{\infty}E_n^c \in M\\] Where each \\(E_n^c \in M\\). Essentially, combining the closure under complementation and De Morgan's Law with the closure under countable union, we can conclude that \\(M\\) is **also** closed under countable intersection. Therefore, we can actually choose whether to use countable union or countable intersection in our definition, since they both end up implying the other (when coupled with complementation). 

Why Are \\(\sigma\\)-Algebras Important?
====
At least in the context of measure theory, for an exterior measure defined on a set \\(X\\), we know that the exterior measure assigns a measure to **every** subset of \\(X\\) (i.e. the power set of \\(X: 2^X\\)), and we know that the exterior measure \\(m_{\ast}\\) is only countably sub-additive. In other words, the best statement we can make about the measure of sets that are equal to countably-infinite unions of other sets is
\\[\text{If } E = \bigcup_{j = 1}^{\infty}E_n \text{   then   } m_{\ast}(E) \leq \sum_{j = 1}^{\infty}m_{\ast}(E_n)\\]
However, if we limit the exterior measure to an appropriate \\(\sigma\\)-algebra of \\(X\\), then we actually get countable additivity. In other words, if \\(E\\) is an element of an appropriate \\(\sigma\\)-algebra of \\(X\\) then we can say the following:
\\[\text{If } E = \bigcup_{j = 1}^{\infty}E_n \text{   then   } m_{\ast}(E) = \sum_{j = 1}^{\infty}m_{\ast}(E_n)\\]
By "an appropriate \\(\sigma\\)-algebra", I mean one that gives us countable additivity. Not all \\(\sigma\\)-algebras of a set \\(X\\) provide an exterior measure with countable additivity. For example, the power set \\(2^X\\) is a \\(\sigma\\)-algebra of \\(X\\), yet as we know, does not allow for countable additivity. So we must find some criteria that carves out the sets that prevent us from having countable additivity. With the **Lebsgue Exterior Measure**, we use the definition of *measurability* to form an appropriate \\(\sigma\\)-algebra. The definition is as follows,
\\[\text{A set } \mathbb{E} \text{, is measurable if } \forall \epsilon > 0, \exists \text{ an open set } \mathbb{O} \text{ with } \mathbb{E} \subset \mathbb{O} \text{ such that } m_{\ast}(\mathbb{O} - \mathbb{E}) \leq \epsilon\\]
\\[\text{Where } \mathbb{O}-\mathbb{E} \text{ is defined as the set difference operation: } \mathbb{O}-\mathbb{E} = \mathbb{O}\cap\mathbb{E}^c\\]
Therefore, if we consider all subsets of a set \\(X\\) that satisfy the above condition, we produce a \\(\sigma\\)-algebra. In particular, this \\(\sigma\\)-algebra gives us countable additivity. 

More generally though, \\(\sigma\\)-algebras provide us with structure to make conclusions about the behavior of certain set operations and how certain sets might interact with each other. 
