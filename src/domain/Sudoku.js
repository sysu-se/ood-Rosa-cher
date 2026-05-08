// src/domain/Sudoku.js
import { BOX_SIZE, SUDOKU_SIZE } from '@sudoku/constants';

export class Sudoku {
  constructor(grid) {
    // 深拷贝初始盘面
    this.grid = grid.map(row => [...row]);
    this.initialGrid = grid.map(row => [...row]); // 保存初始给定数字（0表示未填）
  }

  getGrid() {
    return this.grid.map(row => [...row]);
  }

  // 获取指定位置的值
  getCell(row, col) {
    return this.grid[row][col];
  }

  // 尝试填入数字，返回是否合法（不违反规则）
  guess(row, col, value) {
    // 如果该位置是初始给定的数字（非0），不可修改
    if (this.initialGrid[row][col] !== 0) return false;
    // 检查值是否合法（1-9）
    if (value < 1 || value > 9) return false;
    // 检查行、列、宫是否冲突
    if (!this.isValidMove(row, col, value)) return false;
    this.grid[row][col] = value;
    return true;
  }

  // 检查移动是否合法（不产生冲突）
  isValidMove(row, col, value) {
    // 行
    for (let c = 0; c < SUDOKU_SIZE; c++) {
      if (c !== col && this.grid[row][c] === value) return false;
    }
    // 列
    for (let r = 0; r < SUDOKU_SIZE; r++) {
      if (r !== row && this.grid[r][col] === value) return false;
    }
    // 宫
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    for (let r = 0; r < BOX_SIZE; r++) {
      for (let c = 0; c < BOX_SIZE; c++) {
        const rr = boxRow + r;
        const cc = boxCol + c;
        if (rr !== row && cc !== col && this.grid[rr][cc] === value) return false;
      }
    }
    return true;
  }

  // 获取某个位置的所有候选数字
  getCandidates(row, col) {
    if (this.grid[row][col] !== 0) return [];
    const candidates = [];
    for (let v = 1; v <= 9; v++) {
      if (this.isValidMove(row, col, v)) candidates.push(v);
    }
    return candidates;
  }

  // 获取下一个最确定的提示（唯一候选数的格子）
  getNextHint() {
    let bestRow = -1, bestCol = -1;
    let minCandidates = 10;
    for (let r = 0; r < SUDOKU_SIZE; r++) {
      for (let c = 0; c < SUDOKU_SIZE; c++) {
        if (this.grid[r][c] === 0) {
          const cands = this.getCandidates(r, c);
          if (cands.length === 1) {
            return { row: r, col: c, value: cands[0], reason: '唯一候选数' };
          }
          if (cands.length < minCandidates) {
            minCandidates = cands.length;
            bestRow = r;
            bestCol = c;
          }
        }
      }
    }
    if (bestRow !== -1) {
      return { row: bestRow, col: bestCol, candidates: this.getCandidates(bestRow, bestCol), reason: '候选数最少' };
    }
    return null;
  }

  // 检查盘面是否完整且无冲突
  isComplete() {
    for (let r = 0; r < SUDOKU_SIZE; r++) {
      for (let c = 0; c < SUDOKU_SIZE; c++) {
        if (this.grid[r][c] === 0) return false;
        const val = this.grid[r][c];
        // 临时置0再检查合法性
        this.grid[r][c] = 0;
        const valid = this.isValidMove(r, c, val);
        this.grid[r][c] = val;
        if (!valid) return false;
      }
    }
    return true;
  }

  // 检查当前盘面是否有冲突（用于UI高亮）
  getConflicts() {
    const conflicts = [];
    for (let r = 0; r < SUDOKU_SIZE; r++) {
      for (let c = 0; c < SUDOKU_SIZE; c++) {
        const val = this.grid[r][c];
        if (val !== 0 && !this.isValidMove(r, c, val)) {
          conflicts.push(`${r},${c}`);
        }
      }
    }
    return conflicts;
  }

  clone() {
    return new Sudoku(this.getGrid());
  }

  toJSON() {
    return {
      grid: this.getGrid(),
      initialGrid: this.initialGrid.map(row => [...row])
    };
  }

  toString() {
    let out = '';
    for (let r = 0; r < SUDOKU_SIZE; r++) {
      for (let c = 0; c < SUDOKU_SIZE; c++) {
        out += (this.grid[r][c] || '.') + (c === 8 ? '\n' : ' ');
      }
    }
    return out;
  }

  static fromJSON(json) {
    const s = new Sudoku(json.grid);
    s.initialGrid = json.initialGrid.map(row => [...row]);
    return s;
  }
}
