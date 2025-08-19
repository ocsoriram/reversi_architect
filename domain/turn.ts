import { Board } from "./board";
import { Disc } from "./disc";
import { Move } from "./move";

export class TurnGateway {
  constructor(
    private _gameId1: number,
    private _turnCount: number,
    private _nextDisc: Disc,
    private _move: Move | undefined, // 最初のターンはmoveがない
    private _board: Board,
    private _endAt: Date,
  ) {}
}
