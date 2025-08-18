import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const EMPTY: number = 0;
const DARK: number = 1;
const LIGHT: number = 2;

let initialBoard: number[][] = [];

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

const PORT = "3000";

const app = express();

const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("unexpected error occurred", err);
  res.status(500).send({
    message: "unexpected error occurred",
  });
};

app.use(morgan("dev"));
// static dirへのアクセスを許可　".html"を無視してアクセスできる
// 例　http://localhost:3000/hoge → static/hoge.html
app.use(express.static("static", { extensions: ["html"] }));

// express動作確認用エンドポイント
app.get("/api/hello", async (req: Request, res: Response) => {
  res.json({
    message: "Hello Express!!",
  });
});

// 対戦するエンドポイント
app.post("/api/games", async (req: Request, res: Response) => {
  const now = new Date();
  // console.log("StartDate:", now);
  const conn = await mysql2.createConnection({
    host: "localhost",
    database: "reversi",
    user: "reversi",
    password: process.env.PASSWORD,
  });

  try {
    await conn.beginTransaction();

    const gameInsertResult = await conn.execute<mysql2.ResultSetHeader>(
      "insert into games (started_at) values (?)",
      [now],
    );
    // 新しく作られたgamesテーブルの行のIDを取得
    const gameId = gameInsertResult[0].insertId;

    const turnInsertResult = await conn.execute<mysql2.ResultSetHeader>(
      "insert into turns (game_id, turn_count, next_disc, end_at) values (?,?,?,?)",
      [gameId, 0, DARK, now],
    );

    const turnId = turnInsertResult[0].insertId;

    const squareCount = initialBoard
      .map((line) => {
        return line.length;
      })
      .reduce((v1, v2) => v1 + v2, 0);

    const squaresInsertSql =
      "insert into squares (turn_id, x, y, disc) values" +
      Array.from(Array(squareCount))
        .map(() => "(?,?,?,?)")
        .join(", ");

    const squaresInsertValues: any[] = [];
    initialBoard.forEach((line, y) => {
      line.forEach((disc, x) => {
        squaresInsertValues.push(turnId);
        squaresInsertValues.push(x);
        squaresInsertValues.push(y);
        squaresInsertValues.push(disc);
      });
    });

    await conn.execute(squaresInsertSql, squaresInsertValues);

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    await conn.end();
  }

  res.status(201).end();
});

// エラーハンドリング設定確認用エンドポイント
app.get("/api/error", async (req: Request, res: Response) => {
  throw new Error("Error endpoint");
});

// エラーハンドラは必ず全てのルート定義や通常ミドルウェアの後に置く。
// 理由: Expressは上から順にミドルウェアを実行し、
// エラーが発生すると「この位置以降にあるエラーハンドラ」を探して呼び出す仕組みだから。
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Reversi App has started: http://localhost:${PORT}`);
});
