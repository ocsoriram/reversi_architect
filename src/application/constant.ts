// 石の色を定義
export const EMPTY: number = 0;
export const DARK: number = 1;
export const LIGHT: number = 2;

export let initialBoard: number[][] = [];

for (let col = 0; col < 8; col++) {
  let boardRow: number[] = [];
  for (let row = 0; row < 8; row++) {
    boardRow.push(EMPTY);
  }
  initialBoard.push(boardRow);
}

// 初期stone配置
initialBoard[3][3] = DARK;
initialBoard[4][3] = LIGHT;
initialBoard[3][4] = LIGHT;
initialBoard[4][4] = DARK;
