function mul1(v1: number, v2: number): number {
  return v1 * v2;
}

const result1 = mul1(2, 3);
console.log(result1);

function mul2(v1: number, v2: number) {
  return v1 * v2;
}

// const result2_1 = mul2(3, 4);
// console.log(result2_1);

class Fraction {
  // private _numerator: number;
  // private _denominator: number;

  constructor(private _numerator: number, private _denominator: number) {}

  add(other: Fraction): Fraction {
    const resultNumerator =
      this._numerator * other._denominator +
      this._denominator * other._numerator;
    const resultDenominator = this._denominator * other._denominator;

    return new Fraction(resultNumerator, resultDenominator);
  }

  toString(): string {
    return ` ${this._numerator}/${this._denominator}`;
  }

  public get numerator(): number {
    return this._numerator;
  }

  public get denominator(): number {
    return this._denominator;
  }
}

const f1 = new Fraction(2, 3);
const f2 = new Fraction(1, 4);

console.log(f1.numerator);
console.log(f1.denominator);
console.log(f1.toString());
// f1.numerator = 1;

const result = f1.add(f2);
console.log(result.toString());
