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
  population = new Population(5000)

  repo = new NNRepo();
  console.log("There are", repo.nn.length, "saved NNs");
  repo.nns.forEach((nn, i) => {
    population.satellites[i].nn.from(nn);
  });
  showDisplay = true;

  button = createButton('toggle display');
  button.position(windowWidth - 100, 0);
  button.mousePressed(toggleShow);

  console.log("Gen,Sat[0],Sat[1],Sat[2],Sat[3],Sat[4],Average Fitness");
}

function draw() {
  background(200)
  textSize(16); noStroke(); fill(0);
  text("Generation: " + population.generation, 15, 20)
  text("Orbit: " + (population.orbitsCompleted + 1) + "/10", 15, 45)

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
    if(population.orbitsCompleted < 10) {
      orbit = new Orbit();
      population.newOrbit();
    } else {
      orbit = new Orbit();
      population.naturalSelection();
      population.mutate();
    }

  } else {
    population.act(orbit.r);

    if(showDisplay) {
      earth.show()
      orbit.show()
      population.satellites[0].show()
    }

    earth.pull(population)
    population.update()
  }
}

function toggleShow() {
  showDisplay = !showDisplay;
}
