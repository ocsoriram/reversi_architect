export class turnRecord {
  constructor(
    private _id: number,
    private _game_id: number,
    private _turn_count: number,
    private _next_disc: number,
    private _end_at: Date,
  ) {}

  get id() {
    return this._id;
  }

  get game_id() {
    return this._game_id;
  }

  get turn_count() {
    return this._turn_count;
  }

  get next_disc() {
    return this._next_disc;
  }

  get end_at() {
    return this._end_at;
  }
}
