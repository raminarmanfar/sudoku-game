-- V4__add_progress.sql
-- Stores the user's in-progress board state (81 chars, 0 = empty)
ALTER TABLE sudoku_puzzle ADD COLUMN progress VARCHAR(81);
