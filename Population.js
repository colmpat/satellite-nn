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
    this.bestFitnesses = new Array(5).fill(-1);
    this.indexOfBestSatellites = new Array(5).fill(-1);
    this.orbitsCompleted = 0;
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
          this.orbitsCompleted++;
          return true;
        } else {
          return false;
        }
      }
    }
    this.orbitsCompleted++;
    return true;
  }

  newOrbit() {
    let newGen = new Array(this.size);
    this.satellites.forEach((sat, i) => {
      newGen[i] = sat.clone();
      newGen[i].totalFitness = sat.totalFitness;
    });
    this.satellites = newGen;
    this.generationStartTime = Date.now();
  }

  calculateFitness() {
    this.fitnessSum = 0;
    this.bestFitnesses = new Array(5).fill(-1);
    this.indexOfBestSatellite = new Array(5).fill(-1);

    this.satellites.forEach((sat, i) => {
      let currentFitness = sat.calculateFitness();
      this.satellites[i].totalFitness += currentFitness / 10.0;
      this.fitnessSum += sat.totalFitness;
      this.updateTopFive(sat.totalFitness, i);
    });
  }

  updateTopFive(fitness, index) {
    for(let i = 0; i < this.bestFitnesses.length; i++) {
      if(fitness > this.bestFitnesses[i]) {
        for(let j = 4; j > i; j--) {        //shift values down
          this.bestFitnesses[j] = this.bestFitnesses[j - 1];
          this.indexOfBestSatellites[j] = this.indexOfBestSatellites[j - 1];
        }
        this.bestFitnesses[i] = fitness;
        this.indexOfBestSatellites[i] = index;
        return;
      }
    }

  }

  naturalSelection() {
    console.log(this.generation + "," + this.bestFitnesses.map(x=>round(x * 100) / 100) + "," + round((this.fitnessSum / this.size) * 100) / 100);
    let newGen = new Array(this.size);
    for(let i = 0; i < this.size; i++) {
      if(i < 5) {
        newGen[i] = (this.satellites[this.indexOfBestSatellites[i]]).clone();
      }
      let randomNum = random(1.0);

      if(randomNum < 0.10) { //10% chance of kid being result of crossover
        newGen[i] = this.getBaby();
      } else {
        newGen[i] = this.getParent();
      }

    }
    this.satellites = newGen;
    this.generation++;
    this.orbitsCompleted = 0;
    this.generationStartTime = Date.now();

    // this.putAllSatsInOrbit();
  }

  getParent() {
    let randomNum = random(this.fitnessSum);
    let fitnesses = this.satellites.map(satellite => {
      return satellite.totalFitness;
    });

    for(let i = 0; i <= this.size; i++) {
      if(randomNum < 0) {
        //kid was last
        let newSat = this.satellites[i - 1].clone();
        return newSat;
      } else {
        randomNum -= fitnesses[i];
      }
    }
    console.log("error, no parent returned");
  }

  getBaby() {
    let child = this.getParent();
    let parent2 = this.getParent();

    child.nn.wo = JSON.parse(JSON.stringify(parent2.nn.wo));
    child.nn.bo = JSON.parse(JSON.stringify(parent2.nn.bo));

    return child;
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
