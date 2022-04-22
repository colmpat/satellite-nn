class Satellite {
  constructor() {
    this.pos = createVector(20, windowHeight - 20);
    this.vel = createVector(sqrt((G * earth.mass) / this.pos.dist(earth.pos)), 0);
    this.mass = 10; //our satellites shall be an arbitrary 10 kilos
    this.path = [];
    this.nn = new NeuralNetwork(3, 10, 5);
    this.dead = false;

    this.stats = {
      altitudes: [],
      speeds: [],
      headings: [],
      fuelUsed: 0
    }

    this.fitness = 0;
    this.totalFitness = 0;
    this.reachedOrbit = false;
    this.activations = [0,0,0,0,0]
  }

  show() {
    let earthPull = this.pos.copy().sub(earth.pos);
    let aToEarth = this.vel.angleBetween(earthPull) % 360;
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
    // text(aToEarth, this.pos.x, this.pos.y)
  }

  calculateFitness() {
    if(this.reachedOrbit) {     //if satellite reached orbit, then fitness is the ammount of fuel used to do so
      this.fitness = 100000000 / (1.0 + pow(this.stats.fuelUsed, 2));
    } else {                    //else, fitness is meusured on avg distance from orbit and
      let n = this.stats.altitudes.length;
      const reducer = (sum, val) => sum + val;

      let avgAltDif = this.stats.altitudes.reduce(reducer, 0) / n;
      let avgSpeedDif = this.stats.speeds.reduce(reducer, 0) / n;
      let avgAngleDif = this.stats.headings.reduce(reducer, 0) / n;

      this.fitness = 1.0 / ((avgAltDif * 0.1) + (avgSpeedDif * 0.3) + (avgAngleDif * 0.6) + 0.01);
    }
    return this.fitness;
  }

  update() {
    this.checkCollisions();

    if(this.dead) {return;}

    this.checkOrbitStatus();
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
    let aToEarth = this.vel.angleBetween(earthPull) % 360;
    let a = this.pos.dist(earth.pos);
    
    let velDif = this.vel.mag() / orbitalVelocity;
    velDif = abs(velDif - 1.0);

    let posDif = a / orbit.r;
    posDif = abs(posDif - 1.0);

    let angleDif = aToEarth > 180 ? (aToEarth / 270) : (aToEarth / 90);
    angleDif = abs(angleDif - 1.0);

    this.stats.altitudes.push(posDif)
    this.stats.headings.push(angleDif)
    this.stats.speeds.push(velDif)

    if(velDif <= 0.02 && posDif <= 0.02 && angleDif <= 0.01) {     
      this.reachedOrbit = true;
    } else {
      this.reachedOrbit = false;
    }
  }

  act(orbitHeight) {
    if(this.dead) return;
    let orbitalVelocity = sqrt((G * earth.mass) / (earth.r + orbit.r));
    let earthPull = this.pos.copy().sub(earth.pos);
    let a = this.pos.dist(earth.pos);
    let aToEarth = (this.vel.angleBetween(earthPull) + 360) % 360;
    
    let velDif = this.vel.mag() / orbitalVelocity;
    velDif -= 1;

    let posDif = a / orbit.r;
    posDif -= 1;

    let angleDif = aToEarth > 180 ? (aToEarth / 270) : (aToEarth / 90);
    angleDif -= 1;

    let activations = this.nn.predict([
      velDif,
      posDif,
      angleDif
    ])
    this.activations = [...activations];
    

    // let activations = this.nn.predict([
    //     orbitHeight, 
    //     earthToSatVector.mag() - earth.r, 
    //     earthToSatVector.heading(), 
    //     this.vel.mag(), 
    //     this.vel.heading()
    //   ]);
    let max = activations[0];
    for(let i = 1; i < activations.length; i++) {
      if(activations[i] > max) {
        max = activations[i];
      }
    }
    let move = activations.indexOf(max);
    this.makeMoveByType(move);
  }

  clone() {
    let newSat = new Satellite();
    newSat.nn.dispose();
    newSat.nn = this.nn.clone();
    return newSat;
  }

  applyForce(force) {
    this.vel.x += force.x / this.mass;
    this.vel.y += force.y / this.mass;
  }

  makeMoveByType(move) {
    if(move >= 0 && move < 4) {
      this.stats.fuelUsed++;
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
