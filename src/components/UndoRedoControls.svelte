<script>
  // 导入游戏 Store
  import { gameStore } from '../stores/gameStore.js';
</script>

<div class="undo-redo-controls">
  <!-- 调用 Store 的 undo/redo 方法 -->
  <button 
    on:click={gameStore.undo}
    disabled={!$gameStore.canUndo}
  >
    撤销
  </button>
  <button 
    on:click={gameStore.redo}
    disabled={!$gameStore.canRedo}
  >
    重做
  </button>
</div>

<style>
  .undo-redo-controls {
    margin: 10px;
    display: flex;
    gap: 8px;
  }
  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
  }
  button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
</style>
