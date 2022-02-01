const FUEL_START = 100;
class Satellite {
  constructor() {
    this.pos = createVector(20, windowHeight - 20);
    this.vel = createVector(sqrt((G * earth.mass) / this.pos.dist(earth.pos)), 0);
    this.mass = 10; //our satellites shall be an arbitrary 10 kilos
    this.path = [];
    this.nn = new NeuralNetwork(5, 9, 7, 5);
    this.nn.randomize();
    this.dead = false;
    this.distFromOrbitSum = 0;
    this.distFromOrbitEntries = 0;
    this.fuel = FUEL_START;
    this.fitness = -1;
    this.reachedOrbit = false;
  }

  show() {
    drawingContext.setLineDash([]);

    for (let i = 0; i < this.path.length-2; i++) {
      stroke(0, i); strokeWeight((i * 2.5) / (this.path.length - 2));
      line(this.path[i].x, this.path[i].y, this.path[i+1].x, this.path[i+1].y,);
    }

    let strokeColor = this.reachedOrbit ? color(38, 120, 31) : color(0);
    stroke(strokeColor); fill(this.reachedOrbit ? strokeColor : 230); strokeWeight(1.5);
    let theta = this.vel.mag() === 0 ? 0 : (this.vel.heading() + 90);

    push();
    translate(this.pos.x, this.pos.y);
    rotate(theta);
    beginShape(TRIANGLES);
    vertex(0, -5);
    vertex(-3, 5);
    vertex(3, 5);
    endShape();
    pop();
    //triangle(this.pos.x - 3, this.pos.y + 5, this.pos.x + 3, this.pos.y + 5, this.pos.x, this.pos.y - 5)
  }

  calculateFitness() {
    if(this.reachedOrbit) {     //if satellite reached orbit, then fitness is the ammount of fuel used to do so
      this.fitness = 1000000.0 / (1.0 + pow(FUEL_START - this.fuel, 2));
    } else {                    //else, fitness is meusured on avg distance from orbit
      let avgDistFromOrbit = this.distFromOrbitSum / this.distFromOrbitEntries;
      this.fitness = 1.0 / (pow(avgDistFromOrbit / 10.0, 2));
    }
    return this.fitness;
  }

  update() {
    this.checkCollisions();
    this.checkOrbitStatus();

    if(this.dead) {return;}

    let distanceFromOrbit = this.pos.dist(earth.pos) - earth.r - orbit.r;
    distanceFromOrbit *= distanceFromOrbit < 0 ? -1.0 : 1.0;
    this.distFromOrbitSum += distanceFromOrbit;
    this.distFromOrbitEntries++;
    this.move();
  }

  checkCollisions() {
    if(this.pos.dist(earth.pos) < earth.r || this.pos.x < 2 || this.pos.y < 2 || this.pos.x > windowWidth - 2 || this.pos.y > windowHeight - 2) {
      //we crashed into Earth or into the side
      this.dead = true;
      this.mass = 0; // to negate any gravitational pull
    }
  }

  move() {
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;

      //update path
      this.path.push(createVector(this.pos.x,this.pos.y));
      if (this.path.length > this.vel.mag() + 150) {this.path.splice(0,1);}
  }

  checkOrbitStatus() {
    let orbitalVelocity = sqrt((G * earth.mass) / (earth.r + orbit.r));
    let earthPull = this.pos.copy().sub(earth.pos);
    let velDif = this.vel.mag() / orbitalVelocity;
    let posDif = (this.pos.dist(earth.pos) - earth.r) / orbit.r;
    let angleBetweenGravity = this.vel.angleBetween(earthPull);
    angleBetweenGravity *= angleBetweenGravity < 0 ? -1 : 1;

    if(velDif >= 0.98 && velDif <= 1.02 && posDif >= 0.98 && posDif <= 1.02 && angleBetweenGravity >= 88 && angleBetweenGravity <= 92) {        //allowing 2% margin of error on vel and pos
      this.reachedOrbit = true;
    } else {
      this.reachedOrbit = false;
    }
  }

  act(orbitHeight) {
    let earthToSatVector = (earth.pos.copy()).sub(this.pos);

    let activations = this.nn.feedForward([orbitHeight, earthToSatVector.mag() - earth.r, earthToSatVector.heading(), this.vel.mag(), this.vel.heading()]);
    let move = activations.indexOf(max(activations));
    this.makeMoveByType(move);
  }

  clone() {
    let newSat = new Satellite();
    newSat.nn = this.nn.clone();
    return newSat;
  }

  applyForce(force) {
    this.vel.x += force.x / this.mass;
    this.vel.y += force.y / this.mass;
  }

  makeMoveByType(move) {
    if(this.fuel === 0) { return; }
    if(move >= 0 && move < 4) {
      this.fuel--;
    }
    else { return; }

    if(move === 0) {this.rearThruster();}
    else if(move === 1) {this.frontThruster();}
    else if(move === 2) {this.leftThruster();}
    else {this.rightThruster();}

  }

  rearThruster() {
    let force = this.vel.mag() === 0 ? createVector(0, -1) : this.vel.copy();
    force.setMag(5);

    this.applyForce(force);
  }
  leftThruster() {
    this.vel.rotate(-5);
  }
  rightThruster() {
    this.vel.rotate(5);
  }
  frontThruster() {
    let force = this.vel.mag() === 0 ? createVector(0, -1) : this.vel.copy();
    force.setMag(max(this.vel.mag() * -1.0, -5));

    this.applyForce(force);
  }

}
