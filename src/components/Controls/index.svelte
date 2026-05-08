<script>
  import { cursor } from '@sudoku/stores/cursor';
  import { guess, undo, redo, canUndo, canRedo, startExplore, cancelExplore, commitExplore, isExploreMode, getHint } from '@sudoku/stores/gameStore';
  import { gamePaused } from '@sudoku/stores/game';
  
  function handleNumber(num) {
    if ($gamePaused) return;
    const { x, y } = $cursor;
    if (x !== null && y !== null) {
      guess(y, x, num);
    }
  }

  function handleUndo() { undo(); }
  function handleRedo() { redo(); }
  function handleHint() {
    const hint = getHint();
    if (hint) {
      alert(`提示：建议在 (${hint.row+1},${hint.col+1}) 填入 ${hint.value}，原因：${hint.reason}`);
      // 也可以自动填入，但按作业要求建议只提示位置
    } else {
      alert('无更多提示');
    }
  }
  function handleExplore() {
    if ($isExploreMode) {
      // 如果已经在探索模式，则提供提交/放弃选项
      if (confirm('提交探索结果？')) {
        commitExplore();
      } else {
        cancelExplore();
      }
    } else {
      startExplore();
      alert('进入探索模式，可尝试不同数字。再次点击探索按钮可提交或放弃');
    }
  }
</script>

<!-- 渲染数字按钮、撤销/重做、提示、探索按钮 -->
<button on:click={handleUndo} disabled={!$canUndo}>撤销</button>
<button on:click={handleRedo} disabled={!$canRedo}>重做</button>
<button on:click={handleHint}>提示</button>
<button on:click={handleExplore}>
  {$isExploreMode ? '结束探索' : '探索模式'}
</button>
<!-- 数字按钮 1-9 -->
{#each [1,2,3,4,5,6,7,8,9] as num}
  <button on:click={() => handleNumber(num)}>{num}</button>
{/each}
