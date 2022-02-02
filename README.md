# satellite-nn
A deep learning satellite simulation where the AI learns to launch itself into orbit at a specified height above earth.

## How it works
The model is currently in training and thus will initialize randomly in this deployment. Weights and Biases are currently generated using the Gaussian Process.
#### The Genetic Algorithm
Individual fitness is calculated in two parts. First, if a satellite has reached orbit, its fitness is a function of how much fuel it has used.
Secondly, if the satellite did not reach orbit, its fitness is a function of how close it was to orbit on average.

Generation to generation, satellites reproduce relative to their fitness. There is a 50% chance that each member of the new generation is the result of crossover.
Crossover in this case splits the Neural Network's weights and biases in half.



## The Neural Network
The Neural Network has two hidden layers with 7 nodes and the following inputs and outputs:
### Inputs
* Height of Orbit
* Satellite Altitude
* Radidal Position of Satellite in Degrees
* Satellite Speed
* Satellite Heading

### Outputs
* Activate Rear Thruster
* Activate Front Thruster (Brake)
* Activate Left Thruster
* Activate Right Thruster
* Do Nothing

## Planned
When the AI is trained and deemed responsive to orbital height,
I will be adding user interaction for orbital height and population size.
