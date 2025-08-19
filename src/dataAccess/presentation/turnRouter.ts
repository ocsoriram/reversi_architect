import express, { Request, Response } from "express";
import { GameGateway } from "../gameGateway";
import { TurnGateway } from "../turnGateway";
import { SquareGateway } from "../squareGateway";
import { MoveGateway } from "../moveGateway";
import { connectMySQL } from "../connection";
import { DARK, LIGHT } from "../../application/constant";

export const turnRouter = express.Router();
const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

turnRouter.get("/api/games/latest/turns/:turnCount", async (req, res) => {
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

turnRouter.post("/api/games/latest/turns", async (req, res) => {
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
