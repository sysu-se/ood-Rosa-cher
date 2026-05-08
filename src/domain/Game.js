// src/domain/Game.js
import { Sudoku } from './Sudoku';

export class Game {
  constructor(sudoku) {
    this.sudoku = sudoku.clone();
    this.history = [];      // 存储 Sudoku 快照
    this.historyIndex = -1;
    this.pushState();

    // 探索模式相关
    this.exploreMode = false;
    this.exploreStartSnapshot = null;   // 分支起点的Sudoku
    this.exploreFailedHashes = new Set(); // 记忆失败棋盘哈希
  }

  // 保存当前状态到历史
  pushState() {
    const snapshot = this.sudoku.clone();
    // 移除 index 之后的历史
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);
    this.historyIndex++;
  }

  getSudoku() {
    return this.sudoku;
  }

  // 获取当前盘面（二维数组）
  getGrid() {
    return this.sudoku.getGrid();
  }

  guess(move) {
    const { row, col, value } = move;
    if (this.exploreMode) {
      // 探索模式下直接修改 sudoku，不记录主历史
      const success = this.sudoku.guess({ row, col, value });
      if (success) {
        // 检查是否冲突（探索失败）
        if (!this.isExplorationValid()) {
          const hash = this.getBoardHash();
          this.exploreFailedHashes.add(hash);
          return { success: false, conflict: true, message: '此路径导致冲突，已记忆' };
        }
      }
      return { success };
    } else {
      // 正常模式：修改前先检查合法性
      if (!this.sudoku.isValidMove(row, col, value)) {
        return { success: false, conflict: true };
      }
      const success = this.sudoku.guess({ row, col, value });
      if (success) {
        this.pushState();
      }
      return { success };
    }
  }

  // 探索模式下检查冲突
  isExplorationValid() {
    const conflicts = this.sudoku.getConflicts();
    return conflicts.length === 0;
  }

  // 获取当前盘面的哈希（用于失败记忆）
  getBoardHash() {
    return JSON.stringify(this.sudoku.getGrid());
  }

  canUndo() {
    if (this.exploreMode) return false; // 探索模式暂不支持undo（可扩展）
    return this.historyIndex > 0;
  }

  undo() {
    if (this.exploreMode) return false;
    if (this.canUndo()) {
      this.historyIndex--;
      this.sudoku = this.history[this.historyIndex].clone();
      return true;
    }
    return false;
  }

  canRedo() {
    if (this.exploreMode) return false;
    return this.historyIndex < this.history.length - 1;
  }

  redo() {
    if (this.exploreMode) return false;
    if (this.canRedo()) {
      this.historyIndex++;
      this.sudoku = this.history[this.historyIndex].clone();
      return true;
    }
    return false;
  }

  // ========== 探索模式 API ==========

  startExplore() {
    if (this.exploreMode) return false;
    this.exploreMode = true;
    this.exploreStartSnapshot = this.sudoku.clone();
    // 创建一个新的 Sudoku 作为探索工作副本
    this.sudoku = this.exploreStartSnapshot.clone();
    return true;
  }

  // 放弃探索，回到起点
  cancelExplore() {
    if (!this.exploreMode) return false;
    this.sudoku = this.exploreStartSnapshot.clone();
    this.exploreMode = false;
    this.exploreStartSnapshot = null;
    return true;
  }

  // 提交探索结果，合并到主历史
  commitExplore() {
    if (!this.exploreMode) return false;
    // 检查当前探索盘面是否有效（无冲突）
    if (!this.isExplorationValid()) return false;
    // 将当前 sudoku 作为新状态推入主历史
    this.sudoku = this.sudoku.clone();
    this.pushState();
    this.exploreMode = false;
    this.exploreStartSnapshot = null;
    return true;
  }

  // 检查当前探索盘面是否已被记忆为失败
  isCurrentExplorationFailed() {
    if (!this.exploreMode) return false;
    const hash = this.getBoardHash();
    return this.exploreFailedHashes.has(hash);
  }

  toJSON() {
    return {
      sudoku: this.sudoku.toJSON(),
      history: this.history.map(s => s.toJSON()),
      historyIndex: this.historyIndex,
      exploreMode: this.exploreMode,
      exploreFailedHashes: Array.from(this.exploreFailedHashes)
    };
  }

  static fromJSON(json) {
    const sudoku = Sudoku.fromJSON(json.sudoku);
    const game = new Game(sudoku);
    game.history = json.history.map(h => Sudoku.fromJSON(h));
    game.historyIndex = json.historyIndex;
    game.exploreMode = json.exploreMode || false;
    game.exploreFailedHashes = new Set(json.exploreFailedHashes || []);
    // 重建 exploreStartSnapshot 如果需要，这里简化
    return game;
  }
}
