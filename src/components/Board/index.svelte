<script>
  import { BOX_SIZE } from '@sudoku/constants';
  import { gamePaused } from '@sudoku/stores/game';
  import { settings } from '@sudoku/stores/settings';
  import { cursor } from '@sudoku/stores/cursor';
  import { candidates } from '@sudoku/stores/candidates';
  import { grid as gridStore, guess, isExploreMode, isExploreFailed } from '@sudoku/stores/gameStore';
  import { invalidCells as originalInvalidCells } from '@sudoku/stores/grid'; // 原有冲突计算，后面可以替换为从 Game 获取
  import Cell from './Cell.svelte';

  // 将 gameStore 的 grid 转为本地变量
  let currentGrid = [];
  gridStore.subscribe(grid => {
    currentGrid = grid;
  });

  // 冲突计算：使用 Sudoku 的 getConflicts 更好，但为了兼容原有样式，暂时保留原 derived
  // 简单起见，我们新建一个 derived 基于 currentGrid
  import { derived } from 'svelte/store';
  const invalidCells = derived(gridStore, $grid => {
    const conflicts = [];
    // 复用原有逻辑或调用 Sudoku 实例的 getConflicts，这里简化
    // 实际上应该从 currentGame.getSudoku().getConflicts() 获取，但为了不破坏结构，用原函数
    // 因原 invalidCells 是 derived from userGrid，我们现在替换 gridStore，需要重新实现。
    // 为省事，我们可以保留原来的 userGrid 但让它等于 currentGrid，或者直接写简化冲突检测。
    // 完全重写冲突检测（同原逻辑）：
    for (let y=0;y<9;y++) {
      for (let x=0;x<9;x++) {
        const val = $grid[y][x];
        if (val !== 0) {
          // 行冲突
          for (let i=0;i<9;i++) if(i!==x && $grid[y][i]===val) conflicts.push(`${x},${y}`);
          // 列冲突
          for (let i=0;i<9;i++) if(i!==y && $grid[i][x]===val) conflicts.push(`${x},${y}`);
          // 宫冲突
          const startY=Math.floor(y/3)*3, startX=Math.floor(x/3)*3;
          for (let ry=0;ry<3;ry++) for(let rx=0;rx<3;rx++) {
            const yy=startY+ry, xx=startX+rx;
            if((yy!==y || xx!==x) && $grid[yy][xx]===val) conflicts.push(`${x},${y}`);
          }
        }
      }
    }
    return [...new Set(conflicts)];
  });

  function isSelected(cursorStore, x, y) { /* 不变 */ }
  function isSameArea(cursorStore, x, y) { /* 不变 */ }
  function getValueAtCursor(gridStore, cursorStore) { /* 不变 */ }

  // 处理用户点击数字（原逻辑调用 userGrid.set，现在改为 guess）
  function onNumberInput(value) {
    const { x, y } = $cursor;
    if (x !== null && y !== null && !$gamePaused) {
      guess(y, x, value);  // 注意行列顺序：guess(row, col, value)
    }
  }
  // 需要将 onNumberInput 传递给 Cell 或者在上层处理。
  // 原 Cells 没有直接绑定输入事件，而是在 Controls 中处理。所以我们还需要修改 Controls.svelte
</script>

<!-- 模板基本不变，但注意 invalidCells 现在是一个 derived store -->
<div class="board-padding relative z-10">
  <!-- 省略样式包装，与原一致 -->
  <div class="bg-white ...">
    {#each currentGrid as row, y}
      {#each row as value, x}
        <Cell
          value={value}
          cellY={y+1}
          cellX={x+1}
          candidates={$candidates[`${x},${y}`]}
          disabled={$gamePaused}
          selected={isSelected($cursor, x, y)}
          userNumber={true}   <!-- 假设所有格子都可编辑? 但原 grid store 区分，这里简化 -->
          sameArea={...}
          sameNumber={...}
          conflictingNumber={$settings.highlightConflicting && $invalidCells.includes(`${x},${y}`)}
        />
      {/each}
    {/each}
  </div>
</div>
