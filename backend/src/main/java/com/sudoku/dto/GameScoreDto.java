package com.sudoku.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GameScoreDto {
    private Long id;
    private String playerName;
    private String difficulty;
    private int timeSeconds;
    private LocalDateTime completedAt;
}
