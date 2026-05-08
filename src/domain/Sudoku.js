/**
 * Sudoku 领域对象：负责数独盘面的核心逻辑
 * 职责：持有盘面数据、处理输入、校验、序列化/反序列化、克隆
 */
export class Sudoku {
  constructor(initialGrid) {
    // 深拷贝初始网格，避免外部引用污染
    this.grid = this.#deepCloneGrid(initialGrid);
    // 记录初始盘面（用于判断哪些格子是预设的）
    this.initialGrid = this.#deepCloneGrid(initialGrid);
  }

  /**
   * 深拷贝 9x9 网格
   * @param {number[][]} grid 原始网格
   * @returns {number[][]} 深拷贝后的网格
   */
  #deepCloneGrid(grid) {
    return grid.map(row => [...row]);
  }

  /**
   * 获取当前盘面（返回拷贝，避免外部直接修改）
   * @returns {number[][]}
   */
  getGrid() {
    return this.#deepCloneGrid(this.grid);
  }

  /**
   * 用户输入数字
   * @param {Object} move - { row: number, col: number, value: number }
   */
  guess(move) {
    const { row, col, value } = move;
    // 不允许修改初始预设的格子
    if (this.initialGrid[row][col] !== 0) return;
    // 合法值：0（清空）-9，超出范围不处理
    if (value < 0 || value > 9) return;
    this.grid[row][col] = value;
  }

  /**
   * 校验数独合法性
   * @returns {Array<{row: number, col: number}>} 非法格子列表
   */
  validate() {
    const invalidCells = [];

    // 检查每行、每列、每个 3x3 宫格
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = this.grid[row][col];
        if (value === 0) continue; // 空值不校验

        // 行重复检查
        const rowDuplicate = this.grid[row].some((v, c) => c !== col && v === value);
        // 列重复检查
        const colDuplicate = this.grid.some((r, rIdx) => rIdx !== row && r[col] === value);
        // 3x3 宫格重复检查
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        let boxDuplicate = false;
        for (let r = boxRow; r < boxRow + 3; r++) {
          for (let c = boxCol; c < boxCol + 3; c++) {
            if ((r !== row || c !== col) && this.grid[r][c] === value) {
              boxDuplicate = true;
              break;
            }
          }
        }

        if (rowDuplicate || colDuplicate || boxDuplicate) {
          invalidCells.push({ row, col });
        }
      }
    }

    return invalidCells;
  }

  /**
   * 判断数独是否完成（填满且合法）
   * @returns {boolean}
   */
  isComplete() {
    // 检查是否有空格
    const hasEmptyCells = this.grid.some(row => row.includes(0));
    if (hasEmptyCells) return false;
    // 检查是否有非法格子
    return this.validate().length === 0;
  }

  /**
   * 克隆 Sudoku 对象（用于历史快照）
   * @returns {Sudoku}
   */
  clone() {
    return new Sudoku(this.grid);
  }

  /**
   * 序列化到 JSON
   * @returns {string}
   */
  toJSON() {
    return JSON.stringify({
      grid: this.grid,
      initialGrid: this.initialGrid
    });
  }

  /**
   * 外表化：生成易读的字符串（用于调试）
   * @returns {string}
   */
  toString() {
    return this.grid.map(row => row.join(' ')).join('\n');
  }

  /**
   * 从 JSON 反序列化创建 Sudoku
   * @param {string} json - JSON 字符串
   * @returns {Sudoku}
   */
  static fromJSON(json) {
    const data = JSON.parse(json);
    const sudoku = new Sudoku(data.grid);
    sudoku.initialGrid = data.initialGrid;
    return sudoku;
  }
}

/**
 * 符合作业要求的工厂函数
 * @param {number[][]} input - 9x9 网格
 * @returns {Sudoku}
 */
export function createSudoku(input) {
  return new Sudoku(input);
}

/**
 * 从 JSON 创建 Sudoku（作业要求的接口）
 * @param {string} json
 * @returns {Sudoku}
 */
export function createSudokuFromJSON(json) {
  return Sudoku.fromJSON(json);
}
