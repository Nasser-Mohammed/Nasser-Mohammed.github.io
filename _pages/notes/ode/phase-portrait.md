---
layout: archive
title: "Understanding Phase Portraits and Intuition Behind ODEs"
permalink: /notes/odes/phase-portraits/
author_profile: false
--- 
<hr style="border: 2px solid black;">
If we denote the position of some object by the function \\(x(t)\\), then by definition, the velocity of that object is defined by the derivative of its displacement (which is the position) and therefore the velocity is simply \\(\dot{x}\\). As I go through various ODEs, you should keep this relationship in the back of your head. Now, let's consider the most basic ODE:
\\[\dot{x} = Cx\\]
Where \\(C\\) is just some constant. In a more general form, this is 
\\[\dot{x} = f(x)\\]
Where \\(f(x)\\) is just some function of \\(x\\) like above. To begin with, we only consider linear ODEs, which are ones where the \\(x\\) term is not raised to a power, and is not multiplied to a function of \\(x\\). Keep in mind, \\(x = x(t)\\), in other words, \\(x\\) itself is a function of time (think position/displacement). Now, what equations of this form tell us, is that our object's velocity is dependent on where the object is (more or less). Since our velocity is a function of position, then where we are in a certain path determines how fast we are moving. Now, the ODE above can be solved easily by separation of variables and integrating. That is, we rewrite
\\[\dot{x} = \frac{dx}{dt}\\]
So our equation becomes,
\\[\frac{dx}{dt} = Cx\\]
Moving all \\(x\\) and \\(t\\) variables, we get
\\[\frac{1}{x}dx = Cdt\\]
Integrating both sides, gives
\\[\ln(x) = Ct + A\\]
Where \\(A\\) is just the constant of integration, then expnentiating to isolate \\(x\\), 
\\[x = e^{Ct+A} = e^{Ct}e^{A}\\]
\\(e^{A}\) is simply a constant, so we will write it as \\(\alpha\\) instead. Then our solution is
\\[x(t) = \alpha e^{Ct}\\]
