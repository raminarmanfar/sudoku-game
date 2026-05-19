import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SudokuService, GameScore } from '../../services/sudoku.service';

interface Cell {
  value: number;
  fixed: boolean;
  error: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-game',
  templateUrl: 'game.page.html',
  styleUrls: ['game.page.scss'],
})
export class GamePage implements OnInit, OnDestroy {
  board: Cell[][] = [];
  difficulty = 'medium';
  selectedRow = -1;
  selectedCol = -1;
  elapsedSeconds = 0;
  timerInterval: ReturnType<typeof setInterval> | null = null;
  numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  puzzleId: number | undefined;

  private progressSave$ = new Subject<string>();
  private progressSub = this.progressSave$
    .pipe(debounceTime(800))
    .subscribe((progress) => {
      if (!this.puzzleId) return;
      this.sudokuService.saveProgress(this.puzzleId, progress).subscribe();
    });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sudokuService: SudokuService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'] ? Number(params['id']) : undefined;
      this.difficulty = params['difficulty'] ?? 'medium';
      if (id) {
        this.loadPuzzleById(id);
      } else {
        this.loadLocalPuzzle();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.progressSub.unsubscribe();
  }

  /** Load a saved puzzle from DB by id, restoring any in-progress moves. */
  loadPuzzleById(id: number): void {
    this.elapsedSeconds = Number(localStorage.getItem(`sudoku_timer_${id}`)) || 0;
    this.selectedRow = -1;
    this.selectedCol = -1;
    this.puzzleId = id;
    this.sudokuService.getPuzzleById(id).subscribe({
      next: (puzzle) => {
        this.difficulty = puzzle.difficulty;
        this.initBoardFromString(puzzle.puzzle);
        // Restore from DB progress if available, otherwise fall back to localStorage
        if (puzzle.progress) {
          this.restoreProgressFromString(puzzle.progress, puzzle.puzzle);
        } else {
          this.restoreProgressFromLocalStorage(id);
        }
        this.startTimer();
      },
      error: () => this.loadLocalPuzzle(),
    });
  }

  /** Generate a fresh puzzle locally (fallback when no id given or backend down). */
  loadLocalPuzzle(): void {
    this.elapsedSeconds = 0;
    this.selectedRow = -1;
    this.selectedCol = -1;
    this.puzzleId = undefined;
    const raw = this.sudokuService.generateBoard(this.difficulty);
    this.initBoardFromNumbers(raw);
    this.startTimer();
  }

  /** Called by the "My Puzzles" button on the game page. */
  loadPuzzle(): void {
    this.router.navigate(['/home']);
  }

  /** Persist user-entered cells to localStorage keyed by puzzleId. */
  private saveProgress(): void {
    if (!this.puzzleId || this.board.length === 0) return;
    this.progressSave$.next(this.boardToProgressString());
  }

  private boardToProgressString(): string {
    return this.board.map((row) => row.map((c) => c.value).join('')).join('');
  }

  /** Restore from an 81-char progress string (skips fixed cells). */
  private restoreProgressFromString(progress: string, original: string): void {
    const orig = original.split('').map(Number);
    const prog = progress.split('').map(Number);
    prog.forEach((val, idx) => {
      const r = Math.floor(idx / 9), c = idx % 9;
      if (orig[idx] === 0 && val !== 0 && this.board[r]?.[c]) {
        this.board[r][c].value = val;
      }
    });
    this.revalidateBoard();
  }

  /** Legacy restore from localStorage (fallback). */
  private restoreProgressFromLocalStorage(id: number): void {
    const raw = localStorage.getItem(`sudoku_progress_${id}`);
    if (!raw) return;
    const moves: Array<{ r: number; c: number; v: number }> = JSON.parse(raw);
    moves.forEach(({ r, c, v }) => {
      if (this.board[r]?.[c] && !this.board[r][c].fixed) {
        this.board[r][c].value = v;
      }
    });
    this.revalidateBoard();
  }

