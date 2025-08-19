export class GameResultRecord {
  constructor(
    private _id: number,
    private _game_id: number,
    private _winner_disc: number,
    private _end_at: number,
  ) {}

  get id() {
    return this._id;
  }

  get game_id() {
    return this._game_id;
  }

  get winner_disc() {
    return this._winner_disc;
  }

  get end_at() {
    return this._end_at;
  }
}
