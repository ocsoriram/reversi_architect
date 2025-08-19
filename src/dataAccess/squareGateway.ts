import mysql2 from "mysql2/promise";
import { TurnRecord } from "./turnRecord";
import { SquareRecord } from "./squareRecord";

export class SquareGateway {
  async findByTurnId(
    conn: mysql2.Connection,
    turnRecord: TurnRecord,
  ): Promise<SquareRecord[] | undefined> {
    const squareSelectSql =
      "SELECT id, turn_id, disc, x, y FROM squares WHERE turn_id = ?";
    const squaresSelectResult = await conn.execute<mysql2.RowDataPacket[]>(
      squareSelectSql,
      [turnRecord.id],
    );
    // 最新ターンの盤面の石を設置
    const records = squaresSelectResult[0];

    if (!records) {
      return undefined;
    }

    return records.map((r) => {
      return new SquareRecord(r["id"], r["turn_id"], r["disc"], r["x"], r["y"]);
    });
  }

  // TODO 引数board[][]は変だが一旦許容
  async insertAll(
    conn: mysql2.Connection,
    turnRecord: TurnRecord,
    board: number[][],
  ) {
    const squareCount = board
      .map((line) => {
        return line.length;
      })
      .reduce((v1, v2) => v1 + v2, 0);

    const squaresInsertSql =
      "insert into squares (turn_id, x, y, disc) values" +
      Array.from(Array(squareCount))
        .map(() => "(?,?,?,?)")
        .join(", ");

    const squaresInsertValues: any[] = [];
    board.forEach((line, y) => {
      line.forEach((disc, x) => {
        squaresInsertValues.push(turnRecord.id);
        squaresInsertValues.push(x);
        squaresInsertValues.push(y);
        squaresInsertValues.push(disc);
      });
    });

    await conn.execute(squaresInsertSql, squaresInsertValues);
  }
}
