import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GameScore {
  id?: number;
  playerName: string;
  difficulty: string;
  timeSeconds: number;
  completedAt?: string;
}

export interface SudokuPuzzle {
  id?: number;
  difficulty: string;
  puzzle: string;
  solution: string;
  progress?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SudokuService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Generate a new puzzle on the backend, save it to DB, return it. */
  generatePuzzle(difficulty: string): Observable<SudokuPuzzle> {
    return this.http.post<SudokuPuzzle>(`${this.apiUrl}/puzzles/generate?difficulty=${difficulty}`, {});
  }

  /** List all saved puzzles (optional difficulty filter). */
  listPuzzles(difficulty?: string): Observable<SudokuPuzzle[]> {
    const params = difficulty ? `?difficulty=${difficulty}` : '';
    return this.http.get<SudokuPuzzle[]>(`${this.apiUrl}/puzzles${params}`);
  }

  /** Get a specific puzzle by id. */
  getPuzzleById(id: number): Observable<SudokuPuzzle> {
    return this.http.get<SudokuPuzzle>(`${this.apiUrl}/puzzles/${id}`);
  }

  /** Delete a puzzle by id. */
  deletePuzzle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/puzzles/${id}`);
  }

  /** Save in-progress board state to the backend. */
  saveProgress(id: number, progress: string): Observable<SudokuPuzzle> {
    return this.http.patch<SudokuPuzzle>(`${this.apiUrl}/puzzles/${id}/progress`, { progress });
  }

  saveScore(score: GameScore): Observable<GameScore> {
    return this.http.post<GameScore>(`${this.apiUrl}/scores`, score);
  }

  getLeaderboard(difficulty?: string): Observable<GameScore[]> {
    const params = difficulty ? `?difficulty=${difficulty}` : '';
    return this.http.get<GameScore[]>(`${this.apiUrl}/scores/leaderboard${params}`);
  }

  validateSolution(puzzleId: number, solution: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/puzzles/${puzzleId}/validate`, { solution });
  }

  generateBoard(difficulty: string): number[][] {
    // Local fallback puzzle generator (simplified)
    const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.fillBoard(board);
    this.removeNumbers(board, difficulty);
    return board;
  }

  private fillBoard(board: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of nums) {
            if (this.isValid(board, row, col, num)) {
              board[row][col] = num;
              if (this.fillBoard(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (board[r][c] === num) return false;
      }
    }
    return true;
  }

  private removeNumbers(board: number[][], difficulty: string): void {
    const removals: Record<string, number> = { easy: 30, medium: 45, hard: 55 };
    let count = removals[difficulty] ?? 40;
    while (count > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (board[row][col] !== 0) {
        board[row][col] = 0;
        count--;
      }
    }
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
