class NeuralNetwork {
  constructor(_input, _hidden1, _hidden2, _output) {
    this.INPUT_SIZE = _input;
    this.HIDDEN_ONE_SIZE = _hidden1;
    this.HIDDEN_TWO_SIZE = _hidden2;
    this.OUTPUT_SIZE = _output;

    this.wh1 = [];
    this.wh2 = [];
    this.wo = [];

    this.bh1 = [];
    this.bh2 = [];
    this.bo = [];
  }

  randomize() {
    this.randomizeWh1();
    this.randomizeWh2();
    this.randomizeWo();
    this.randomizeBh1();
    this.randomizeBh2();
    this.randomizeBo();
  }
  randomizeWh1() {
    this.wh1 = [];
    for(let i = 0; i < this.INPUT_SIZE; i++) {
      let result = [];
      for(let j = 0; j < this.HIDDEN_ONE_SIZE; j++) {
        result[j] = randomGaussian();
      }
      this.wh1[i] = result;
    }
  }
  randomizeWh2() {
    this.wh2 = [];
    for(let i = 0; i < this.HIDDEN_ONE_SIZE; i++) {
      let result = [];
      for(let j = 0; j < this.HIDDEN_TWO_SIZE; j++) {
        result[j] = randomGaussian();
      }
      this.wh2[i] = result;
    }
  }
  randomizeWo() {
    this.wo = [];
    for(let i = 0; i < this.HIDDEN_TWO_SIZE; i++) {
      let result = [];
      for(let j = 0; j < this.OUTPUT_SIZE; j++) {
        result[j] = randomGaussian();
      }
      this.wo[i] = result;
    }
  }
  randomizeBh1() {
    this.bh1 = [];
    for(let i = 0; i < this.HIDDEN_ONE_SIZE; i++) {
      this.bh1[i] = randomGaussian();
    }
  }
  randomizeBh2() {
    this.bh2 = [];
    for(let i = 0; i < this.HIDDEN_TWO_SIZE; i++) {
      this.bh2[i] = randomGaussian();
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
    let hidden1Activations = [];
    let hidden2Activations = [];
    let outputActivations = [];
    for(let i = 0; i < this.HIDDEN_ONE_SIZE; i++) {
      let sum = 0;
      for(let j = 0; j < this.INPUT_SIZE; j++) {
        sum += inputs[j] * this.wh1[j][i];
      }
      sum += this.bh1[i];
      hidden1Activations[i] = this.relu(sum);
    }
    for(let i = 0; i < this.HIDDEN_TWO_SIZE; i++) {
      let sum = 0;
      for(let j = 0; j < this.HIDDEN_ONE_SIZE; j++) {
        sum += hidden1Activations[j] * this.wh2[j][i];
      }
      sum += this.bh2[i];
      hidden2Activations[i] = this.relu(sum);
    }

    for(let i = 0; i < this.OUTPUT_SIZE; i++) {
      let sum = 0;
      for(let j = 0; j < this.HIDDEN_TWO_SIZE; j++) {
        sum += hidden2Activations[j] * this.wo[j][i];
      }
      sum += this.bo[i];
      outputActivations[i] = this.relu(sum);
    }
    return outputActivations;
  }

  mutate() {
    let MUTATION_RATE = 0.01;

    //mutate weights
    for(let i = 0; i < this.wh1.length; i++) {
      for(let j = 0; j < this.wh1[0].length; j++) {
        let randomNum = random(1.0);
        if(randomNum < MUTATION_RATE) {
          this.wh1[i][j] += randomGaussian();
        }
      }
    }

    for(let i = 0; i < this.wh2.length; i++) {
      for(let j = 0; j < this.wh2[0].length; j++) {
        let randomNum = random(1.0);
        if(randomNum < MUTATION_RATE) {
          this.wh2[i][j] += randomGaussian();
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
    for(let i = 0; i < this.bh1.length; i++) {
      let randomNum = random(1.0);
      if(randomNum < MUTATION_RATE) {
        this.bh1[i] += randomGaussian();
      }
    }

    for(let i = 0; i < this.bh2.length; i++) {
      let randomNum = random(1.0);
      if(randomNum < MUTATION_RATE) {
        this.bh2[i] += randomGaussian();
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
    let newNN = new NeuralNetwork(this.INPUT_SIZE, this.HIDDEN_ONE_SIZE, this.HIDDEN_TWO_SIZE, this.OUTPUT_SIZE);
    newNN.wh1 = JSON.parse(JSON.stringify(this.wh1));
    newNN.wh2 = JSON.parse(JSON.stringify(this.wh2));
    newNN.wo = JSON.parse(JSON.stringify(this.wo));

    newNN.bh1 = JSON.parse(JSON.stringify(this.bh1));
    newNN.bh2 = JSON.parse(JSON.stringify(this.bh2));
    newNN.bo = JSON.parse(JSON.stringify(this.bo));

    return newNN;
  }
}
