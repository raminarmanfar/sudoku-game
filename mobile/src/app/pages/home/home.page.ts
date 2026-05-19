import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SudokuService, SudokuPuzzle } from '../../services/sudoku.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  selectedDifficulty = 'medium';
  difficulties = ['easy', 'medium', 'hard'];
  puzzles: SudokuPuzzle[] = [];
  loading = false;
  generating = false;

  constructor(
    private router: Router,
    private sudokuService: SudokuService,
    private alertCtrl: AlertController,
  ) {}

  ngOnInit(): void {
    this.loadPuzzles();
  }

  ionViewWillEnter(): void {
    this.loadPuzzles();
  }

  loadPuzzles(): void {
    this.loading = true;
    this.sudokuService.listPuzzles().subscribe({
      next: (list) => { this.puzzles = list; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  newGame(): void {
    this.generating = true;
    this.sudokuService.generatePuzzle(this.selectedDifficulty).subscribe({
      next: (puzzle) => {
        this.generating = false;
        this.router.navigate(['/game'], { queryParams: { id: puzzle.id } });
      },
      error: () => {
        this.generating = false;
        // Fallback: navigate without an id so local generator is used
        this.router.navigate(['/game'], { queryParams: { difficulty: this.selectedDifficulty } });
      },
    });
  }

  continueGame(puzzle: SudokuPuzzle): void {
    this.router.navigate(['/game'], { queryParams: { id: puzzle.id } });
  }

  async deletePuzzle(puzzle: SudokuPuzzle, event: Event): Promise<void> {
    event.stopPropagation(); // prevent navigating into the puzzle
    const alert = await this.alertCtrl.create({
      header: 'Delete Puzzle',
      message: `Are you sure you want to delete Puzzle #${puzzle.id}? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          cssClass: 'alert-button-danger',
          handler: () => {
            this.sudokuService.deletePuzzle(puzzle.id!).subscribe({
              next: () => {
                this.puzzles = this.puzzles.filter((p) => p.id !== puzzle.id);
                localStorage.removeItem(`sudoku_progress_${puzzle.id}`);
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  goToLeaderboard(): void {
    this.router.navigate(['/leaderboard']);
  }

  puzzlesByDifficulty(diff: string): SudokuPuzzle[] {
    return this.puzzles.filter((p) => p.difficulty === diff);
  }

  difficultyColor(diff: string): string {
    return { easy: 'success', medium: 'warning', hard: 'danger' }[diff] ?? 'medium';
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  }
}
