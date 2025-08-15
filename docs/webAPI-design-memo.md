## ユースケースごとの機能一覧
- "対戦する"
  - 対戦を登録する

  POST /api/games

  - 現在の盤面を表示する

  GET /api/games

  GET /api/games/latest/boards/latest


  指定したターン数の"ターン"を取得する

  GET api/games/latest/turns/{turnCount}

  レスポンスボディ

  ```json
  {
    "turnCount": 1,
    "board" : [
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,1,2,0,0,0],
      [0,0,0,2,1,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
    ],
    "nextDisc": 1,
    "winnerDisc": 1,
  }
  ```

  - 石を打つ

  ターンを登録する

  POST /api/games/latest/turns

  リクエストボディ

  ```json
  {
    "turnCount": 1,
    "move": {
      "disk": 1,
      "x": 0,
      "y": 0,
    }

  }
  ```


  - 勝敗を表示する
  wiinerDiscとして扱う

- "自分の過去の対戦結果を表示する"

  対戦の一覧を取得する

  GET /api/games

  ```json
  {
    "games" : [
    {
      "id": 1,
      "winnerDisc": 1,
      "startAt": "YYYY-MM-DD hhh:mm:ss"
    },
    {
      "id": 2,
      "winnerDisc": 1,
      "startAt": "YYYY-MM-DD hhh:mm:ss"
    },

    ]

  }
  ```
