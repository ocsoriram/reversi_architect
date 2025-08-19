export class MoveRecord {
  constructor(
    private _id: number,
    private _turn_id: number,
    private _disc: number,
    private _x: number,
    private _y: Date,
  ) {}

  get id() {
    return this._id;
  }

  get turn_id() {
    return this._turn_id;
  }

  get disc() {
    return this._disc;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }
}
