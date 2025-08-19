import { Connection } from "./../../node_modules/mysql2/index.d";
import mysql2 from "mysql2/promise";
import { TurnRecord } from "./turnRecord";
export class MoveGateway {
  async insert(
    conn: mysql2.Connection,
    turnRecord: TurnRecord,
    disc: number,
    x: number,
    y: number,
  ) {
    const insertMovesSql =
      "INSERT INTO moves (turn_id, disc, x, y) VALUES(?,?,?,?)";

    await conn.execute(insertMovesSql, [turnRecord.id, disc, x, y]);
  }
}
