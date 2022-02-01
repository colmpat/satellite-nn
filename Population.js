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
  }

  act(orbitHeight) {
    this.satellites.forEach(sat => sat.act(orbitHeight));
  }

  show() {
    this.satellites.slice(0, 5).forEach(sat => sat.show());
  }

  update() {
    this.satellites.forEach(sat => sat.update());
  }


  generationDone() {
    for(let sat in this.satellites) {
      if(!sat.dead) {return Date.now() - this.generationStartTime > 10000;} //if at least 1 satellite alive, return true if longer than 10 secs.
    }

    return true; //all satellites are dead
  }

  calculateFitness() {
    this.fitnessSum = 0;
    this.bestFitness = new Array(5).fill(-1);
    this.indexOfBestSatellite = new Array(5).fill(-1);

    this.satellites.forEach((sat, i) => {
      let currentFitness = sat.calculateFitness();
      this.fitnessSum += currentFitness;
      this.updateTopFive(currentFitness, i);
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
    let newGen = new Array(this.size);
    for(let i = 0; i < this.size; i++) {
      if(i < 5) {
        newGen[i] = (this.satellites[this.indexOfBestSatellites[i]]).clone();
      }
      let randomNum = random(1.0);

      if(randomNum < 0.50) { //50% chance of kid being result of crossover
        newGen[i] = this.getBaby();
      } else {
        newGen[i] = this.getParent();
      }

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

    child.nn.wo = JSON.parse(JSON.stringify(parent2.nn.wo));
    child.nn.bo = JSON.parse(JSON.stringify(parent2.nn.bo));

    return child;
  }

  mutate() {
    this.satellites.slice(5).forEach(sat => sat.nn.mutate());
  }
}
