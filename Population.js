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
    this.bestFitness = -1;
    this.indexOfBestSatellite = -1;
  }

  act(orbitHeight) {
    this.satellites.forEach(sat => sat.act(orbitHeight));
  }

  show() {
    this.satellites.slice(0, 10).forEach(sat => sat.show());
  }

  update() {
    this.satellites.forEach(sat => sat.update());
  }

  generationDone() {
    for(let sat in this.satellites) {
      if(!sat.dead) {return Date.now() - this.generationStartTime > 20000;} //if at least 1 satellite alive, return true if longer than 15 secs.
    }

    return true; //all satellites are dead
  }

  calculateFitness() {
    this.fitnessSum = 0;
    this.bestFitness = -1;
    this.indexOfBestSatellite = -1;

    this.satellites.forEach((sat, i) => {
      let currentFitness = sat.calculateFitness();
      this.fitnessSum += currentFitness;
      if(currentFitness > this.bestFitness) {
        this.bestFitness = currentFitness;
        this.indexOfBestSatellite = i;
      }
    });
    console.log("Best Fitness: " + this.bestFitness);
    console.log("Fitness sum: " + this.fitnessSum);
  }

  naturalSelection() {
    let newGen = new Array(this.size);
    newGen[0] = this.satellites[this.indexOfBestSatellite].clone();
    for(let i = 1; i < this.size; i++) {
      let randomNum = random(1.0);

      if(randomNum < 0.1) { //
        newGen[i] = this.getBaby();
      } else {
        newGen[i] = this.getParent();
      }


      //add 10% chance of kid being result of crossover
    }
    this.satellites = newGen;
    this.generation++;
    this.generationStartTime = Date.now();

  }

  getParent() {
    let randomNum = random(this.fitnessSum);
    let fitnesses = this.satellites.map(satellite => {
      return satellite.fitness;
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

    child.nn.wh = JSON.parse(JSON.stringify(parent2.nn.wh));
    child.nn.bh = JSON.parse(JSON.stringify(parent2.nn.bh));

    return child;
  }

  mutate() {
    this.satellites.slice(1).forEach(sat => sat.nn.mutate());
  }
}
