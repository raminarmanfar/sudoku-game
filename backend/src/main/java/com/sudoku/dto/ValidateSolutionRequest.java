package com.sudoku.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ValidateSolutionRequest {
    @NotBlank
    @Pattern(regexp = "[1-9]{81}", message = "Solution must be 81 digits (1-9)")
    private String solution;
}
