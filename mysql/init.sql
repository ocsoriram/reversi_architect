drop database if exists reversi;

create database reversi;

use reversi;


-- オセロゲームデータベース MySQL DDL

-- ゲームテーブル
CREATE TABLE games (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ターンテーブル
CREATE TABLE turns (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    game_id BIGINT NOT NULL,
    turn_count INT NOT NULL,
    next_disc TINYINT NOT NULL CHECK (next_disc IN (1, 2)), -- 1: 黒, 2: 白
    end_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 外部キー制約
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE ON UPDATE CASCADE,

    -- ユニーク制約（1ゲーム内で同じターン番号は重複不可）
    UNIQUE KEY uk_turns_game_turn (game_id, turn_count)
);

-- 盤面状態テーブル
CREATE TABLE squares (
    turn_id BIGINT NOT NULL,
    x TINYINT NOT NULL CHECK (x >= 0 AND x <= 7), -- 0-7の8x8盤面
    y TINYINT NOT NULL CHECK (y >= 0 AND y <= 7),
    disc TINYINT NOT NULL CHECK (disc IN (0, 1, 2)), -- 0: 空, 1: 黒, 2: 白
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 複合主キー（ターン内で同じ座標は1つだけ）
    PRIMARY KEY (turn_id, x, y),

    -- 外部キー制約
    FOREIGN KEY (turn_id) REFERENCES turns(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 着手テーブル
CREATE TABLE moves (
    turn_id BIGINT NOT NULL,
    disc TINYINT NOT NULL CHECK (disc IN (1, 2)), -- 1: 黒, 2: 白
    x TINYINT NOT NULL CHECK (x >= 0 AND x <= 7),
    y TINYINT NOT NULL CHECK (y >= 0 AND y <= 7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 主キー（1ターンに1つの着手のみ）
    PRIMARY KEY (turn_id),

    -- 外部キー制約
    FOREIGN KEY (turn_id) REFERENCES turns(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ゲーム結果テーブル
CREATE TABLE game_results (
    game_id BIGINT NOT NULL,
    winner_disc TINYINT CHECK (winner_disc IN (0, 1, 2)), -- 0: 引き分け, 1: 黒勝利, 2: 白勝利
    end_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    black_score TINYINT DEFAULT 0 CHECK (black_score >= 0 AND black_score <= 64),
    white_score TINYINT DEFAULT 0 CHECK (white_score >= 0 AND white_score <= 64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 主キー（1ゲームに1つの結果のみ）
    PRIMARY KEY (game_id),

    -- 外部キー制約
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- インデックス（パフォーマンス最適化用）
CREATE INDEX idx_turns_game_id ON turns(game_id);
CREATE INDEX idx_turns_end_at ON turns(end_at);
CREATE INDEX idx_squares_turn_id ON squares(turn_id);
CREATE INDEX idx_moves_turn_id ON moves(turn_id);
CREATE INDEX idx_game_results_end_at ON game_results(end_at);
CREATE INDEX idx_games_started_at ON games(started_at);

-- 動作確認
select 'OK' as result;
