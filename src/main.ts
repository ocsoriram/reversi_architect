import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import "express-async-errors";

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
  const startedAt = new Date();
  console.log("StartDate:", startedAt);

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
