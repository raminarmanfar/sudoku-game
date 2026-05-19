package com.sudoku.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Service
public class SudokuGeneratorService {

    public record GeneratedPuzzle(String puzzle, String solution) {}

    public GeneratedPuzzle generate(String difficulty) {
        int[][] board = new int[9][9];
        fillBoard(board, new Random());
        String solution = boardToString(board);
        int[][] puzzle = copyBoard(board);
        removeNumbers(puzzle, difficulty, new Random());
        return new GeneratedPuzzle(boardToString(puzzle), solution);
    }

    private boolean fillBoard(int[][] board, Random rng) {
        for (int row = 0; row < 9; row++) {
            for (int col = 0; col < 9; col++) {
                if (board[row][col] == 0) {
                    List<Integer> nums = shuffled(rng);
                    for (int num : nums) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (fillBoard(board, rng)) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    private boolean isValid(int[][] board, int row, int col, int num) {
        for (int i = 0; i < 9; i++) {
            if (board[row][i] == num || board[i][col] == num) return false;
        }
        int sr = (row / 3) * 3, sc = (col / 3) * 3;
        for (int r = sr; r < sr + 3; r++)
            for (int c = sc; c < sc + 3; c++)
                if (board[r][c] == num) return false;
        return true;
    }

    private void removeNumbers(int[][] board, String difficulty, Random rng) {
        int removals = switch (difficulty) {
            case "easy" -> 30;
            case "hard" -> 55;
            default -> 45; // medium
        };
        while (removals > 0) {
            int row = rng.nextInt(9);
            int col = rng.nextInt(9);
            if (board[row][col] != 0) {
                board[row][col] = 0;
                removals--;
            }
        }
    }

    private List<Integer> shuffled(Random rng) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6, 7, 8, 9));
        Collections.shuffle(nums, rng);
        return nums;
    }

    private String boardToString(int[][] board) {
        StringBuilder sb = new StringBuilder(81);
        for (int[] row : board)
            for (int cell : row)
                sb.append(cell);
        return sb.toString();
    }

    private int[][] copyBoard(int[][] board) {
        int[][] copy = new int[9][9];
        for (int i = 0; i < 9; i++)
            copy[i] = board[i].clone();
        return copy;
    }
}
