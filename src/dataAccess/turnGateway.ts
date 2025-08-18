import { GameRecord } from "./gameRecord";
import mysql2 from "mysql2/promise";
import { turnRecord } from "./turnRecord";

export class TurnGateway {
  async findLatest(
    conn: mysql2.Connection,
    gameRecord: GameRecord,
    turnCount: number,
  ): Promise<turnRecord> {
    // 最新ターンの情報を取得
    const turnSelectSql =
      "select id, game_id, turn_count, next_disc, end_at from turns where game_id = ? and turn_count = ? ";
    const turnSelectResult = await conn.execute<mysql2.RowDataPacket[]>(
      turnSelectSql,
      [gameRecord?.id, turnCount],
    );
    const turn = turnSelectResult[0][0];

    return new turnRecord(
      turn["id"],
      turn["game_id"],
      turn["turn_count"],
      turn["next_disc"],
      turn["end_at"],
    );
  }

  async insert(
    conn: mysql2.Connection,
    gameRecord: GameRecord,
    turnCount: number,
    nextDisc: number,
    endAt: Date,
  ): Promise<turnRecord> {
    const sql =
      "insert into turns (game_id, turn_count, next_disc, end_at) values (?,?,?,?)";
    const turnInsertResult = await conn.execute<mysql2.ResultSetHeader>(sql, [
      gameRecord.id,
      turnCount,
      nextDisc,
      endAt,
    ]);

    const turnId = turnInsertResult[0].insertId;

    return new turnRecord(turnId, gameRecord.id, turnCount, nextDisc, endAt);
  }
}
