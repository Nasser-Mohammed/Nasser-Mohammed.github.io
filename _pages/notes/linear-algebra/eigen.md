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

## Eigenvectors and Eigenvalues
Let's assume that we are dealing with a "good" matrix \\(A\\), as defined in the first paragraph. Let us also suppose that there was possibly a vector in our space, that after the transformation via our matrix, still lies on the same "line" as before. In a more abstract sense, this means that the span of the vector before transformation, is the same as after the transformation. For more intuition, the matrix only scaled this vector. Let's denote this vector as \\(\overline{v}\\), then since we know that it was only scaled, we can say that
\\[A\overline{v} = \lambda \overline{v}\\]
Where \\(\lambda\\) is simply an element of our field (a scalar value, usually complex or real). In other words, the equation above, corresponds to the idea that the matrix multiplied to our vector has the same effect as multiplying the vector by a scalar, essentially just scaling it. We note that the identity matrix \\(I\\), which is simply just the matrix with 1's along the diagonal and 0's else where, can be multiplied to \\(\overline{v}\\) without altering it's values. It is the matrix version of the value \\(1\\). Doing so gives us
\\[A\overline{v} = \lambda I \overline{v}\\]
Reearranging this equation yields, 
\\[A\overline{v} - \lambda I \overline{v} = 0\\]
Pulling out a \\(\overline{v}\\), gives
\\[(A - \lambda I) \overline{v} = 0\\]
Now, \\(\overline{v}\\) obviously solves this, but we are interested in non-zero solutions. So we are assuming \\(\overline{v} \neq \overline{0}\\).  As a quick note, \\(\overline{v}\\) is an eigenvector of the matrix \\(A\\), but there is still more work to do. The only time that the product of a matrix and a non-zero vector is 0 (and here \\(\overline{v} \neq \overline{0}\\)), is precisely when the determinent of the matrix is 0. Recall, that the determinent essentially tells us the "volume" created by the shape of the new basis vectors in the dimension of the transformation. If this is 0, then the matrix squished space down into a lower dimension, resulting in a volume of 0 with respect to the current space. That is, the new lower dimensional space takes up 0 area in our current dimension. Therefore, we can deduce that 
\\[\det (A-\lambda I) = 0\\]
Where
<div style="text-align: center;">
$$
A-\lambda I =\begin{bmatrix}
a_{11} - \lambda & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} -\lambda & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{n1} & a_{n2} & \cdots & a_{nn}-\lambda
\end{bmatrix}
$$
</div>
The above representation is just a generalization for higher dimensional matrices. If we consider the 2D case, it would simply be
<div style="text-align: center;">
$$
A-\lambda I =\begin{bmatrix}
a_{11} - \lambda & a_{12}\\
a_{21} & a_{22} -\lambda \\
\end{bmatrix}
$$
</div>
Then \\[\det (A-\lambda I) = (a_{11}-\lambda)(a_{22}-\lambda) - a_{12}a_{21} = 0\\]
Which results in the characteristic polynomial,
\\[\lambda^2 - a_{11}\lambda - a_{22}\lambda + a_{11}a_{22} = 0\\]
Solving for \\(\lambda\\) (which is usually very simple with the quadratic formula or factoring in 2D) gives us our eigenvalues. I say values as there can be multiple. Then, to find the eigenvectors, all you have to do is solve the following equation for each eigenvalue
\\[(A-\lambda I)\overline{v} = 0\\]
Therefore, we have that the eigenvectors of a matrix, are the vectors in our vector space that are only scaled during transformation (kind of think of them as fixed vectors), and the corresponding eigenvalue tells you how much that eigenvector was scaled by. This should cover all of the intuition needed to understand eigenvalues and eigenvectors and where the formulas come from. An important thing to note is that eigenvalues and eigenvectors are "properties" of a matrix with respect to the vector space it's acting on. 

## What Do Eigenvalues Tell Us About the Transformation?
If our characteristic polynomial produces \\(n\\) many distinct real values, then it stretches each corresponding eigenvector by that value. If we have two repeated real valued eigenvalues then the transformation could shear our space (slant it in one direction) or scale it. If we have complex roots for \\(\lambda\\), then we have some sort of stretching based on the real component and rotation based on the imaginary component, this can sometimes look like a sort of spiraling motion.

## Eigenbasis
An eigenbasis, is simply a basis in which every element is an eigenvector for some matrix.
