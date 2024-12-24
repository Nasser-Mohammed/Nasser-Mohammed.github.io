---
layout: archive
title: "Sigma Algebras"
permalink: /notes/analysis/sigmaAlgebras/
author_profile: false
--- 
<hr style="border: 2px solid black;">
A \\(\sigma\\)-Algebra M, of **subsets** of a set \\(X\\), is a collection of subsets of \\(X\\) that satisfies the following properties.

\\[(1)\text{M contains the empty set: } \emptyset \in \text{M} \\]
\\[(2)\text{Closure under complementation: If } B \in \text{M, then } B^c \in \text{M} \\]
\\[(3)\smash{\text{Closure under countable union: If } B_1, B_2, ..... , B_n \in \text{M, then } \bigcup_{n = 1}^{\infty}B_n \in \text{M}\\]

There are two things to consider with this defintion. The first is that since \\{\emptyset \in\\) M, and M is closed under complementation \\(\implies \emptyset^c \in \\) M and \\(\emptyset^c = X \implies X \in M\\). \
The second concerns the choice of countable union, for some set
\\[E = \bigcup_{n = 1}^{\infty}E_n\\] Where each \\(E_n\\) is some element of M. Then we know \\(E \in M \implies E^c \in M\\), so if we replace \\(E\\) by the union of sets that it's comprised of, we get
\\[E = \bigcup_{n = 1}{^\infty}E_n \{ then } E^c = (\bigcup_{n = 1}{^\infty}E_n)^c\\]
By De Morgan's Law \\[(\bicup_{n = 1}{^\infty}E_n)^c) = \bigcap_{n = 1}{\infty}E_n^c\\]
Now, we know each \\(E_n \in M \implies E_n^c \in M\\) So in our above expression, we have the countable intersection of elements in M. Finally, know that we simply rewrote our original set \\(E^c\\), so \\[E^c = \bigcap_{n = 1}{\infty}E_n^c\\] And we know \\(E^c \in M\\) since \\(E \in M\\)
