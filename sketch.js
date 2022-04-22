let earth
let orbit
let population
let G = 120
let button;
let showDisplay;
let repo;

function setup() {
  createCanvas(windowWidth, windowHeight)
  angleMode(DEGREES)

  earth = new Earth(createVector(windowWidth / 2, windowHeight / 2), 65)
  orbit = new Orbit()
  population = new Population(500)

  tf.setBackend('cpu');
  showDisplay = true;

  button = createButton('toggle display');
  button.position(windowWidth - 100, 0);
  button.mousePressed(toggleShow);
}

function draw() {
  background(200)
  textSize(16); noStroke(); fill(0);
  text("Generation: " + population.generation, 15, 20)
  text("Orbit: " + (population.orbitsCompleted) + "/50", 15, 45)
  let i = population.satellites.findIndex(d => !d.dead)
  text("Sat " + i + ": activations: " + (population.satellites[i].dead ? 'dead' : (population.satellites[i].activations.map(a => round(a * 100) + '%'))), 15, 70)
  
  trainPopulation(population)


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
  if(population.orbitDone()) {
    population.calculateFitness();
    if(population.orbitsCompleted < 50) {
      // population.newOrbit();
      population.naturalSelection();
      population.orbitsCompleted += 1;
    } else {
      orbit = new Orbit();
      population.naturalSelection();
      population.mutate();
      population.orbitsCompleted = 1;
      population.generation++;
    }

  } else {
    population.act(orbit.r);

    if(showDisplay) {
      earth.show()
      orbit.show()
      population.show()
    }

    earth.pull(population)
    population.update()
  }
}

function toggleShow() {
  showDisplay = !showDisplay;
}
