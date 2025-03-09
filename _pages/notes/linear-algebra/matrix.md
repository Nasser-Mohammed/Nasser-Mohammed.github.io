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
everytime we want to use it. Or maybe, we want to multiply various vectors by the same coefficients everytime (i.e. {\\(2, \frac{1}{3}, 122\\)}), then how could we do it concisely? This is where matrices are introduced. Matrices are simply these mathematical structures,
that allows us to write transformations of a vector in a more compact notation with enforced mathematical requirements that also allows us to do operations on the matrix itself and eventually allows us to solve for transformations that give us a desired vector. Matrices are **not** commutative. This means that for two matrices \\(A\\) and \\(B\\), in general we have that
\\[AB \neq BA\\]
In certain scenarios we do have commutativity, but as mentioned, not in general. Now matrix multiplication is defined in a particular way, this definition is not random, and ensures consistency with algebraic operations, and what the matrix represents (some linear transformation). To start, we will consider a matrix that transforms a vector into another vector of the same space. This means that the matrix has to be a square matrix of dimensions matching the vector space we are in. So if our vector is an element of a 3 dimensional vector space, then the square matrix must be a \\(3 \times 3\\) matrix. If this isn't readily apparent, if it was a vector of higher or lower dimension, it would transform our vector into a vector of that higher or lower dimension. So, let's consider a \\(2\times 2\\) matrix \\(A\\) and an \\(2\times 1\\) vector \\(V\\). Even with a simple column vector, the vector representation that we see is just a shorthand for what the vector really is. When we represent it as a \\(2\times 2\\) column vector, what we are really saying, is that the vector is the first number multiplied to the first basis element, plus the second number multiplied to the second basis element. In other words, the typical vector notation is just a compact way of writing an element of a vector space since it is assumed that we carry out that operation when presented with the vector. In the typical example of \\(\mathbb{R}^2\\), the typical basis elements are the x and y unit vectors, although several bases exist.

## What is a Linear Map?
To really understand matrices, we must know what a linear map is. We say a map \\(\phi\\) from one set \\(A\\) to another set \\(B\\) (you can think of this as a function), is linear if it has the following two properties:
\\[\text{Additivity: } \phi(x + y) = \phi(x) + \phi(y)\\]
\\[\text{Homogeneity: } \phi(\lambda x) = \lambda\phi(x)\\]
Here, \\(x,y \in A\\) and \\(\lambda\\) is some scalar (usually a complex or real number). This concept is very important and we will see why later.

## Back to Matrices
We know the algorithm for computing a matrix multiplied on the left to a vector. Recall, we are considering a \\(2\times 2\\) matrix \\(A\\) and a \\(2\times 1\\) vector \\(\overline{v}\\).
Let
<div style="text-align: center;">
$$
A = \begin{bmatrix} 
a_{1,1} & a_{1,2} \\
a_{2,1} & a_{2,2} 
\end{bmatrix}
\ \ \ \ \ \ 
\overline{v} = \begin{bmatrix} 
y_{1}\\ 
y_2
\end{bmatrix}
$$
</div>
So \\(A\cdot \overline{v}=\\) 
<div style="text-align: center;">
$$
A \cdot \overline{v} = \begin{bmatrix} 
\sum_{n=1}^2 a_{1,n}\cdot y_n \\
\sum_{n=1}^2 a_{2,n} \cdot y_n
\end{bmatrix}
$$
</div>
Now we know that when we say a vector
<div style="text-align: center;">
$$
\begin{bmatrix} 
k\\
m
\end{bmatrix}
$$
</div>
This is really just a concise notation for a vector, the real vector corresponding to 
<div style="text-align: center;">
$$
\begin{bmatrix} 
2\\
5
\end{bmatrix}
$$
</div>
is actually 
\\[2\hat{i} + 5\hat{j}\\]
where we are assuming the basis vectors are \\(\hat{i}\\) and \\(\hat{j}\\) in the normal \\(\mathbb{R}^2\\) vector space (i.e. the \\(x\\) and \\(y\\) unit vectors)
So \\(A\cdot \overline{v}=\\) 
<div style="text-align: center;">
$$
A \cdot \overline{v} = \begin{bmatrix} 
\sum_{n=1}^2 a_{1,n}\cdot y_n \\
\sum_{n=1}^2 a_{2,n} \cdot y_n
\end{bmatrix}
$$
</div>
Which really is 
\\[(\sum_{n=1}^2 a_{1,n}\cdot y_n)\hat{i} + (\sum_{n=1}^2 a_{2,n} \cdot y_n)\hat{j}\\]



