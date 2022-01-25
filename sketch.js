let earth
let orbit
let orbitSlider
let population
let G = 120

function setup() {
  createCanvas(windowWidth, windowHeight)
  angleMode(DEGREES)

  earth = new Earth(createVector(windowWidth / 2, windowHeight / 2), 65)
  orbit = new Orbit(random(75, min(windowWidth, windowHeight) / 2 - 20 - earth.r))
  population = new Population(1000)

}

function draw() {
  background(180)
  textSize(16); noStroke(); fill(0);

  text("Generation: " + population.generation, 15, 20);
  if(population.generationDone()) {
    population.calculateFitness()
    population.naturalSelection()
    population.mutate()

    if(population.generation % 10 === 0) { //if next gen is gen 10, chagne orbit
      orbit.r = random(75, min(windowWidth, windowHeight) / 2 - 20 - earth.r)
    }
  } else {
    population.act(orbit.r);

    earth.show()
    orbit.show()
    population.show()

    earth.pull(population)
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
function Orbit(_height) {
  this.r = _height

  this.show = function() {
    noFill(); stroke(255); strokeWeight(2);
    drawingContext.setLineDash([10, 10])
    circle(windowWidth / 2, windowHeight / 2, (this.r + earth.r) * 2)
  }
}
