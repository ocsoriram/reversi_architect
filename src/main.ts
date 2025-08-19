import { TurnRecord } from "./dataAccess/turnRecord";
import { TurnGateway } from "./dataAccess/turnGateway";
import { GameRecord } from "./dataAccess/gameRecord";
import { GameGateway } from "./dataAccess/gameGateway";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
import { MoveGateway } from "./dataAccess/moveGateway";
import { SquareGateway } from "./dataAccess/squareGateway";

dotenv.config();

// 石の色を定義
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

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

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

// mysqlのコネクタ準備
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
app.use(express.json());

// 対戦開始の盤面を保存する
app.post("/api/games", async (req: Request, res: Response) => {
  const now = new Date();

  const conn = await connectMySQL();

  try {
    await conn.beginTransaction();

    const gameRecord = await gameGateway.insert(conn, now);

    const turnRecord = await turnGateway.insert(conn, gameRecord, 0, DARK, now);

    // const squareCount = initialBoard
    //   .map((line) => {
    //     return line.length; // 各行のマス目数(列数)を取り出す
    //   })
    //   .reduce((v1, v2) => v1 + v2, 0); // 全行分を足し合わせる

    await squareGateway.insertAll(conn, turnRecord, initialBoard);

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    await conn.end();
  }

  res.status(201).end();
});

//
app.get("/api/games/latest/turns/:turnCount", async (req, res) => {
  const turnCount = parseInt(req.params.turnCount);

  const conn = await connectMySQL();
  try {
    const gameRecord = await gameGateway.findLatest(conn);
    if (!gameRecord) {
      throw new Error("Latest game not found");
    }

    const turnRecord = await turnGateway.findByGameIdAndTurnCount(
      conn,
      gameRecord,
      turnCount,
    );
    if (!turnRecord) {
      throw Error("Latest turn not found");
    }

    const squareRecords = await squareGateway.findByTurnId(conn, turnRecord);

    if (!squareRecords) {
      throw Error("squareRecord is not found");
    }

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc;
    });

    const responseBody = {
      turnCount,
      board,
      nextDisc: turnRecord.next_disc,
      // TODO 決着がついている場合はgame_resultsから取得する
      winnerDisc: null,
    };

    res.json(responseBody);
  } catch (e) {
    throw e;
  } finally {
    await conn.end();
  }
});

app.post("/api/games/latest/turns", async (req, res) => {
  const turnCount = parseInt(req.body.turnCount);
  const disc = parseInt(req.body.move.disc);
  const x = parseInt(req.body.move.x);
  const y = parseInt(req.body.move.y);

  // 一つ前のターンの盤面の状態を取得する
  const conn = await connectMySQL();
  try {
    const gameRecord = await gameGateway.findLatest(conn);
    if (!gameRecord) {
      throw new Error("Latest game not found");
    }

    // 1ターン前の情報を取得
    const previousTurnCount = turnCount - 1;

    const previousTurnRecord = await turnGateway.findByGameIdAndTurnCount(
      conn,
      gameRecord,
      previousTurnCount,
    );
    if (!previousTurnRecord) {
      throw Error("Latest turn not found");
    }

    // 最新ターンの盤面の状態を取得

    const squareRecords = await squareGateway.findByTurnId(
      conn,
      previousTurnRecord,
    );
    if (!squareRecords) {
      throw Error("squareRecords is not found");
    }

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc;
    });

    // 盤面におけるかチェックする

    // 石を置く
    board[y][x] = disc;

    // ひっくり返す

    // ターンを保存する
    // 新しく作られたgamesテーブルの行のIDを取得

    const now = new Date();
    const nextDisc = disc === DARK ? LIGHT : DARK;

    const turnRecord = await turnGateway.insert(
      conn,
      gameRecord,
      turnCount,
      nextDisc,
      now,
    );

    await squareGateway.insertAll(conn, turnRecord, board);

    await moveGateway.insert(conn, turnRecord, disc, x, y);

    await conn.commit();
  } catch (e) {
    conn.rollback();
    throw e;
  } finally {
    await conn.end();
  }

  res.status(201).end();
});

// エラーハンドラは必ず全てのルート定義や通常ミドルウェアの後に置く。
// 理由: Expressは上から順にミドルウェアを実行し、
// エラーが発生すると「この位置以降にあるエラーハンドラ」を探して呼び出す仕組みだから。
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Reversi App has started: http://localhost:${PORT}`);
});
