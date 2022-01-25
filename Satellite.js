class Satellite {
  constructor() {
    this.pos = createVector(15, windowHeight - 15);
    this.vel = createVector(0, 0);
    this.mass = 10; //our satellites shall be an arbitrary 10 kilos
    this.path = [];
    this.nn = new NeuralNetwork(5, 7, 5);
    this.nn.randomize();
    this.dead = false;
    this.distFromOrbitSum = 0;
    this.distFromOrbitEntries = 0;
    this.fuelUsed = 0;
    this.fitness = -1;
  }

  show() {
    drawingContext.setLineDash([]);

    for (let i = 0; i < this.path.length-2; i++) {
      stroke(0, i); strokeWeight((i * 2.5) / (this.path.length - 2));
      line(this.path[i].x, this.path[i].y, this.path[i+1].x, this.path[i+1].y,);
    }

    stroke(0); fill(230); strokeWeight(1.5);
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
    let avgDistFromOrbit = this.distFromOrbitSum / this.distFromOrbitEntries;
    this.fitness = 1.0 / (avgDistFromOrbit * avgDistFromOrbit);
    this.fitness += this.fitness / (this.fuelUsed + 1.0);
    return this.fitness;
  }

  update() {
    this.checkCollisions();

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

  act(orbitHeight) {
    let activations = this.nn.feedForward([orbitHeight, this.pos.x, this.pos.y, this.vel.x, this.vel.y]);
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
    if(move >= 0 && move < 4) {
      this.fuelUsed++;
    }
    else {return;}

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