  /** Recalculate error flag for every user-entered cell. */
  private revalidateBoard(): void {
    this.board.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (!cell.fixed) {
          cell.error = cell.value !== 0 && !this.isCellValid(r, c, cell.value);
        }
      })
    );
  }

  private initBoardFromString(puzzleStr: string): void {
    const nums = puzzleStr.split('').map(Number);
    this.board = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ({
        value: nums[r * 9 + c],
        fixed: nums[r * 9 + c] !== 0,
        error: false,
        selected: false,
      }))
    );
  }

  private initBoardFromNumbers(raw: number[][]): void {
    this.board = raw.map((row) =>
      row.map((val) => ({ value: val, fixed: val !== 0, error: false, selected: false }))
    );
  }

  selectCell(row: number, col: number): void {
    this.selectedRow = row;
    this.selectedCol = col;
    this.board.forEach((r, ri) =>
      r.forEach((c, ci) => (c.selected = ri === row && ci === col))
    );
  }

  get isFixedSelected(): boolean {
    if (this.selectedRow < 0 || this.selectedCol < 0) return false;
    return this.board[this.selectedRow]?.[this.selectedCol]?.fixed ?? false;
  }

  get selectedValue(): number {
    if (this.selectedRow < 0 || this.selectedCol < 0) return 0;
    return this.board[this.selectedRow]?.[this.selectedCol]?.value ?? 0;
  }

  inputNumber(num: number): void {
    if (this.selectedRow < 0 || this.selectedCol < 0) return;
    const cell = this.board[this.selectedRow][this.selectedCol];
    if (cell.fixed) return;
    cell.value = num;
    cell.error = !this.isCellValid(this.selectedRow, this.selectedCol, num);
    if (cell.error) {
      this.showWrongAnswerToast();
    }
    this.saveProgress();
    this.checkCompletion();
  }

  clearCell(): void {
    if (this.selectedRow < 0 || this.selectedCol < 0) return;
    const cell = this.board[this.selectedRow][this.selectedCol];
    if (!cell.fixed) {
      cell.value = 0;
      cell.error = false;
      this.saveProgress();
    }
  }

  private async showWrongAnswerToast(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: '❌ Wrong number! This conflicts with another cell.',
      duration: 2000,
      position: 'top',
      color: 'danger',
      icon: 'close-circle-outline',
    });
    await toast.present();
  }

  private isCellValid(row: number, col: number, num: number): boolean {
    if (num === 0) return true;
    for (let i = 0; i < 9; i++) {
      if (i !== col && this.board[row][i].value === num) return false;
      if (i !== row && this.board[i][col].value === num) return false;
    }
    const sr = Math.floor(row / 3) * 3;
    const sc = Math.floor(col / 3) * 3;
    for (let r = sr; r < sr + 3; r++) {
      for (let c = sc; c < sc + 3; c++) {
        if ((r !== row || c !== col) && this.board[r][c].value === num) return false;
      }
    }
    return true;
  }

  private checkCompletion(): void {
    const complete = this.board.every((row) => row.every((cell) => cell.value !== 0 && !cell.error));
    if (complete) this.onComplete();
  }

  private async onComplete(): Promise<void> {
    this.stopTimer();
    if (this.puzzleId) {
      localStorage.removeItem(`sudoku_timer_${this.puzzleId}`);
    }
    const alert = await this.alertCtrl.create({
      header: 'Puzzle Complete! 🎉',
      message: `You solved the ${this.difficulty} puzzle in ${this.formatTime(this.elapsedSeconds)}!`,
      inputs: [{ name: 'playerName', placeholder: 'Enter your name', type: 'text' }],
      buttons: [
        { text: 'Skip', role: 'cancel', handler: () => this.router.navigate(['/home']) },
        {
          text: 'Save Score',
          handler: (data) => {
            const score: GameScore = {
              playerName: data.playerName || 'Anonymous',
              difficulty: this.difficulty,
              timeSeconds: this.elapsedSeconds,
            };
            this.sudokuService.saveScore(score).subscribe();
            this.router.navigate(['/leaderboard']);
          },
        },
      ],
    });
    await alert.present();
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      if (this.puzzleId) {
        localStorage.setItem(`sudoku_timer_${this.puzzleId}`, String(this.elapsedSeconds));
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get boxBorder(): (row: number, col: number) => boolean {
    return (row, col) => col % 3 === 0 && col !== 0;
  }
}
