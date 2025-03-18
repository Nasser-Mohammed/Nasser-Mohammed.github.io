---
layout: archive
title: "Required Algebra"
permalink: /notes/functional-analysis/TVS-algebra/
author_profile: false
--- 
<hr style="border: 2px solid black;">
Since the theory of Functional Analysis is a reconciliation of topological and vector space characteristics and compatibility, we
naturally necessitate some level of "algebraic" theory. The intent of this page is to go over some of the algebraic concepts to 
allow for an ease of understanding when going through the other content.

## Functionals
Depending on the context this might take slightly different definitions. In calculus, functionals are functions of functions. In other words, they take in a function and output a value. We can think of a definite integral as a sort of functional in this regard. Consider
\\[\phi(f) = \int_0^1f(x)dx\\]
This would be a functional in the standard calculus way.\\
\\
However, in linear algebra, functionals are more generally defined as maps from a vector space to the field the vector space is over. Then we would consider a linear functional as linear map from a vector space to the field the vector space is over. In other words, they are ways to quantify vectors in a vector space.

## Algebraic Dual Space
For a vector space \\(V\\) over the field \\(\mathbb{C}\\), the algebraic dual, denoted \\(V*\\), is the set of all linear functionals. More formally,
<div align="center">
$$
V^* = \{ \varphi : V \to \mathbb{C} \mid \varphi \text{ is linear} \}
$$
</div>


## Natural Injection
Consider, \\
\\
$$f:E \to F$$\\
\\
Then the natural injection is the injective map \\(i\\), such that\
\\
$$i: im(E) \to F$$\\
\\
In other words, since \\(f\\) might not take every element of \\(E\\) to \\(F\\), we then define the natural injection from that image to the full set \\(F\\). This allows us to embed the algebraic structure of a smaller set into a larger set.

## Natural Projection
