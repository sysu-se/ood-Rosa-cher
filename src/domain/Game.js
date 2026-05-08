/**
 * Game 领域对象：负责游戏会话、历史记录、Undo/Redo
 * 职责：持有当前 Sudoku、管理历史、提供游戏操作入口
 */
export class Game {
  constructor(sudoku) {
    // 当前数独实例
    this.currentSudoku = sudoku;
    // 历史栈：存储 Sudoku 快照（Undo 用）
    this.history = [];
    // 重做栈：存储被 Undo 的快照（Redo 用）
    this.redoStack = [];
    // 记录初始状态（避免历史栈冗余）
    this.history.push(sudoku.clone());
  }

  /**
   * 获取当前 Sudoku
   * @returns {Sudoku}
   */
  getSudoku() {
    return this.currentSudoku;
  }

  /**
   * 用户输入数字（核心操作）
   * @param {Object} move - { row: number, col: number, value: number }
   */
  guess(move) {
    // 记录当前状态到历史栈（Undo 用）
    this.history.push(this.currentSudoku.clone());
    // 执行输入
    this.currentSudoku.guess(move);
    // 清空重做栈（新操作后，Redo 失效）
    this.redoStack = [];
  }

  /**
   * 撤销操作（Undo）
   */
  undo() {
    if (!this.canUndo()) return;
    // 将当前状态存入重做栈
    this.redoStack.push(this.currentSudoku.clone());
    // 恢复到上一个历史状态
    this.currentSudoku = this.history.pop();
  }

  /**
   * 重做操作（Redo）
   */
  redo() {
    if (!this.canRedo()) return;
    // 将当前状态存入历史栈
    this.history.push(this.currentSudoku.clone());
    // 恢复到重做栈的最后一个状态
    this.currentSudoku = this.redoStack.pop();
  }

  /**
   * 判断是否可以 Undo
   * @returns {boolean}
   */
  canUndo() {
    // 至少保留初始状态，所以历史栈长度 > 1 才能 Undo
    return this.history.length > 1;
  }

  /**
   * 判断是否可以 Redo
   * @returns {boolean}
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * 序列化到 JSON
   * @returns {string}
   */
  toJSON() {
    return JSON.stringify({
      currentSudoku: this.currentSudoku.toJSON(),
      history: this.history.map(s => s.toJSON()),
      redoStack: this.redoStack.map(s => s.toJSON())
    });
  }

  /**
   * 从 JSON 反序列化创建 Game
   * @param {string} json
   * @returns {Game}
   */
  static fromJSON(json) {
    const data = JSON.parse(json);
    const currentSudoku = Sudoku.fromJSON(data.currentSudoku);
    const game = new Game(currentSudoku);
    game.history = data.history.map(s => Sudoku.fromJSON(s));
    game.redoStack = data.redoStack.map(s => Sudoku.fromJSON(s));
    return game;
  }
}

/**
 * 符合作业要求的工厂函数
 * @param {Object} options - { sudoku: Sudoku }
 * @returns {Game}
 */
export function createGame({ sudoku }) {
  return new Game(sudoku);
}

/**
 * 从 JSON 创建 Game（作业要求的接口）
 * @param {string} json
 * @returns {Game}
 */
export function createGameFromJSON(json) {
  return Game.fromJSON(json);
}

// 导入 Sudoku 类（因为 Game 依赖）
import { Sudoku } from './Sudoku.js';
