---
layout: archive
title: "Important Topological Vector Spaces"
permalink: /notes/functional-analysis/various-spaces/
author_profile: false
--- 
<hr style="border: 2px solid black;">
There are several different characterizations of topological vector spaces (TVS) with various levels of importance (in a general sense). I will describe the most notable ones, and their relation to other TVS. 

## Topological Vector Spaces 
We begin with first defining what a topological vector space is, which will set the outline for the most general form these spaces can take. A vector space \\(E\\) over \\(\mathbb{C}\\) becomes a topological vector space when it is equipped with a topology that is compatible with
the linear structure of \\(E\\). A topology being compatible with the linear structure of a vector space means that vector addition and scalar multiplication are both continuous mappings. That is
\\[A_v: E \times E \to E, \ \ \ (x,y) \to x+y\\]
\\[M_s: \mathbb{C}\times E \to E \ \ \ (\lambda, x) \to \lambda x\\]
Are both continuous mappings. The topologoy of a TVS is always translationally invariant, which means the space looks the same anywhere with respect to its topology. Because of this, we can usually consider studying only the neighborhoods of the origin.

## Hausdorff TVS
A TVS is Hausdorff (sometimes called \\(T_2\\)) if for any two points, there exists neighborhoods of both points such that their intersection is empty. More technically, a TVS \\(E\\) is Hausdorff if 
\\[\forall x,y \in E, \ \ \exists U,V \subset E \  \text{ with } \ x \in U, \ y \in V \ \text{ such that } U \cap V = \emptyset\\]
Again, in English this means that every point has some form of separation between any other point. Hausdorff spaces are pretty general and therefore we need more restrictions to make stronger conclusions. Every important TVS that we will later see will be a subset of Hausdorff TV spaces. One important result we do get from Hausdorff space is the uniqueness of the limit. In other words, sequences converge to 1 limit. 

## Compact TVS
A Hausdorff TVS is said to be compact if every open cover has a finite subcover. An open cover of a set \\(A\\) is a collection of subsets of \\(A\\), such that \\(A\\) is the subset of the union of all the subsets in the collection. In other words, we cover our set with subsets of itself. Then a finite subcover is simply an open cover that is finite in length and therefore we can cover the set with a finite number of subsets. Closed subsets of a compact space are compact.

## Locally Convex TVS
A set is considered convex if it contains the line between any two of its elements. A TVS \\(E\\) is called locally convex if there is a basis of neighborhoods of \\(E\\) consisting of all convex sets. A more formal definition of convexity is as follows: A set \\(A\\) is convex if
\\[\forall x,y \in A, \ \ \  \alpha x + \beta y \in A \ \ \text{ with } \alpha, \beta \geq 0, \ \ \alpha + \beta = 1\\]
It's also important to note the concept of a convex hull. The convex hull of a set \\(F\\) (usually denoted \\(\Gamma (F)\\)) is the set of all finite linear combinations of elements of \\(F\\) with nonnegative coefficients who sum up to 1. More technically,\\
\\
\\(\Gamma(F) = \\) {\\(\alpha x + \beta y \ | \ x,y \in F, \ \\ \alpha, \beta \geq 0, \ \alpha + \beta = 1\\)}\\
\\
Therefore, the convex hull is the smallest convex set containing \\(F\\) and we can also see that a set is convex if it's equal to its convex hull.

## Metrizable TVS
A TVS \\(E\\) is metrizable if there is a countable basis of neighborhoods of \\(0\\). This follows from the fact that a topology on \\(E\\) can be defined by a metric if and only if \\(E\\) is Hausdorff and has a countable basis of neighborhoods of \\(0\\). 

## Baire Space
A complete metrizable TVS

## Frech\'et Space
Also known as an \\(F\\)-space, this is a metrizable, complete, locally convex TVS.

## Normed Space
A space whose topology can be defined by a norm. 

## Banach Space
Complete normed space

## Complex Hausdorff pre-Hilbert Space
A vector space with a positive definite sesquilinear form.

## Hilbert Space
A complete complex Hausdorff pre-Hilbert space.

## LF Space
This has a complicated rigorous definition, however, it is more or less some sort of limit of a union of Frech\'et spaces. Any LF space is complete. 
