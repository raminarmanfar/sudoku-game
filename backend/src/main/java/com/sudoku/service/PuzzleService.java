package com.sudoku.service;

import com.sudoku.dto.SudokuPuzzleDto;
import com.sudoku.dto.ValidateSolutionRequest;
import com.sudoku.entity.SudokuPuzzle;
import com.sudoku.repository.SudokuPuzzleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PuzzleService {

    private final SudokuPuzzleRepository puzzleRepository;
    private final SudokuGeneratorService generatorService;

    /** Generate a brand-new random puzzle, persist it, and return it. */
    public SudokuPuzzleDto generateAndSave(String difficulty) {
        SudokuGeneratorService.GeneratedPuzzle generated = generatorService.generate(difficulty);
        SudokuPuzzle entity = SudokuPuzzle.builder()
                .difficulty(difficulty)
                .puzzle(generated.puzzle())
                .solution(generated.solution())
                .build();
        return toDto(puzzleRepository.save(entity));
    }

    /** Fetch a specific puzzle by id. */
    public SudokuPuzzleDto getById(Long id) {
        SudokuPuzzle puzzle = puzzleRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Puzzle not found: " + id));
        return toDto(puzzle);
    }

    /** List all saved puzzles, optionally filtered by difficulty. */
    public List<SudokuPuzzleDto> listPuzzles(String difficulty) {
        List<SudokuPuzzle> puzzles = (difficulty != null && !difficulty.isBlank())
                ? puzzleRepository.findByDifficultyOrderByCreatedAtDesc(difficulty)
                : puzzleRepository.findAllByOrderByCreatedAtDesc();
        return puzzles.stream().map(this::toDto).toList();
    }

    public boolean validateSolution(Long puzzleId, ValidateSolutionRequest request) {
        SudokuPuzzle puzzle = puzzleRepository.findById(puzzleId)
                .orElseThrow(() -> new NoSuchElementException("Puzzle not found: " + puzzleId));
        return puzzle.getSolution().trim().equals(request.getSolution().trim());
    }

    public void deletePuzzle(Long id) {
        if (!puzzleRepository.existsById(id)) {
            throw new NoSuchElementException("Puzzle not found: " + id);
        }
        puzzleRepository.deleteById(id);
    }

    /** Persist the user's current in-progress board state. */
    public SudokuPuzzleDto saveProgress(Long puzzleId, String progress) {
        SudokuPuzzle puzzle = puzzleRepository.findById(puzzleId)
                .orElseThrow(() -> new NoSuchElementException("Puzzle not found: " + puzzleId));
        puzzle.setProgress(progress);
        return toDto(puzzleRepository.save(puzzle));
    }

    private SudokuPuzzleDto toDto(SudokuPuzzle puzzle) {
        return SudokuPuzzleDto.builder()
                .id(puzzle.getId())
                .difficulty(puzzle.getDifficulty())
                .puzzle(puzzle.getPuzzle())
                .progress(puzzle.getProgress())
                .createdAt(puzzle.getCreatedAt())
                .build();
    }
}
