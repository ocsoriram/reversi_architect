const STONE = 0;
const PAPER = 1;
const SCISSORS = 2;

interface HandGeneRator {
  generate(): number;
}

class RandomHandGenerator implements HandGeneRator {
  generate(): number {
    return Math.floor(Math.random() * 3);
  }

  generateArray(): number[] {
    return [];
  }
}

class StoneHandgenerator implements HandGeneRator {
  generate(): number {
    return STONE;
  }
}

class Janken {
  play(handGenerator: HandGeneRator) {
    const computerHand = handGenerator.generate();
    console.log(`computerHand =  ${computerHand}`);
    // 勝敗判定
  }
}

const janken = new Janken();
janken.play(new RandomHandGenerator());
janken.play(new StoneHandgenerator());
