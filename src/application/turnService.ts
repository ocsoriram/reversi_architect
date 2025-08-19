import express, { Request, Response } from "express";
import { GameGateway } from "../dataAccess/gameGateway";
import { TurnGateway } from "../dataAccess/turnGateway";
import { SquareGateway } from "../dataAccess/squareGateway";
import { connectMySQL } from "../dataAccess/connection";
import { DARK, LIGHT } from "./constant";
import { MoveGateway } from "../dataAccess/moveGateway";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

export class FindLatestGameTurnByTurnCountOutputDTO {
  constructor(
    private _turnCount: number,
    private _board: number[][],
    private _nextDisc: number | undefined,
    private _winnerDisc: number | undefined,
  ) {}

  get turnCount() {
    return this._turnCount;
  }

  get board() {
    return this._board;
  }

  get nextDisc() {
    return this._nextDisc;
  }

  get winnerDisc() {
    return this._winnerDisc;
  }
}

/**
 * turnを扱うクラス
 */
export class TurnService {
  /**
   *　turnCountから最新のターンを取得する
   * @param turnCount これまでの経過ターン
   * @returns
   * {
        turnCount,
        board,
        nextDisc: turnRecord.next_disc,
        winnerDisc: null,
      }
   */
  async findLatestGameTurnByTurnCount(
    turnCount: number,
  ): Promise<FindLatestGameTurnByTurnCountOutputDTO> {
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

      return new FindLatestGameTurnByTurnCountOutputDTO(
        turnCount,
        board,
        turnRecord.next_disc,
        undefined,
      );
    } catch (e) {
      throw e;
    } finally {
      await conn.end();
    }
  }

  async registerTurn(turnCount: number, disc: number, x: number, y: number) {
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
  }
}
