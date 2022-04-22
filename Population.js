class Population {
  constructor(_size) {
    this.size = _size;
    this.satellites = new Array(this.size);
    for(let i = 0; i < this.size; i++) {
      this.satellites[i] = new Satellite();
    }

    this.generation = 1;
    this.generationStartTime = Date.now();

    this.fitnessSum = 0;
    this.orbitsCompleted = 1;
  }

  act(orbitHeight) {
    this.satellites.forEach(sat => sat.act(orbitHeight));
  }

  show() {
    this.satellites.slice(0,5).forEach(sat => sat.show());
  }

  update() {
    this.satellites.forEach(sat => sat.update());
  }

  orbitDone() {
    for(let sat in this.satellites) {
      if(!sat.dead) {
        if(Date.now() - this.generationStartTime > 10000) { //if at least 1 satellite alive, return true if longer than 10 secs.
          return true;
        } else {
          return false;
        }
      }
    }
    return true;
  }

  newOrbit() {
    let newGen = new Array(this.size);
    this.satellites.forEach((sat, i) => {
      newGen[i] = sat.clone();
      newGen[i].totalFitness = sat.totalFitness;
    });
    for(let i = 0; i < this.satellites.length; i++) {
      this.satellites[i].nn.dispose();
    }
    this.satellites = newGen;
    this.generationStartTime = Date.now();
  }

  calculateFitness() {
    this.fitnessSum = 0;
    this.satellites.forEach((sat, i) => {
      let currentFitness = sat.calculateFitness();
      this.satellites[i].totalFitness += currentFitness;
      this.fitnessSum += sat.totalFitness;
    });
  }

  naturalSelection() {
    let newGen = new Array(this.size);

    let fitnesses = this.satellites.map(satellite => {
      return satellite.totalFitness;
    });

    for(let i = 0; i < this.size; i++) {
      newGen[i] = this.getParent(fitnesses);
    }
    for(let i = 0; i < this.satellites.length; i++) {
      this.satellites[i].nn.dispose();
    }

    this.satellites = newGen;
    this.generationStartTime = Date.now();

  }

  getParent(fitnesses) {
    let randomNum = random(this.fitnessSum);

    for(let i = 0; i <= this.size; i++) {
      if(randomNum < 0) {
        //kid was last
        let lastSat = this.satellites[i - 1];
        return lastSat.clone();
      } else {
        randomNum -= fitnesses[i];
      }
    }
    console.log("error, no parent returned");
  }

  mutate() {
    this.satellites.slice(5).forEach(sat => sat.nn.mutate());
  }

  putAllSatsInOrbit() {
    this.satellites.forEach(sat => {
      sat.vel = createVector(1, 0);
      sat.vel.setMag(sqrt((G * earth.mass) / (earth.r + orbit.r)));
      sat.pos = createVector(earth.pos.x, earth.pos.y + earth.r + orbit.r);
    });

  }

  putAllSatsBelowOrbit() {
    this.satellites.forEach(sat => {
      sat.vel = createVector(1, 0);
      sat.vel.setMag(sqrt((G * earth.mass) / (earth.r + orbit.r)));
      sat.pos = createVector(earth.pos.x, earth.pos.y + earth.r + orbit.r - 10) ;
    });

  }

  putAllSatsAboveOrbit() {
    this.satellites.forEach(sat => {
      sat.vel = createVector(1, 0);
      sat.vel.setMag(sqrt((G * earth.mass) / (earth.r + orbit.r)));
      sat.pos = createVector(earth.pos.x, earth.pos.y + earth.r + orbit.r + 10);
    });

  }

}
