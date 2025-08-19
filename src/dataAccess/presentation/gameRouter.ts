import express, { Request, Response } from "express";
import { GameGateway } from "../gameGateway";
import { TurnGateway } from "../turnGateway";
import { SquareGateway } from "../squareGateway";
import { connectMySQL } from "../connection";
import { DARK, initialBoard } from "../../application/constant";

// router:他FWの文脈でControllerの役割
export const gameRouter = express.Router();
const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();

// 対戦開始の盤面を保存する
gameRouter.post("/api/games", async (req: Request, res: Response) => {
  const now = new Date();

  const conn = await connectMySQL();

  try {
    await conn.beginTransaction();

    const gameRecord = await gameGateway.insert(conn, now);

    const turnRecord = await turnGateway.insert(conn, gameRecord, 0, DARK, now);

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
