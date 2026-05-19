package com.sudoku.repository;

import com.sudoku.entity.GameScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameScoreRepository extends JpaRepository<GameScore, Long> {

    List<GameScore> findTop50ByOrderByTimeSecondsAsc();

    List<GameScore> findTop50ByDifficultyOrderByTimeSecondsAsc(String difficulty);
}
