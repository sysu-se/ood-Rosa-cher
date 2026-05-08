// src/domain/index.js
import { Sudoku } from './Sudoku';
import { Game } from './Game';

export function createSudoku(grid) {
  return new Sudoku(grid);
}

export function createSudokuFromJSON(json) {
  return Sudoku.fromJSON(json);
}

export function createGame({ sudoku }) {
  return new Game(sudoku);
}

export function createGameFromJSON(json) {
  return Game.fromJSON(json);
}
