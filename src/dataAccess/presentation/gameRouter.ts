import express, { Request, Response } from "express";
import { GameGateway } from "../gameGateway";
import { TurnGateway } from "../turnGateway";
import { SquareGateway } from "../squareGateway";
import { connectMySQL } from "../connection";
import { DARK, initialBoard } from "../../application/constant";
import { GameService } from "../../application/gameService";

// router:他FWの文脈でControllerの役割
export const gameRouter = express.Router();
const gameService = new GameService();

// 対戦開始の盤面を保存する
gameRouter.post("/api/games", async (req: Request, res: Response) => {
  await gameService.startNewGame();
  res.status(201).end();
});
