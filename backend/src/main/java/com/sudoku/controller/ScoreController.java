package com.sudoku.controller;

import com.sudoku.dto.GameScoreDto;
import com.sudoku.dto.GameScoreRequest;
import com.sudoku.service.ScoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @PostMapping
    public ResponseEntity<GameScoreDto> saveScore(@Valid @RequestBody GameScoreRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scoreService.saveScore(request));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<GameScoreDto>> getLeaderboard(
            @RequestParam(required = false) String difficulty) {
        return ResponseEntity.ok(scoreService.getLeaderboard(difficulty));
    }
}
