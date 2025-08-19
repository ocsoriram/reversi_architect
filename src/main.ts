import { TurnRecord } from "./dataAccess/turnRecord";
import { GameRecord } from "./dataAccess/gameRecord";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
import { GameGateway } from "./dataAccess/gameGateway";
import { MoveGateway } from "./dataAccess/moveGateway";
import { SquareGateway } from "./dataAccess/squareGateway";
import { TurnGateway } from "./dataAccess/turnGateway";
import { gameRouter } from "./dataAccess/presentation/gameRouter";
import { connectMySQL } from "./dataAccess/connection";
import * as constant from "./application/constant";
import { turnRouter } from "./dataAccess/presentation/turnRouter";

dotenv.config();

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

app.use(morgan("dev"));
// static dirへのアクセスを許可　".html"を無視してアクセスできる
// 例　http://localhost:3000/hoge → static/hoge.html
app.use(express.static("static", { extensions: ["html"] }));
app.use(express.json());

// プレゼンテーション層の読み込み
app.use(gameRouter);
app.use(turnRouter);

// エラーハンドラは必ず全てのルート定義や通常ミドルウェアの後に置く。
// 理由: Expressは上から順にミドルウェアを実行し、
// エラーが発生すると「この位置以降にあるエラーハンドラ」を探して呼び出す仕組みだから。
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Reversi App has started: http://localhost:${PORT}`);
});
