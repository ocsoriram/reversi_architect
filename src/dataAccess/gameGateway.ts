import { Connection } from "./../../node_modules/mysql2/index.d";
import mysql2 from "mysql2/promise";
import { GameRecord } from "./gameRecord";

export class GameGateway {
  // 最新のgamesレコードの値を取得する.
  async findLatest(conn: mysql2.Connection): Promise<GameRecord | undefined> {
    const gameSelectSql =
      "select id, started_at from games order by id desc limit 1";
    const gameSelectResult =
      await conn.execute<mysql2.RowDataPacket[]>(gameSelectSql);
    const record = gameSelectResult[0][0];

    if (!record) {
      return undefined;
    }

    return new GameRecord(record["id"], record["started_at"]);
  }

  // gamesに値を保存するメソッド
  async insert(conn: mysql2.Connection, startedAt: Date): Promise<GameRecord> {
    const gameInsertSql = "insert into games (started_at) values (?)";
    const gameInsertResult = await conn.execute<mysql2.ResultSetHeader>(
      gameInsertSql,
      [startedAt],
    );
    // 新しく作られたgamesテーブルの行のIDを取得
    const gameId = gameInsertResult[0].insertId;

    return new GameRecord(gameId, startedAt);
  }
}
