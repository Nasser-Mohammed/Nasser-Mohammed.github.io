---
layout: archive
title: "Eigenvalues and Eigenvectors"
permalink: /notes/linear-algebra/eigen/
author_profile: false
--- 
<hr style="border: 2px solid black;">
Eigenvalues and Eigenvectors show up everywhere in math and are not only limited to the study of linear algebra. Therefore, an inuitive and rigorous understanding of these concepts is extremely beneficial and a lot of the times necessary.

## Eigenvalues
First, it is necessary to think in terms of vectors and linear transformations. We can have vectors of pretty much anything, though it might help to think of normal arrow ended vectors. Vectors are simply elements of a vector space (kind of circular reasoning but a vector
space is a set with a defined sort of structure, you can get more detailed notes I have here: ). A matrix is simply a defined transformation of a vector, to another vector. Now, this is when we are considering the appropriate dimensions, as we can multiply a matrix by another matrix and get a matrix as a result instead of a vector. However, we can think of that matrix as a sort of collection of vectors. Regardless, for simplicity we will consider an $mxn$ matrix multiplied on the left to a vector, i.e. a \\(nx1\\) list of elements (if we are considering it as a column vector, we could just say it's \\(nx1\\) for a row vector). The result will indeed be an \\(mx1\\) vector, however, this vector could technically be in another space if \\(m \neq n\\), so for now let \\(m=n\\). So now that we have a matrix that is a linear transformation of one vector in our space to another in the same space, we might then ask what did the matrix actually do to our vector? One part of this question, is to consider if our vector was stretched or compressed. 
