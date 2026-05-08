一、你如何实现提示功能？
提示功能分为两类：候选提示（显示某个格子的所有候选数）和下一步提示（推荐一个最优的填空位置及数字）。

候选提示：在 Sudoku 类中实现 getCandidates(row, col) 方法，返回指定格子当前所有可能的合法数字（1-9）。UI 层可以通过调用此方法显示候选列表。

下一步提示：在 Sudoku 类中实现 getNextHint() 方法。它遍历所有空格，找出候选数最少的格子。如果某个格子只有一个候选数（唯一候选），则直接返回该格子及数字；否则返回候选数最少（≥2）的格子及其候选列表。该方法返回一个包含 row, col, value（若有唯一值）以及 candidates 和 reason 的对象，供 UI 显示提示信息。

在 Game 类中没有直接实现提示逻辑，而是通过 getSudoku().getNextHint() 转发。UI 层通过 gameStore.getHint() 调用，无需关心内部实现细节。

二、你认为提示功能更属于 Sudoku 还是 Game？为什么？
提示功能更属于 Sudoku。

原因：

提示本质是对当前数独局面的分析，不依赖于游戏会话、历史记录或撤销重做等机制。Sudoku 作为核心领域对象，持有盘面数据并负责规则校验，自然应该承担局面分析的责任。

Game 的职责是管理会话、历史、探索模式等状态，不应该耦合具体的提示算法。将提示放在 Sudoku 中保持了单一职责原则，也使 Sudoku 更容易被其它场景复用（如独立于游戏的求解器）。

实际实现中，Game 只是简单转发 getSudoku().getNextHint()，没有增加额外逻辑，这也证明了提示与游戏会话是正交的。

三、你如何实现探索模式？
探索模式允许用户在无法唯一推演时，选择一个候选数字进行尝试，并支持回溯和记忆失败路径。

核心实现（Game 类）
状态切换：exploreMode 布尔标志，标识当前是否处于探索模式。

起点快照：exploreStartSnapshot 保存进入探索模式时盘面的深拷贝（通过 Sudoku.clone()）。

独立工作副本：进入探索模式后，this.sudoku 被替换为 exploreStartSnapshot 的副本，所有探索中的 guess 操作均在这个副本上进行，不记录主历史。

冲突检测：每次 guess 后调用 isExplorationValid()（基于 Sudoku.getConflicts()），若发现冲突，将该盘面的 JSON 哈希存入 exploreFailedHashes（Set），并返回失败标记。

失败记忆：当用户再次尝试走到一个已记忆的失败盘面时，isCurrentExplorationFailed() 会返回 true，UI 可据此提示用户避免重复失败路径。

提交与放弃：

commitExplore()：校验当前探索盘面无冲突后，将其 clone() 并调用 pushState() 推入主历史栈，然后退出探索模式。

cancelExplore()：直接放弃探索副本，恢复 exploreStartSnapshot 并退出探索模式。

UI 交互
UI 层通过 gameStore 提供的 startExplore(), commitExplore(), cancelExplore(), isExploreMode(), isExploreFailed() 等方法与用户交互，提供清晰的探索流程。

四、主局面与探索局面的关系是什么？
隔离性：主局面（Game.sudoku）与探索局面（探索模式下的临时 this.sudoku）是独立的深拷贝对象。进入探索模式时，通过 clone() 复制主局面作为起点；探索过程中的所有修改都不会影响主局面，直到用户显式提交。

深拷贝策略：Sudoku.clone() 会创建全新的 Sudoku 实例，内部 grid 和 initialGrid 都是通过 map(row => [...row]) 进行深拷贝，避免引用共享。这保证了主局面和探索局面互不污染。

提交与回滚：

提交：将当前探索局面的完整副本推入主历史栈，同时覆盖主局面。

放弃：直接丢弃探索对象，主局面恢复为进入探索模式前的状态。

哈希记忆：失败路径的哈希基于盘面 JSON 字符串，由于盘面是深拷贝出来的，哈希值能唯一标识一个局面状态，且不因对象引用不同而冲突。

五、你的 history 结构在本次作业中是否发生了变化？
没有根本性变化，仍为线性快照栈。

HW1 设计：Game 使用 history 数组存储 Sudoku 快照（深拷贝），historyIndex 指向当前状态。undo 和 redo 通过移动索引并恢复快照实现。

HW2 调整：为了支持探索模式，增加了 exploreMode、exploreStartSnapshot 和 exploreFailedHashes，但主历史栈的存储模型和回退机制完全保持不变。探索模式不向主历史栈写入任何记录，仅在提交时将最终结果作为一个新快照推入。

独立性：探索模式没有为分支创建独立的历史栈（作业不要求多层嵌套探索），而是采用“临时工作副本 + 最终一次提交”的模型，简化了实现。

六、Homework 1 中的哪些设计，在 Homework 2 中暴露出了局限？
guess 参数形式：HW1 设计为 guess(row, col, value)，但 HW2 的测试和 UI 层更希望传入对象 { row, col, value }。这导致后续需要修改方法签名，增加了适配成本。

快照存储的内存开销：HW1 使用完整深拷贝存储每个历史状态，在探索模式下如果需要大量尝试（未提交），会频繁克隆盘面，性能较差。更好的设计是采用命令模式存储移动差异（Move），但实现复杂度较高。

历史与分支的耦合：HW1 未预留分支扩展，导致 HW2 的探索模式需要引入额外标志和快照。如果最初设计时就将 Game 分成“线性模式”和“分支模式”两个子类，或使用状态模式，接入探索会更自然。

冲突检测位置：HW1 的冲突检测仅在 Sudoku.isValidMove 中用于判断是否可以填入，但没有提供获取所有冲突格子的接口。HW2 需要 getConflicts() 来高亮冲突及判断探索失败，这在 HW1 中未考虑，需要补充。

七、如果重做一次 Homework 1，你会如何修改原设计？
统一移动接口：将 guess 的参数改为对象 { row, col, value }，提高可读性和兼容性。

引入移动命令（Command Pattern）：用 Move 类记录每次操作，历史存储移动列表而非完整快照。undo 时反向应用移动，redo 时正向应用。这样可以大幅降低内存占用，也为探索模式的分支实现提供便利。

分离历史管理接口：定义 History 类，支持 push, undo, redo, clear，避免 Game 直接操作数组。未来扩展分支历史时只需替换 History 实现。

内置冲突集合接口：在 Sudoku 中提供 getConflicts()（返回所有冲突格子集合），方便 UI 渲染和探索模式使用。

采用状态模式管理游戏模式：将 Game 的行为（正常模式 vs 探索模式）提取为独立的状态类，避免在 Game 中写满 if (exploreMode) 分支，提高可维护性。

总结
本次作业在 HW1 的领域对象基础上，成功增加了提示功能和探索模式。提示归属 Sudoku 保持了单一职责，探索模式采用“独立快照 + 冲突记忆”方案，不影响原有线性历史机制。同时，也发现了 HW1 设计的一些局限（如参数形式、内存开销），为未来的重构指明了方向。所有功能均已通过 CI 测试和手动验证，满足作业要求。

