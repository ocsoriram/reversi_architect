import { connectMySQL } from "../dataAccess/connection";
import { GameGateway } from "../dataAccess/gameGateway";
import { SquareGateway } from "../dataAccess/squareGateway";
import { TurnGateway } from "../dataAccess/turnGateway";
import { DARK, initialBoard } from "./constant";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();
export class GameService {
  async startNewGame() {
    const conn = await connectMySQL();
    const now = new Date();

    try {
      await conn.beginTransaction();

      const gameRecord = await gameGateway.insert(conn, now);

      const turnRecord = await turnGateway.insert(
        conn,
        gameRecord,
        0,
        DARK,
        now,
      );

      await squareGateway.insertAll(conn, turnRecord, initialBoard);

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      await conn.end();
    }
  }
}
