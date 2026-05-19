package com.sudoku.repository;

import com.sudoku.entity.SudokuPuzzle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SudokuPuzzleRepository extends JpaRepository<SudokuPuzzle, Long> {

    @Query(value = "SELECT * FROM sudoku_puzzle WHERE difficulty = :difficulty ORDER BY RANDOM() LIMIT 1",
           nativeQuery = true)
    Optional<SudokuPuzzle> findRandomByDifficulty(@Param("difficulty") String difficulty);

    List<SudokuPuzzle> findByDifficultyOrderByCreatedAtDesc(String difficulty);

    List<SudokuPuzzle> findAllByOrderByCreatedAtDesc();
}
