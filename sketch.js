let earth
let orbit
let population
let G = 120
let fitnessCsvContent
let neuralNetworkSaves
let start
let epochs

function setup() {
  createCanvas(windowWidth, windowHeight)
  angleMode(DEGREES)
  start = false

  earth = new Earth(createVector(windowWidth / 2, windowHeight / 2), 65)
  orbit = new Orbit()
  population = new Population(1000)
  epochs = 1

  fitnessCsvContent = "data:text/csv;charset=utf-8,";
  neuralNetworkSaves = [];
}

function draw() {
  background(200)
  textSize(16); noStroke(); fill(0);
  text("Generation: " + population.generation, 15, 20)
  text("Epoch: " + epochs, 15, 40)

  trainPopulation(population)

  if(population.generation > 250) {
    population.satellites.slice(0,5).forEach(sat => {
      neuralNetworkSaves.push(JSON.parse(JSON.stringify(sat.nn)))
    })
    population = new Population(population.size)
    orbit = new Orbit()
    epochs++
  }

  if(epochs > 10) {
    console.log(JSON.stringify(neuralNetworkSaves));
    noLoop();
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
      let body = population.satellites[i]
      let force = createVector(this.pos.x - body.pos.x, this.pos.y - body.pos.y)
      let r = (this.pos).dist(body.pos)
      let magnitude = (G * this.mass * body.mass) / (r * r)

      force.setMag(magnitude)

      body.applyForce(force)
    }
  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Orbit goal
function Orbit() {
  this.r = random(150, min(windowWidth, windowHeight) / 2 - 30 - earth.r)

  this.show = function() {
    noFill(); stroke(255); strokeWeight(3);
    drawingContext.setLineDash([10, 15])
    circle(windowWidth / 2, windowHeight / 2, (this.r + earth.r) * 2)
  }
}

function trainPopulation(population) {
  if(population.generationDone()) {
    population.calculateFitness()

    //CSV Fitness save for data analysis
    let row = [population.generation, population.bestFitness, population.fitnessSum / population.size];
    fitnessCsvContent += row.join(",") + "\r\n";

    population.naturalSelection()
    population.mutate()

  } else {
    population.act(orbit.r);

    earth.show()
    orbit.show()
    population.show()

    earth.pull(population)
    population.update()
  }
}
