---
layout: archive
title: "Matrix Properties"
permalink: /notes/linear-algebra/matrices/
author_profile: false
--- 
<hr style="border: 2px solid black;">
Now that we have a concept of a vector space, our next step might be asking how we can "transform" a vector into another vector. We know that we can multiply and add them, but writing elements as a sum of the form
\\[\sum_{n=1}^{k}c_kv_k\\]
Isn't always possible without explicitly determining what each \\(c_k\\) is. What I mean by this, is how could you compress the sum
\\[2v_1 + \frac{1}{3}v_2 + 122v_3\\]
into the form
\\[\sum_{n=1}^{k}c_kv_k\\]
Without explicitly writing what each \\(c_k\\) must be. Now theoretically, we can always find some polynomial to interpolate a finite number of points, but this is a lot of work and might even be longer to write out. We wouldn't want to write out,
\\[2v_1 + \frac{1}{3}v_2 + 122v_3\\]
everytime we want to use it. Or maybe, we want to multiply various vectors by the same coefficients everytime (i.e. \\(2, \frac{1}{3}, 122\\)), then how could we do it concisely? This is where matrices are introduced. Matrices are simply these mathematical structures,
that allows us to write transformations of a vector in a more compact notation with enforced mathematical requirements that also allows us to do operations on the matrix itself and eventually allows us to solve for transformations that give us a desired vector. Matrices are **not** commutative. This means that for two matrices \\(A\\) and \\(B\\), in general we have that
\\[AB \neq BA\]
In certain scenarios we do have commutativity, but as mentioned, not in general. Now matrix multiplication is defined in a particular way, this definition is not random, and ensures consistency with what the matrix represents (some linear transformation). To start, we will consider a matrix that transforms a vector into another vector of the same space. This means that the matrix has to be a square matrix of dimensions matching the vector space we are in. So if our vector is an element of a 3 dimensional vector space, then the square matrix must be a \\(3 \times 3\\) matrix. If this isn't readily apparent, if it was a vector of higher or lower dimension, it would transform our vector into a vector of that higher or lower dimension. So, let's consider a \\(2\times 2\\) matrix and an \\(2\times 1\\) vector.
