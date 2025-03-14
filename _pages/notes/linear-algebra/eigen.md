---
layout: archive
title: "Eigenvalues and Eigenvectors"
permalink: /notes/linear-algebra/eigen/
author_profile: false
--- 
<hr style="border: 2px solid black;">
Eigenvalues and Eigenvectors show up everywhere in math (and pretty much any quantitative field) and are not only limited to the study of linear algebra. Therefore, an inuitive and rigorous understanding of these concepts is extremely beneficial and a lot of the times necessary. First, it is necessary to think in terms of vectors and linear transformations. We can have vectors of pretty much anything, though it might help to think of normal arrow ended vectors. Vectors are simply elements of a vector space (kind of circular reasoning but a vector space is a set with a defined sort of structure, you can get more detailed notes I have here: [Vector Spaces](vector-spaces.md)). A matrix is simply a defined transformation of a vector, to another vector. This vector could be in a higher or lower dimensional space, so we consider square matrices of dimension equal to the dimension of the vector space we are in. Naturally, we might then ask, what did the matrix actually do to our vector? For simplicity we want to consider "good" matrices, i.e. one's that are non-singular and therefore all determinents are non-zero 0.

## Motivation
One part of the previous question, is to consider if our vector was stretched or compressed. Intuitively, the vector was stretched if the norm of the new transformed vector is greater than the norm of the original vector and compressed otherwise (assume non-zero norms). While this is true, this does not generalize to an arbitrary vector. We want to consider properties of the matrix, and therefore we need a more general notion of what a matrix might do to an arbitrary vector (and as a result, to the space itself). A matrix can transform different vectors in different ways, so the aforementioned method wouldn't tell us something intrinsic about the matrix, rather just how the matrix interacts with that specific vector.

## Eigenvectors
Let's assume that we are dealing with a "good" matrix \\(A\\), as defined in the first paragraph. Let us also suppose that there was possibly a vector in our space, that after the transformation via our matrix, still lies on the same "line" as before. In a more abstract sense, this means that the span of the vector before transformation, is the same as after the transformation. For more intuition, the matrix only scaled this vector. Let's denote this vector as \\(\overbar{v}\\), then since we know that it was only scaled, we can say that
\\[A\overbar{v} = \lambda \overbar{v}\\]
Where \\(\lambda\\) is simply an element of our field (a scalar value, usually complex or real). In other words, the equation above, corresponds to the idea that the matrix multiplied to our vector has the same effect as multiplying the vector by a scalar, essentially just scaling it. We note that the identity matrix \\(I\\), which is simply just the matrix with 1's along the diagonal and 0's else where, can be multiplied to \\(\overbar{v}\\) without altering it's values. It is the matrix version of the value \\(1\\). Doing so gives us
\\[A\overbar{v} = \lambda I \overbar{v}\\]
Reearranging this equation yields, 
\\[A\overbar{v} - \lambda I \overbar{v} = 0\\]
Pulling out a \\(\overbar{v}\\), gives
\\[(A - \lambda I) \overbar{v} = 0\\]
Now, \\(\overbar{v}\\) obviously solves this, but we are interested in non-zero solutions. So we are assuming \\(\overbar{v} \neq \overbar{0}\\).  As a quick note, \\(\overbar{v}\\) is an eigenvector of the matrix \\(A\\), but there is still more work to do. The only time that the product of a matrix and a non-zero vector is 0 (and here \\(\overbar{v} \neq \overbar{0}\\)), is precisely when the determinent of the matrix is 0. Recall, that the determinent essentially tells us the "volume" created by the shape of the new basis vectors in the dimension of the transformation. If this is 0, then the matrix squished space down into a lower dimension, resulting in a volume of 0 with respect to the current space. That is, the new lower dimensional space takes up 0 area in our current dimension. Therefore, we can deduce that 
\\[\det (A-\lambda I) = 0\\]
Where the matrix \\(A-\lambda I\\) looks like,
