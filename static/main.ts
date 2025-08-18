// console.log("hello world at console");

// const STONESTATES = ["empty", "dark", "light"] as const;
// type StoneState = (typeof STONESTATES)[number];

// let initialBoard: StoneState[][] = [];

// for (let col = 0; col < 8; col++) {
//   let boardRow: StoneState[] = [];
//   for (let row = 0; row < 8; row++) {
//     boardRow.push("empty");
//   }
//   initialBoard.push(boardRow);
// }

// console.log(initialBoard);

const STONESTATES = ["empty", "dark", "light"] as const;
type StoneState = (typeof STONESTATES)[number];

function createBoard(
  rows: number,
  cols: number,
  fill: StoneState = "empty",
): StoneState[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => fill),
  );
}

const initialBoard = createBoard(8, 8);

console.log(initialBoard);
