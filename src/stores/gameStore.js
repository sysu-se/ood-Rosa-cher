import { writable } from 'svelte/store';
import { createSudoku, createGame } from '../domain/index.js';

/**
 * 创建游戏 Store（适配层）
 * 职责：
 * 1. 持有 Game 领域对象
 * 2. 暴露响应式状态给 UI
 * 3. 暴露操作方法给 UI
 * 4. 保证领域对象变化后 UI 自动更新
 * @param {number[][]} initialGrid - 初始数独网格
 * @returns {Writable<{...}>} Svelte Store
 */
export function createGameStore(initialGrid) {
  // 1. 创建领域对象
  const initialSudoku = createSudoku(initialGrid);
  const game = createGame({ sudoku: initialSudoku });

  // 2. 定义响应式状态（UI 需要的所有状态）
  const { subscribe, set, update } = writable({
    // 核心数据
    grid: game.getSudoku().getGrid(),
    invalidCells: game.getSudoku().validate(),
    isComplete: game.getSudoku().isComplete(),
    // 操作状态
    canUndo: game.canUndo(),
    canRedo: game.canRedo(),
    // 持有领域对象（内部使用，不暴露给 UI 直接修改）
    _game: game
  });

  // 3. 状态同步函数：领域对象变化后，更新响应式状态
  function syncState() {
    const currentSudoku = game.getSudoku();
    update(state => ({
      ...state,
      grid: currentSudoku.getGrid(),
      invalidCells: currentSudoku.validate(),
      isComplete: currentSudoku.isComplete(),
      canUndo: game.canUndo(),
      canRedo: game.canRedo(),
      _game: game // 保持引用最新
    }));
  }

  // 4. 暴露给 UI 的操作方法
  const methods = {
    /**
     * 用户输入数字（UI 调用）
     * @param {Object} move - { row: number, col: number, value: number }
     */
    guess(move) {
      game.guess(move);
      syncState(); // 同步状态到 Store，触发 UI 更新
    },

    /**
     * 撤销操作（UI 调用）
     */
    undo() {
      game.undo();
      syncState();
    },

    /**
     * 重做操作（UI 调用）
     */
    redo() {
      game.redo();
      syncState();
    },

    /**
     * 重置游戏（UI 调用）
     * @param {number[][]} newGrid - 新的初始网格
     */
    reset(newGrid) {
      const newSudoku = createSudoku(newGrid);
      const newGame = createGame({ sudoku: newSudoku });
      // 替换内部的 Game 实例
      game.currentSudoku = newGame.currentSudoku;
      game.history = newGame.history;
      game.redoStack = newGame.redoStack;
      syncState();
    }
  };

  // 5. 返回 Store（包含 subscribe + 方法）
  return {
    subscribe,
    ...methods
  };
}

// 示例：创建默认初始数独（空盘面，可根据需求替换）
const defaultInitialGrid = Array(9).fill().map(() => Array(9).fill(0));
// 导出默认的游戏 Store（组件可直接导入使用）
export const gameStore = createGameStore(defaultInitialGrid);
