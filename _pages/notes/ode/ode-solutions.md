---
layout: archive
title: "Understanding the Solution to an ODE"
permalink: /notes/odes/vector-space-of-solutions/
author_profile: false
--- 
<hr style="border: 2px solid black;">
A very important fact for linear ODEs, is that their solutions form a vector space. 

## Proof that Solutions to Linear ODEs Form a Vector Space
I will begin with the most basic ODE:
\\[\dot{x} = C(t)x\\]
Where \\(x\\) is also a function of time. Let \\(x_k \ \ k= 1, 2, 3, ..... , j\\) be solutions to this ODE. Now, let's consider the linear combination of all of these solutions. That is, consider
\\[\sum_{k = 1}^{j}c_k x_k\\]
If we plug in the sum above into our ODE, we have that
\\[\frac{d}{dt}\sum_{k = 1}^{j}c_k x_k = \sum_{k=1}^{j}c_k\dot{x_k}\\]
Now, since we know that each \\(x_k\\) solves the ODE, then we know that 
\\[\dot{x_k} = f(t)x_k\\]
And therefore, we can make this substitution in our sum to get,
\\[\frac{d}{dt}\sum_{k = 1}^{j}c_k x_k = \sum_{k=1}^{j}c_kf(t)x_k\\]
We can then pull out \\(f(t)\\), which yields,
\\[\frac{d}{dt}\sum_{k = 1}^{j}c_k x_k = f(t)\sum_{k=1}^{j}c_kx_k\\]
If it isn't obvious, we have that the derivative of this linear combination is equal to \\(f(t)\\) times the linear combination. In other words, this linear combination also solves this ODE. Meaning we can add and scale any solution to get another solution.


## The Fundamental Set of Solutions
A question that naturally arises form the development of a vector space is, what is the basis for this vector space? Obviously, this is the set of linearly independent solutions which span the space. We call this set, the set of **Fundamental set of solutions**. With that, we can dump these solutions into a matrix, where each column is the solution vector. We call this matrix the **Fundamental matrix solution** and it also solves the ODE (by performing the appropriate operations on it).Say \\(M(t)\\) is the fundamental matrix solution, then it also solves the equation
\\[\frac{d}{dt}M(t) = f(t)M(t)\\]
Where the derivative is applied to each element of the matrix.
