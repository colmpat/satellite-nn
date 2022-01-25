class NeuralNetwork {
  constructor(_input, _hidden, _output) {
    this.INPUT_SIZE = _input;
    this.HIDDEN_SIZE = _hidden;
    this.OUTPUT_SIZE = _output;

    this.wh = [];
    this.wo = [];

    this.bh = [];
    this.bo = [];
  }

  randomize() {
    this.randomizeWh();
    this.randomizeWo();
    this.randomizeBh();
    this.randomizeBo();
  }
  randomizeWh() {
    this.wh = [];
    for(let i = 0; i < this.INPUT_SIZE; i++) {
      let result = [];
      for(let j = 0; j < this.HIDDEN_SIZE; j++) {
        result[j] = randomGaussian();
      }
      this.wh[i] = result;
    }
  }
  randomizeWo() {
    this.wo = [];
    for(let i = 0; i < this.HIDDEN_SIZE; i++) {
      let result = [];
      for(let j = 0; j < this.OUTPUT_SIZE; j++) {
        result[j] = randomGaussian();
      }
      this.wo[i] = result;
    }
  }
  randomizeBh() {
    this.bh = [];
    for(let i = 0; i < this.HIDDEN_SIZE; i++) {
      this.bh[i] = randomGaussian();
    }
  }
  randomizeBo() {
    this.bo = [];
    for(let i = 0; i < this.OUTPUT_SIZE; i++) {
      this.bo[i] = randomGaussian();
    }
  }

  relu(x) {
    return x < 0 ? 0 : x;
  }

  feedForward(inputs) {
    let hiddenActivations = [];
    let outputActivations = [];
    for(let i = 0; i < this.HIDDEN_SIZE; i++) {
      let sum = 0;
      for(let j = 0; j < this.INPUT_SIZE; j++) {
        sum += inputs[j] * this.wh[j][i];
      }
      sum += this.bh[i];
      hiddenActivations[i] = this.relu(sum);
    }
    for(let i = 0; i < this.OUTPUT_SIZE; i++) {
      let sum = 0;
      for(let j = 0; j < this.HIDDEN_SIZE; j++) {
        sum += hiddenActivations[j] * this.wo[j][i];
      }
      sum += this.bo[i];
      outputActivations[i] = this.relu(sum);
    }
    return outputActivations;
  }

  mutate() {
    let MUTATION_RATE = 0.01;

    //mutate weights
    for(let i = 0; i < this.wh.length; i++) {
      for(let j = 0; j < this.wh[0].length; j++) {
        let randomNum = random(1.0);
        if(randomNum < MUTATION_RATE) {
          this.wh[i][j] += randomGaussian();
        }
      }
    }

    for(let i = 0; i < this.wo.length; i++) {
      for(let j = 0; j < this.wo[0].length; j++) {
        let randomNum = random(1.0);
        if(randomNum < MUTATION_RATE) {
          this.wo[i][j] += randomGaussian();
        }
      }
    }

    //mutate biases
    for(let i = 0; i < this.bh.length; i++) {
      let randomNum = random(1.0);
      if(randomNum < MUTATION_RATE) {
        this.bh[i] += randomGaussian();
      }
    }

    for(let i = 0; i < this.bo.length; i++) {
      let randomNum = random(1.0);
      if(randomNum < MUTATION_RATE) {
        this.bo[i] += randomGaussian();
      }
    }
  }

  clone() {
    let newNN = new NeuralNetwork(this.INPUT_SIZE, this.HIDDEN_SIZE, this.OUTPUT_SIZE);
    newNN.wh = JSON.parse(JSON.stringify(this.wh));
    newNN.wo = JSON.parse(JSON.stringify(this.wo));

    newNN.bh = JSON.parse(JSON.stringify(this.bh));
    newNN.bo = JSON.parse(JSON.stringify(this.bo));

    return newNN;
  }
}
