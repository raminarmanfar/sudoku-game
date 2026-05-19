package com.sudoku.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SudokuPuzzleDto {
    private Long id;
    private String difficulty;
    private String puzzle;
    private String progress;
    private LocalDateTime createdAt;
}
