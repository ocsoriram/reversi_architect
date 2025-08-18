const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

// let initialBoard = [];

// for (let col = 0; col < 8; col++) {
//   let boardRow = [];
//   for (let row = 0; row < 8; row++) {
//     boardRow.push(EMPTY);
//   }
//   initialBoard.push(boardRow);
// }

// // 初期stone配置
// initialBoard[3][3] = DARK;
// initialBoard[4][3] = LIGHT;
// initialBoard[3][4] = LIGHT;
// initialBoard[4][4] = DARK;

const boardElement = document.querySelector("#board");

const showBoard = async () => {
  const turnCount = 0;
  const response = await fetch(`/api/games/latest/turns/${turnCount}`);
  const responseBody = await response.json();
  const board = responseBody.board;
  console.log(board);

  // 子要素が存在すれば全て削除する
  while (boardElement.firstChild) {
    boardElement.removeChild(boardElement.firstChild);
  }
  // 盤面を作成
  board.forEach((line) => {
    line.forEach((square) => {
      // <div class="square">
      const squareElement = document.createElement("div");
      squareElement.className = "square";

      // <div class="stone dark">
      if (square !== EMPTY) {
        const stoneElement = document.createElement("div");
        const color = square === DARK ? "dark" : "light";
        stoneElement.className = `stone ${color}`;

        squareElement.appendChild(stoneElement);
      }

      boardElement.appendChild(squareElement);
    });
  });
};

const registerGame = async () => {
  await fetch("/api/games", {
    method: "POST",
  });
};

const showStone = async (initialBoard) => {};

const main = async () => {
  await showBoard();
  await showStone(board);
  await registerGame();
};

main();
