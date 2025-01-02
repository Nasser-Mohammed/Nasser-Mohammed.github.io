---
layout: archive
title: "Conservation Equations"
permalink: /notes/pde/conservation-eq/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\[u_t + g(u)u_x = 0\\]
Also known as conservation equations, this is a first order **non-linear** PDE (in one dimension). This equation can model many things, a common example is the flow of traffic. It is sometimes written as 
\\[u_t + f_x = 0\\]
Where \\(f_x\\) is the **flux** of whatever quantity \\(u\\) is describing. In the traffic scenario, that would be the flux of cars, i.e. the amount of cars moving through the boundary at a given moment. Typically, \\(f_x\\) is found experimentally or given (by some assumption possibly), once we have that, we can begin to solve the PDE. First we will see where this \\(f_x\\) term even comes from. If we use the chain rule, then 
\\[f_x = \frac{\partial f}{\partial u}\frac{\partial u}{\partial x}\\]
This simplifies to 
\\[f_x = \frac{\partial f}{\partial u}u_x\\]
So in our original equation 
\\[u_t + g(u)u_x = 0\\]
We replace \\(g(u)u_x\\) with \\(f_x\\) since \\(g(u)u_x = \frac{\partial f}{\partial u}u_x\\) \\
\\
Now we use characteristic curves to solve this PDE. We pick an initial point that represents some subdomain of the domain. That is, if the initial value of the function \\(u\\) has different equations representing different intervals, then we pick a point from each of those intervals, and then do the following. **Note:** Here you can find theory behind [the method of characteristics]()
