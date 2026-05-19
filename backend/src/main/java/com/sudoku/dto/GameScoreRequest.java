package com.sudoku.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class GameScoreRequest {

    @NotBlank(message = "Player name is required")
    private String playerName;

    @NotBlank(message = "Difficulty is required")
    @Pattern(regexp = "easy|medium|hard", message = "Difficulty must be easy, medium, or hard")
    private String difficulty;

    @Min(value = 1, message = "Time must be positive")
    private int timeSeconds;
}
