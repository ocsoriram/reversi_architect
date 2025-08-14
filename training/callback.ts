function add(v1: number, v2: number): number {
  return v1 + v2;
}

const multiply = (v1: number, v2: number): number => {
  return v1 * v2;
};

function calculate(
  v1: number,
  v2: number,
  callback: (a: number, b: number) => number
): number {
  return callback(v1, v2);
}

const addResult = calculate(2, 3, add);
const mulResult = calculate(2, 3, multiply);

console.log(`addResult = ${addResult}`);
console.log(`mulResult = ${mulResult}`);

const hello = () => {
  console.log("hello");
};

setTimeout(hello, 3000);

setTimeout(() => {
  console.log("method in anfn args");
}, 4000);
