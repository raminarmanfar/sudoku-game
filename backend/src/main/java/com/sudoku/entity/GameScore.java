package com.sudoku.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_score")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "player_name", nullable = false, length = 100)
    private String playerName;

    @Column(nullable = false, length = 10)
    private String difficulty;

    @Column(name = "time_seconds", nullable = false)
    private Integer timeSeconds;

    @CreationTimestamp
    @Column(name = "completed_at", nullable = false, updatable = false)
    private LocalDateTime completedAt;
}
