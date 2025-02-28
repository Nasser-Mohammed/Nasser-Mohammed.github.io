---
layout: archive
title: "Orthogonality of Sine and Cosine on the Circle"
permalink: /notes/fourier-analysis/Sin-Cos-Orthogonality/
author_profile: false
--- 
<hr style="border: 2px solid black;">
\\
Inner product theory tells us that two function are orthogonal on an interval \\([a,b]\\) if their inner product is 0. The typical inner product that induces the \\(L^2\\) norm on an infinite dimensional function space, such as the space of real valued functions, is the following
\\[\langle f, g \rangle = \int_a^bf(x)g(x)dx\\]
Note, we want the \\(L^2\\) norm, as this is the only \\(L^p\\) space whose norm comes from an inner product, 
\\[||\cdot|| = \sqrt{\langle \cdot, \cdot \rangle}\\]
that turns it into a Hilbert space. With a Hilbert space, we then have a concept of orthogonality. Additionally, we want an \\(L^p\\) in general (and specifically \\(L^2\\)) because we are using the Lebesgue integral and measure in our theory and therefore want to deal with functions that are integrable. Now, let's consider some integrals,
\\[\int_{-\pi}^{\pi}\cos(nx)dx = [\frac{\sin(nx)}{n}]_{\pi}^{\pi} = \frac{1}{n}\left(\sin(n\pi) - \sin(-n\pi)\right) = 0 \ \ \forall n \geq 1\\]
Since \\(\sin(n\pi) = 0 \ \ \forall n \in \mathbb{Z}\\)
\\[\int_{-\pi}^{\pi}\sin(nx)dx = \frac{-\cos(nx)}{n}]_{\pi}^{\pi} = \frac{1}{n}\left(-\cos(n\pi) + \cos(-n\pi)\right) = \frac{1}{n}\left(-\cos(n\pi) + \cos(n\pi)\right) =0 \ \ \forall n \neq 1\\]
By \\(\cos\\) being even and therefore, \\(\cos(-n\pi) = \cos(n\pi)\\)\\
\\
\\[\int_{-\pi}^{\pi}\cos^2(nx)dx = \int_{-\pi}^{\pi}\frac{1+\cos(2nx)}{2} = \pi\\]
\\[\int_{-\pi}^{\pi}\sin^2(nx)dx = \int_{-\pi}^{\pi}\frac{1-\cos(2nx)}{2} = \pi\\]
Now we note the two trigonometric formulas,
\\[\cos(\alpha)\cos(\beta) = \frac{1}{2}[\cos(\alpha + \beta) + \cos(\alpha - \beta)]\\]
\\[\sin(\alpha)\sin(\beta) = \frac{1}{2}[\cos(\alpha - \beta) - \cos(\alpha + \beta)]\\]
We can now show orthogonality, consider
\\[\int_{-\pi}^{\pi}\cos(nx)\cos(mx)dx = \frac{1}{2}\int_{-\pi}^{\pi}\cos(nx + mx) + \cos(nx - mx)dx =  \frac{1}{2}\int_{-\pi}^{\pi}\cos[(n+m)x] + \cos[(n - m)x]dx\\]
Since the sum of two integers \\(n+m\\) and \\(n-m\\) is still an integer, we can break this integral up and apply the integral solutions above,
\\[ \frac{1}{2}\int_{-\pi}^{\pi}\cos[(n+m)x] + \cos[(n - m)x]dx =  \frac{1}{2}\left(\int_{-\pi}^{\pi}\cos[(n+m)x]dx + \int_{-\pi}^{\pi}\cos[(n - m)x]dx\right) = 0 + 0 = 0\\]
\\[\implies \cos(nx), \cos(mx) \text{ are orthogonal for any } m \neq n\\]
\\[m=n \implies \frac{1}{2}\left(\int_{-\pi}^{\pi}\cos(2nx)dx + \int_{-\pi}^{\pi}\cos(0)dx\right) = \frac{1}{2}(0 + 2\pi) =\pi\\]
Which is expected, as a function should not be orthogonal to itself (other than \\(0\\)). You may wonder about the behavior of the integral when \\(n=-m\\), in other words, we would have
\\[ \frac{1}{2}\left(\int_{-\pi}^{\pi}\cos[(n+m)x]dx + \int_{-\pi}^{\pi}\cos[(n - m)x]dx\right) =  \frac{1}{2}\left(\int_{-\pi}^{\pi}\cos(0)dx + \int_{-\pi}^{\pi}\cos(-2mx)dx\right) \\]
\\[ \frac{1}{2}\left(\int_{-\pi}^{\pi}\cos(0)dx + \int_{-\pi}^{\pi}\cos(-2mx)dx\right) = \pi\\]
In other words, we would have that for two functions to be orthogonal, we actually need that \\(|m| \neq |n|\\), this is a consequence of \\(\cos\\) being even, and therefore when we consider the product, we have
\\[\cos(-mx)\cos(mx) = \cos(m\pi)\cos(m\pi) = \cos^2(m\pi)\\]
and we know
\\[\int_{-\pi}^{\pi}\cos^2(nx)dx = \int_{-\pi}^{\pi}\frac{1+\cos(2nx)}{2} = \pi\\]\\
\\
When \\(n = 0\\), \\(\cos(nx) = 1\\) and \\(\sin(nx) = 0\\). The \\(0\\) function is orthogonal to any function. Since we showed that the integral of \\(\cos(nx)\\) and \\(\sin(nx)\\) are both \\(0\\), then so is \\(1\\) multiplied to it (since it doesn't affect the integral by multiplying by \\(1\\)). Therefore, \\(1\\) is orthogonal to both \\(\cos(nx)\\) and \\(\sin(nx)\\). Therefore, we don't have to consider \\(n=0\\). Now, consider
\\[\int_{-\pi}^{\pi}\sin(nx)\sin(mx)dx = \frac{1}{2}\int_{-\pi}^{\pi}\sin(nx - mx) - \sin(nx - mx)dx =  \frac{1}{2}\left(\int_{-\pi}^{\pi}\sin[(n-m)x] - \sin[(n + m)x]dx\right) = 0\\]
\\[\text{ when } |m| \neq |n| \ \ \text{ and evaluates to } \pi \text{ when } m = n \ \text{ and to } -\pi \ \text{ when } n =-m\\]
Finally, we first consider the formula for \\(|m| \neq |n|\\)
\\[\sin(\alpha)\cos(\beta) = \frac{1}{2}[\sin(\alpha + \beta) + \sin(\alpha - \beta)]\\]
We can now handle the integral,
\\[\int_{-\pi}^{\pi}\sin(nx)\cos(mx)dx = \frac{1}{2}\int_{-\pi}^{\pi}\sin(nx + mx) + \sin(nx - mx)dx =  \frac{1}{2}\left(\int_{-\pi}^{\pi}\sin[(n-m)x] - \sin[(n + m)x]dx\right)\\]
\\[  \frac{1}{2}\left(\int_{-\pi}^{\pi}\sin[(n-m)x] - \sin[(n + m)x]dx\right)  =   \frac{1}{2}\left(\int_{-\pi}^{\pi}\sin[(n-m)x] - \int_{-\pi}^{\pi}\sin[(n + m)x]dx\right) = 0\\]
Note again, that for \\(n = m\\) we get \\(\pi\\) and for \\(n=-m\\) we get \\(-\pi\\) since \\(\sin\\) is odd and therefore we can pull the negative sign to the front and we would just have the negative integral of \\(\sin^2\\) which we know would be \\(-\pi\\). \\ 
\\
Therefore, we see that for the set of functions
\\[\{1, \sin(nx), \cos(nx)\}\\]
Where \\(n \in \mathbb{N}\\), we have that all functions of this set are orthogonal to each other on the interval \\([-\pi, \pi]\\).
