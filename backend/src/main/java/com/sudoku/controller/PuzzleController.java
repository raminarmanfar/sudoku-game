package com.sudoku.controller;

import com.sudoku.dto.SudokuPuzzleDto;
import com.sudoku.dto.ValidateSolutionRequest;
import com.sudoku.service.PuzzleService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/puzzles")
@RequiredArgsConstructor
@Validated
public class PuzzleController {

    private final PuzzleService puzzleService;

    /** Generate a new random puzzle, save it to DB, return it. */
    @PostMapping("/generate")
    public ResponseEntity<SudokuPuzzleDto> generate(
            @RequestParam(defaultValue = "medium")
            @Pattern(regexp = "easy|medium|hard", message = "Difficulty must be easy, medium, or hard")
            String difficulty) {
        return ResponseEntity.ok(puzzleService.generateAndSave(difficulty));
    }

    /** List all saved puzzles (optional difficulty filter). */
    @GetMapping
    public ResponseEntity<List<SudokuPuzzleDto>> list(
            @RequestParam(required = false) String difficulty) {
        return ResponseEntity.ok(puzzleService.listPuzzles(difficulty));
    }

    /** Get a specific puzzle by id. */
    @GetMapping("/{id}")
    public ResponseEntity<SudokuPuzzleDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(puzzleService.getById(id));
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<Map<String, Boolean>> validate(
            @PathVariable Long id,
            @Valid @RequestBody ValidateSolutionRequest request) {
        boolean valid = puzzleService.validateSolution(id, request);
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        puzzleService.deletePuzzle(id);
        return ResponseEntity.noContent().build();
    }

    /** Save the user's current in-progress board state. */
    @PatchMapping("/{id}/progress")
    public ResponseEntity<SudokuPuzzleDto> saveProgress(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(puzzleService.saveProgress(id, body.get("progress")));
    }
}
