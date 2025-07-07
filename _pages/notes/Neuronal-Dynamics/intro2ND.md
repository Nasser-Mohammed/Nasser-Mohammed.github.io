---
layout: archive
title: "What is Neuronal Dynamics?"
permalink: /notes/neuronal-dynamics/nd-intro/
author_profile: false
--- 
<hr style="border: 2px solid black;">

The voltage dynamics of a neuron dictate many important properties of that neuron, and is one of the most fundamental ways that a neuron can communicate with other neurons. Understanding the mathematical dynamics of these systems helps to understand how neurons behave qualitatively. The brain is a very complex network of neurons, and therefore deeply understanding the basic unit of computation in the brain (the neuron) is critical. The Hodgkin-Huxley model is the prototype for voltage dynamics of a neuron's cell membrane. Many questions regarding an individual neuron arise naturally from the study of these cells and equations. Below are the most fundamental questions, and brief (non-technical) answers to them.

## What causes a neuron to fire? 
Neurons can be broken up into many different classifications. On the basis of just response to input, we usually consider to classes, class 1 and class 2 excitability. Class 1 corresponds to what's called an **Integrator** neuron. It sums up the inputs over time, and responds accordingly. Typically, once it reaches a threshold it can fire an action potential. It can continuously encode the input strength into its output signal. The strength can be interpreted through rate based coding or latency based coding. The former refers to the frequency of the output, whereas the latter refers to the timing between when that neuron received its inputs and when it fires; an almost instant firing upon input would be interpreted as a stronger signal. Class 2 excitability corresponds to what's called a **Resonator** neuron. These neurons only fire in response to certain bands of input frequency, and typically the output signal is invariant to the strength of the input signal. When we say strength, we are typically talking about the amplitude of injected current or input frequency. These two classes also define different neuro-computational capabilities. As mentioned, the integrator can feed forward how strong an input was, whereas a resonator can feed forward the frequency of an input. 

## How do neurons respond to subthreshold inputs? 
Above we defined how a neuron can respond to certain inputs, and broke it into the two main classes. What if the neuron doesn't reach its spiking threshold? This still corresponds to the same two classes above. A resonator neuron will exhibit damped oscillations back to resting potential in response to a subthreshold input, whereas an integrator will monotonically rise and then decay once the input is no longer present. 

