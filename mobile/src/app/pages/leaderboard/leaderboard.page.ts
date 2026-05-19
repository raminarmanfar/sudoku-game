import { Component, OnInit } from '@angular/core';
import { SudokuService, GameScore } from '../../services/sudoku.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: 'leaderboard.page.html',
  styleUrls: ['leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit {
  scores: GameScore[] = [];
  selectedDifficulty = '';
  difficulties = ['', 'easy', 'medium', 'hard'];
  isLoading = true;

  constructor(private sudokuService: SudokuService) {}

  ngOnInit(): void {
    this.loadScores();
  }

  loadScores(): void {
    this.isLoading = true;
    const diff = this.selectedDifficulty || undefined;
    this.sudokuService.getLeaderboard(diff).subscribe({
      next: (scores) => {
        this.scores = scores;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
