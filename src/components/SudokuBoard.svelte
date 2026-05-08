<script>
  // 导入游戏 Store
  import { gameStore } from '../stores/gameStore.js';

  // 响应式变量（自动订阅 Store）
  let selectedCell = { row: 0, col: 0 };

  // 处理用户输入数字
  function handleCellInput(value) {
    // 调用 Store 的 guess 方法（通过适配层调用领域对象）
    gameStore.guess({
      row: selectedCell.row,
      col: selectedCell.col,
      value: Number(value)
    });
  }

  // 处理单元格选中
  function handleCellSelect(row, col) {
    selectedCell = { row, col };
  }
</script>

<div class="sudoku-board">
  <!-- 渲染 9x9 网格 -->
  {#each $gameStore.grid as row, rowIdx}
    <div class="sudoku-row">
      {#each row as cell, colIdx}
        <!-- 标记非法格子 -->
        <div 
          class="sudoku-cell {selectedCell.row === rowIdx && selectedCell.col === colIdx ? 'selected' : ''} 
                   {$gameStore.invalidCells.some(c => c.row === rowIdx && c.col === colIdx) ? 'invalid' : ''}"
          on:click={() => handleCellSelect(rowIdx, colIdx)}
        >
          <!-- 输入框：只允许编辑非初始格子 -->
          <input 
            type="number" 
            min="0" 
            max="9" 
            bind:value={cell} 
            disabled={$gameStore._game.getSudoku().initialGrid[rowIdx][colIdx] !== 0}
            on:change={(e) => handleCellInput(e.target.value)}
          />
        </div>
      {/each}
    </div>
  {/each}

  <!-- 游戏状态提示 -->
  {#if $gameStore.isComplete}
    <div class="game-complete">恭喜！数独完成！</div>
  {/if}
</div>

<style>
  .sudoku-board {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px;
  }
  .sudoku-row {
    display: flex;
    gap: 2px;
  }
  .sudoku-cell {
    width: 40px;
    height: 40px;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sudoku-cell.selected {
    border-color: #007bff;
    background-color: #e6f7ff;
  }
  .sudoku-cell.invalid {
    background-color: #ffebee;
  }
  .sudoku-cell input {
    width: 100%;
    height: 100%;
    border: none;
    text-align: center;
    font-size: 16px;
  }
  .sudoku-cell input:disabled {
    background-color: #f5f5f5;
    color: #333;
  }
  .game-complete {
    margin-top: 10px;
    color: #28a745;
    font-size: 18px;
    text-align: center;
  }
</style>
