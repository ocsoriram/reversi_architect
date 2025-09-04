import { Board } from "./board";
import { Disc } from "./disc";
import { Move } from "./move";
import { Point } from "./point";

export class Turn {
  constructor(
    private _gameId: number,
    private _turnCount: number,
    private _nextDisc: Disc,
    private _move: Move | undefined, // 最初のターンはmoveがない
    private _board: Board,
    private _endAt: Date,
  ) {}

  placeNext(disc: Disc, point: Point): Turn {
    const move = new Move(disc, point);
    // 打とうとした石が次の石ではない場合、置くことができない(連続禁止)
    if (disc !== this._nextDisc) {
      throw new Error("Invalid Disc");
    }

    const nextBoard = this._board.place(move);
    // 次の石が置けない場合はスキップ処理
    const nextDisc = disc === Disc.Dark ? Disc.Light : Disc.Dark;

    return new Turn(
      this._gameId,
      this._turnCount + 1,
      nextDisc,
      move,
      nextBoard,
      new Date(),
    );
  }
}
