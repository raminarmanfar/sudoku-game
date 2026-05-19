-- V1__init_schema.sql
CREATE TABLE IF NOT EXISTS sudoku_puzzle (
    id          BIGSERIAL PRIMARY KEY,
    difficulty  VARCHAR(10)  NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    puzzle      VARCHAR(81)  NOT NULL,
    solution    VARCHAR(81)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_score (
    id           BIGSERIAL PRIMARY KEY,
    player_name  VARCHAR(100) NOT NULL,
    difficulty   VARCHAR(10)  NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    time_seconds INTEGER      NOT NULL CHECK (time_seconds > 0),
    completed_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_game_score_difficulty ON game_score(difficulty);
CREATE INDEX idx_game_score_time       ON game_score(time_seconds);
