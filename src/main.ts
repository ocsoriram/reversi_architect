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

const connectMySQL = async () => {
  return await mysql2.createConnection({
    host: "localhost",
    database: "reversi",
    user: "reversi",
    password: process.env.PASSWORD,
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

// 対戦開始の盤面を保存する
app.post("/api/games", async (req: Request, res: Response) => {
  const now = new Date();

  const conn = await connectMySQL();

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

app.get("/api/games/latest/turns/:turnCount", async (req, res) => {
  const turnCount = parseInt(req.params.turnCount);

  const conn = await connectMySQL();
  try {
    // ゲームの情報を取得
    const gameSelectSql =
      "select id, started_at from games order by id desc limit 1";
    const gameSelectResult =
      await conn.execute<mysql2.RowDataPacket[]>(gameSelectSql);
    const game = gameSelectResult[0][0];

    // 最新ターンの情報を取得
    const turnSelectSql =
      "select id, game_id, turn_count, next_disc, end_at from turns where game_id = ? and turn_count = ? ";
    const turnSelectResult = await conn.execute<mysql2.RowDataPacket[]>(
      turnSelectSql,
      [game["id"], turnCount],
    );
    const turn = turnSelectResult[0][0];

    // 最新ターンの盤面の状態を取得
    const squareSelectSql =
      "SELECT id, turn_id, disc, x, y FROM squares WHERE turn_id = ?";
    const squaresSelectResult = await conn.execute<mysql2.RowDataPacket[]>(
      squareSelectSql,
      [turn["id"]],
    );
    // 最新ターンの盤面の石を設置
    const squares = squaresSelectResult[0];
    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
    squares.forEach((s) => {
      board[s.y][s.x] = s.disc;
    });

    const responseBody = {
      turnCount,
      board,
      nextDisc: turn["next_disc"],
      // TODO　決着がついている場合はgame__resultsから取得する
      winnerDisc: null,
    };

    res.json(responseBody);
  } catch (e) {
    throw e;
  } finally {
    await conn.end();
  }
});

// エラーハンドラは必ず全てのルート定義や通常ミドルウェアの後に置く。
// 理由: Expressは上から順にミドルウェアを実行し、
// エラーが発生すると「この位置以降にあるエラーハンドラ」を探して呼び出す仕組みだから。
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Reversi App has started: http://localhost:${PORT}`);
});
