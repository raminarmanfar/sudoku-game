package com.sudoku.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sudoku_puzzle")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SudokuPuzzle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String difficulty;

    @Column(nullable = false, length = 81)
    private String puzzle;

    @Column(nullable = false, length = 81)
    private String solution;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** User's current in-progress board state (81 chars, 0 = not yet filled). */
    @Column(length = 81)
    private String progress;
}
