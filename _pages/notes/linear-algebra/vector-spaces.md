---
layout: archive
title: "Vector Spaces"
permalink: /notes/linear-algebra/vector-spaces/
author_profile: false
--- 
<hr style="border: 2px solid black;">
First we will start with a non-empty set \\(V\\) of arbitrary elements. Without going into detail, a vector space has a list of axioms, however, we can check if a set is a vector space with two "tests". Before that, when we say that a set is "closed" under some operation, we mean that performing that operation on an element of the set results in something that is still in the set (and we can see that "closure" follows intuitively from the word). One more thing to note, is that a set being "over" some algebraic field \\(K\\), means that multiplication of elements of our set \\(V\\) by elements of the field \\(K\\) is defined (as in we have some way to assign something to the product) and when we say "scalar" multiplication, it refers to multiplication of an element of our set with an element of the field. The most typically used fields are the field of complex numbers \\(\mathbb{C}\\) and the field of real numbers \\(\mathbb{R}\\) (although you can define your own field, where a field is simply an algebraic commutative ring with a non-zero multiplicative inverse for every non-zero element). Now that we have that, we can see what makes certain sets vector fields. For simplicity, consider that \\(V\\) is over \\(\mathbb{R}\\), then \\(V\\) is a vector space if it is closed under scalar multiplication and element addition. Element addition is just the sum of any two elements of our set. Again, closure means that both of these operations produce something that is still in our set \\(V\\). Elements of a vector space are called vectors. We can have vector spaces of several things, like spaces of numbers, functions, sequences, etc.

## Subspaces
A subspace of a vector space, is a subset that satisfies the definition of a vector space. This definition might seem circular, however, a subspace is simply a vector space contained in another vector space. 

## Span
The span of a set of vectors \\(T\\), is simply the set of all linear combinations of vectors from \\(T\\). For example, let \\(T =\\){\\(v_1, v_2, v_3\\)}, then the span of this set, are all the elements of the form
\\[\sum_{n =1}^{3}cv_n\\]
Where \\(c\\) can be any constant. It follows directly that the sum of any element of \\(T\\) is in the span, and so is any scalar multiple of an element from \\(T\\). Therefore, the span of any set of vectors forms a vector space itself and is therefore a subspace of the vector space that \\(T\\) is in. But what if one of the elements of \\(T\\) is some linear combination of the other two? That is, what if (for simplicity) \\(v_1 = v_2 + v_3\\)? Then it would be redundant to include \\(v_1\\) when considering our linear combination, since it is already implicitly in it. In other words, the span of \\(T\\) is the same as the span of {\\(v_2, v_3\\)}. We then may ask, what is the smallest set of vectors that spans a certain vector space? 

## Linear Independence
A set of vectors are considered **linearly independent**, if 

## Basis of Vector Spaces
Without arguing the axiom of choice, we can say that **every** vector space has a basis. For a finite dimensional vector space, the number of basis elements is equal to the dimension of the space. A basis of a finite dimensional vector space is a set of vectors such that every vector in the vector space can be written as a linear combination (which is just a finite sum) of vectors from the basis and no element of the basis can be written as a linear combination of the other elements in the basis. In the infinite dimensional case, we might have to consider infinite sums which then require the concept of convergence which is a topological property, I cover topological vector spaces in my functional analysis section of notes. 
