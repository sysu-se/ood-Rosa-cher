// src/stores/gameStore.js
import { writable, derived } from 'svelte/store';
import { Game } from '../domain/Game';
import { Sudoku } from '../domain/Sudoku';
import { generateSudoku } from '@sudoku/sudoku';
import { decodeSencode, encodeSudoku } from '@sudoku/sencode';

// 内部 Game 实例
let currentGame = null;

// 响应式的 grid 数据（二维数组）
const gridStore = writable([]);

// 初始化一个新游戏
function initGame(sudokuGrid) {
  const sudoku = new Sudoku(sudokuGrid);
  currentGame = new Game(sudoku);
  updateGridStore();
}

// 更新 store 中的 grid
function updateGridStore() {
  if (currentGame) {
    gridStore.set(currentGame.getGrid());
  }
}

// 开始新游戏
export function newGame(difficulty) {
  const generated = generateSudoku(difficulty);
  initGame(generated);
}

// 从 sencode 加载游戏
export function loadGameFromSencode(sencode) {
  const decoded = decodeSencode(sencode);
  initGame(decoded);
}

// 获取当前游戏的 sencode
export function getCurrentSencode() {
  if (!currentGame) return '';
  return encodeSudoku(currentGame.getGrid());
}

// 用户猜测
export function guess({ row: y, col: x, value }) {
  if (!currentGame) return false;
  const result = currentGame.guess({ row: y, col: x, value });
  updateGridStore();
  return result;
}

export function undo() {
  if (currentGame && currentGame.canUndo()) {
    currentGame.undo();
    updateGridStore();
    return true;
  }
  return false;
}

export function redo() {
  if (currentGame && currentGame.canRedo()) {
    currentGame.redo();
    updateGridStore();
    return true;
  }
  return false;
}

export function canUndo() {
  return currentGame ? currentGame.canUndo() : false;
}

export function canRedo() {
  return currentGame ? currentGame.canRedo() : false;
}

// 提示功能
export function getHint() {
  if (!currentGame) return null;
  const hint = currentGame.getSudoku().getNextHint();
  if (hint && hint.value) {
    // 直接返回建议的格子及数值
    return hint;
  }
  return null;
}

// 探索模式
export function startExplore() {
  if (currentGame && !currentGame.exploreMode) {
    currentGame.startExplore();
    updateGridStore();
    return true;
  }
  return false;
}

export function cancelExplore() {
  if (currentGame && currentGame.exploreMode) {
    currentGame.cancelExplore();
    updateGridStore();
    return true;
  }
  return false;
}

export function commitExplore() {
  if (currentGame && currentGame.exploreMode) {
    const success = currentGame.commitExplore();
    updateGridStore();
    return success;
  }
  return false;
}

export function isExploreFailed() {
  return currentGame ? currentGame.isCurrentExplorationFailed() : false;
}

export function isExploreMode() {
  return currentGame ? currentGame.exploreMode : false;
}

// 暴露只读的 grid store
export const grid = {
  subscribe: gridStore.subscribe
};

// 可选：暴露完整 game 对象供高级使用
export function getGame() {
  return currentGame;
}
