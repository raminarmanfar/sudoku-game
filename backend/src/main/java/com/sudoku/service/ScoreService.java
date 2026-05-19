package com.sudoku.service;

import com.sudoku.dto.GameScoreDto;
import com.sudoku.dto.GameScoreRequest;
import com.sudoku.entity.GameScore;
import com.sudoku.repository.GameScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final GameScoreRepository scoreRepository;

    public GameScoreDto saveScore(GameScoreRequest request) {
        GameScore score = GameScore.builder()
                .playerName(request.getPlayerName())
                .difficulty(request.getDifficulty())
                .timeSeconds(request.getTimeSeconds())
                .build();
        GameScore saved = scoreRepository.save(score);
        return toDto(saved);
    }

    public List<GameScoreDto> getLeaderboard(String difficulty) {
        List<GameScore> scores = (difficulty != null && !difficulty.isBlank())
                ? scoreRepository.findTop50ByDifficultyOrderByTimeSecondsAsc(difficulty)
                : scoreRepository.findTop50ByOrderByTimeSecondsAsc();
        return scores.stream().map(this::toDto).toList();
    }

    private GameScoreDto toDto(GameScore score) {
        return GameScoreDto.builder()
                .id(score.getId())
                .playerName(score.getPlayerName())
                .difficulty(score.getDifficulty())
                .timeSeconds(score.getTimeSeconds())
                .completedAt(score.getCompletedAt())
                .build();
    }
}
