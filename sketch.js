let earth
let population
let orbit
let orbitSlider
let testSat
let frameCount
let fr = 40
let G = 120

function setup() {
  frameRate(fr)
  frameCount = 0
  createCanvas(windowWidth, windowHeight)
  angleMode(DEGREES)

  earth = new Earth(createVector(windowWidth / 2, windowHeight / 2), 65)
  population = new Population(100)
  orbit = new Orbit(300)

  orbitSlider = createSlider(earth.r + 75, min(windowWidth, windowHeight) / 2 - 20, 300, 5);
  orbitSlider.position(windowWidth - 100, 10);
  orbitSlider.style('width', '90px');
}

function draw() {
  frameCount++
  let r = orbitSlider.value()
  orbit.r = r
  background(180)
  text("Generation: " + population.generation, 10, 10)

  if(frameCount % 5 == 0) {
    population.updateDist()
    population.act()
  }

  earth.pull(population)

  earth.show()
  orbit.show()

  if(population.generationDone()) {
    population.calculateFitnesses()
    population.naturalSelection()
    population.mutate()
  } else {
    population.show()
    population.update()
  }

}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Earth
function Earth(_pos, _r) {
  this.pos = _pos
  this.r = _r

  this.mass = _r * 1.25

  this.show = function() {
    noStroke(); fill(40, 122, 171);
    circle(this.pos.x, this.pos.y, this.r * 2)
  }

  this.pull = function(population) {
    for(let i = 0; i < population.size; i++) {
      body = population.population[i]

      force = (this.pos.copy()).sub(body.pos)
      r = this.pos.dist(body.pos)
      magnitude = (G * this.mass * body.mass) / (r * r)

      force.setMag(magnitude)

      body.applyForce(force)
    }

  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Satellite
function Satellite(_pos) {
  this.pos = _pos
  this.vel = createVector(0, 0)
  this.mass = 10 //our satellites shall be an arbitrary 10 kilos
  this.path = []
  this.dead = false
  this.brain = new Brain(this)
  this.fuelUsed = 0
  this.birthday = Date.now()
  this.timeAlive = 0

  this.avgDistFromOrbit = 0
  this.distEntries = 0

  this.show = function() {

    drawingContext.setLineDash([])

    for (let i = 0; i < this.path.length-2; i++) {
      stroke(0, i); strokeWeight((i * 2.5) / (this.path.length - 2));
      line(this.path[i].x, this.path[i].y, this.path[i+1].x, this.path[i+1].y,)
    }

    stroke(0); fill(230); strokeWeight(1.5);
    theta = this.vel.mag() === 0 ? 0 : (this.vel.heading() + 90)

    push()
    translate(this.pos.x, this.pos.y)
    rotate(theta)
    beginShape(TRIANGLES)
    vertex(0, -5)
    vertex(-3, 5)
    vertex(3, 5)
    endShape()
    pop()
    //triangle(this.pos.x - 3, this.pos.y + 5, this.pos.x + 3, this.pos.y + 5, this.pos.x, this.pos.y - 5)
  }

  this.update = function() {
    if(this.dead) {return}
    this.move()
    this.checkCollision()
  }

  this.move = function() {
      this.pos.x += this.vel.x
      this.pos.y += this.vel.y

      //update path
      this.path.push(createVector(this.pos.x,this.pos.y))
      if (this.path.length > this.vel.mag() + 150) {this.path.splice(0,1)}

  }

  this.applyForce = function(force) {
    this.vel.x += force.x / this.mass
    this.vel.y += force.y / this.mass
  }

  this.makeMoveByType = function(type) {
    if(type === 0) {
      this.rearThruster()
    } else if(type === 1) {
      this.frontThruster()
    } else if(type === 2) {
      this.leftThruster()
    } else if(type === 3) {
      this.rightThruster()
    } else { return }
  }

  this.rearThruster = function() {
    force = this.vel.mag() === 0 ? createVector(0, -1) : this.vel.copy()
    force.setMag(5)

    this.applyForce(force)
    this.fuelUsed++
  }
  this.leftThruster = function() {
    this.vel.rotate(-5)
    this.fuelUsed++
  }
  this.rightThruster = function() {
    this.vel.rotate(5)
    this.fuelUsed++
  }
  this.frontThruster = function() {
    force = this.vel.mag() === 0 ? createVector(0, -1) : this.vel.copy()
    force.setMag(-5)

    this.applyForce(force)
    this.fuelUsed++
  }

  this.checkCollision = function() {
    if(this.pos.dist(earth.pos) < earth.r + 5) {
      this.dead = true
      this.timeAlive = Date.now() - this.birthday
      this.mass = 0 //this negates gravitational pull
    } else if(this.pos.x < 3 || this.pos.y < 3 ||
      this.pos.x > windowWidth - 5 || this.pos.y > windowHeight - 5) {
      this.dead = true
      this.timeAlive = Date.now() - this.birthday
      this.mass = 0 //this negates gravitational pull
    }
  }

  this.updateDist = function() {
    let distFromOrbit = this.pos.dist(earth.pos) - (earth.r + orbit.r)
    if(this.distEntries === 0) {
      this.avgDistFromOrbit += distFromOrbit
      this.distEntries++
    } else {
      distFromOrbit *= distFromOrbit < 0 ? -1.0 : 1.0
      this.avgDistFromOrbit = ((this.avgDistFromOrbit * this.distEntries) / this.distEntries++) + distFromOrbit / this.distEntries
    }

  }

  this.calculateFitness = function() {
    //key things to consider when looking at fitness:
    /*
      1. average distance from orbit
        more time in orbit the better
      2. fuelUsed
        less fuel used the better
      3. time alive
    */
    if(this.timeAlive == 0) {this.timeAlive = Date.now() - this.birthday}
    return (1.0 / (this.avgDistFromOrbit * this.avgDistFromOrbit)) + (2.0 / (1.0 + this.fuelUsed)) + (sqrt(this.timeAlive / 10.0))
  }

  this.cloneSatellite = function() {
    let newSat = new Satellite(createVector(10, windowHeight - 10))
    newSat.brain = this.brain.clone()
    return newSat
  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Orbit goal
function Orbit(_height) {
  this.r = _height

  this.show = function() {
    noFill(); stroke(255); strokeWeight(2);
    drawingContext.setLineDash([10, 10])
    circle(windowWidth / 2, windowHeight / 2, (this.r + earth.r) * 2)
  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Machine Learning
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/* Neural Network --
  input: an array of ints representing the number of nodes in that layer
  ex: [3, 4, 3] shall represent a 3 node input layer, a 4 node hidden layer, and a 3 node output layer
*/
function NeuralNetwork(_layers) {
  this.weights = _layers.slice(0, -1).map((layerSize, i) => {
    const nextLayerSize = _layers[i + 1]
    let result = []
    for(let j = 0; j < nextLayerSize; j++) {
      let layerWeights = []
      for(let k = 0; k < layerSize; k++) {
        layerWeights.push(Math.random(1.0))
      }
      result.push(layerWeights)
    }
    return result
  })
  this.biases = _layers.slice(0, -1).map((layersSize, i) => {
    const nextLayerSize = _layers[i + 1]
    let result = []
    for(let j = 0; j < nextLayerSize; j++) {
      result.push(randomGaussian())
    }
    return result
  })

  this.feedForward = function(input) {
    let activations = input
    for(let i = 0; i < this.weights.length; i++) {
      let layer = this.weights[i]
      activations = layer.map((weights, j) => {
        return this.relu(this.dot(activations, weights) + (this.biases[i])[j])
      })
    }
    return activations
  }

  this.relu = function(x) {
    return max(0.0, x) //if x < 0, return 0; else, return x
  }

  this.dot = function(v1, v2) {
    let res = 0
    for(let i = 0; i < v1.length; i++) {
      res += v1[i] * v2[i]
    }
    return res
  }

  this.mutate = function() {
    let mutationRate = 0.02
    for(let i = 0; i < this.weights.length; i++) {
      for(let j = 0; j < this.weights[i].length; j++) {
        let randomNumForWeights = Math.random(1.0)
        if(randomNumForWeights < mutationRate) {
          (this.weights[i])[j] = Math.random(1.0)
        }
        let randomNumForBiases = Math.random(1.0)
        if(randomNumForBiases < mutationRate) {
          (this.biases[i])[j] += randomGaussian() //will produce a number from -0.5 to 0.5
        }
      }
    }
  }
}

//Satellite Brain
function Brain(_satellite) {

  this.satellite = _satellite

  //input layer (5 nodes):
  /*
    we shall take into consideration:

    0 height of goal orbit
    1 current height above earth
    2 current velocity magnitude
    3 current heading
    4 current heading from center of earth to satellite

  */

  //hidden layer (5 nodes)

  //output layer (5 nodes)
  /*
    0 rearThruster
    1 frontThruster
    2 leftThruster
    3 rightThruster
    4 doNothing
  */
  this.nn = new NeuralNetwork([5, 5, 5])

  //returns 0-4 value for the move the algorithm sees fit
  this.getMove = function() {
    alt = this.satellite.pos.dist(earth.pos) - earth.r
    velMag = this.satellite.vel.mag()
    velHeading = this.satellite.vel.heading()
    satellitePositionalDegree = (this.satellite.pos.copy().sub(earth.pos)).heading() //the heading of the vector from earth to the satellite

    let input = [orbit.r, alt, velMag, velHeading, satellitePositionalDegree]
    let output = this.nn.feedForward(input)
    let highest = max(output)
    return output.indexOf(highest)
  }

  this.clone = function() {
    newBrain = new Brain(this.satellite)
    newBrain.nn = new NeuralNetwork([5, 5, 5])
    newBrain.nn.weights = JSON.parse(JSON.stringify(this.nn.weights))
    return newBrain
  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//Population
function Population(_size) {

  this.size = _size
  this.population = []

  this.generation = 1
  this.generationStartTime = Date.now()

  this.fitnessSum = 0
  this.indexOfBestSatellite = 0
  this.bestFitness = 0


  for(let j = 0; j < this.size; j++) {
    this.population.push(new Satellite(createVector(10, windowHeight - 10)))
  }

  this.show = function() {
    this.population[0].show()
  }

  this.update = function() {
    this.population.forEach(sat => sat.update())
  }

  this.updateDist = function() {
    this.population.forEach(sat => sat.updateDist())
  }

  this.generationDone = function() {
    let allDead = true
    for(let sat in population) {
      if(!sat.dead) {
        allDead = false
        break
      }
    }

    return allDead || (Date.now() - this.generationStartTime >= 10000)
  }

  this.act = function() {
    this.population.forEach(sat => {
      if(sat.dead) {return}
      let move = sat.brain.getMove()
      sat.makeMoveByType(move)
    })
  }

  this.calculateFitnesses = function() {
    this.fitnessSum = 0
    this.population.forEach((sat, index) => {
      let currentFitness = sat.calculateFitness()
      this.fitnessSum += currentFitness
      if(currentFitness > this.bestFitness) {
        this.bestFitness = currentFitness
        this.indexOfBestSatellite = index
      }
    })
    console.log("Fitness sum for generation " + this.generation + ": " + this.fitnessSum);
  }

  this.naturalSelection = function() {
    let newGen = []
    newGen.push((this.population[this.indexOfBestSatellite]).cloneSatellite())
    for(let i = 1; i < this.size; i++) {
      let newSat = this.getBaby(this.getParent(), this.getParent())
      newGen.push(newSat)
    }
    arrayCopy(newGen, this.population, this.size)
    this.generation++
    this.generationStartTime = Date.now()
  }

  //this function generates a random number and selects a satellite based on its fitness; ie. the higher the satellite's fitness, the more likely it is to be picked
  this.getParent = function() {
    let randomNumber = floor(random(this.fitnessSum))
    let runningTotal = 0
    for(let i = 0; i < this.size; i++) {
      runningTotal += (this.population[i]).calculateFitness()
      if(runningTotal > randomNumber){
        return (this.population[i]).cloneSatellite()
      }
    }
  }

  this.getBaby = function(parent1, parent2) {
    //we shall choose each bias randomly from the parents and create genetic crossover from the parents
    let child = parent1.cloneSatellite()
    //there shall be a 10% chance of crossover
    let randomNum = Math.random(1.0)
    if(randomNum < 0.1) {
      for(let i = 0; i < child.brain.nn.biases.length / 2; i++) {
        for(let j = 0; j < child.brain.nn.biases[0].length; j++) {
          child.brain.nn.biases[i][j] = parent2.brain.nn.biases[i][j]
        }
      }
      for(i = 0; i < child.brain.nn.weights.length / 2; i++) {
        for(j = 0; j < child.brain.nn.weights[0].length; j++) {
          child.brain.nn.weights[i][j] = parent2.brain.nn.weights[i][j]
        }
      }
    }
    return child
  }

  this.mutate = function() {
    for(let i = 1; i < this.size; i++) {
      (this.population[i]).brain.nn.mutate()
    }
  }

}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Key input for user controlled satellites
// function keyPressed() {
//   if(keyCode === LEFT_ARROW) {
//     satellite.leftThruster()
//   } else if(keyCode === RIGHT_ARROW) {
//     satellite.rightThruster()
//   } else if(keyCode === UP_ARROW) {
//     satellite.rearThruster()
//   } else if(keyCode === DOWN_ARROW) {
//     satellite.frontThruster()
//   }
// }
