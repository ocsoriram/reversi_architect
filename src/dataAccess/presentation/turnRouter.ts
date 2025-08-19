import express, { Request, Response } from "express";
import { GameGateway } from "../gameGateway";
import { TurnGateway } from "../turnGateway";
import { SquareGateway } from "../squareGateway";
import { MoveGateway } from "../moveGateway";
import { connectMySQL } from "../connection";
import { DARK, LIGHT } from "../../application/constant";
import { TurnService } from "../../application/turnService";

export const turnRouter = express.Router();

const turnService = new TurnService();

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

turnRouter.get("/api/games/latest/turns/:turnCount", async (req, res) => {
  const turnCount = parseInt(req.params.turnCount);
  const output = await turnService.findLatestGameTurnByTurnCount(turnCount);

  res.json(output);
});

turnRouter.post("/api/games/latest/turns", async (req, res) => {
  const turnCount = parseInt(req.body.turnCount);
  const disc = parseInt(req.body.move.disc);
  const x = parseInt(req.body.move.x);
  const y = parseInt(req.body.move.y);

  await turnService.registerTurn(turnCount, disc, x, y);

  res.status(201).end();
});
