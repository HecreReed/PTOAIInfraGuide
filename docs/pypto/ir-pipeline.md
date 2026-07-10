# 多级 IR 与编译流程（深度）

## 1. 端到端大图

```text
Python 源（@pl.jit / @pl.program）
        ↓ 前端解析 / 类型
Tensor Graph
        ↓ Pass 族（tiling、算子分解…）
Tile Graph
        ↓
Block Graph
        ↓
Execution / 可调度形态
        ↓ outlining
Orchestration + 多个 InCore 函数
        ↓ Codegen
.pto 文本（每 InCore 一份或一组）
        ↓ ptoas（可线程池并行）
C++ kernel wrappers（aic/ / aiv/）
        ↓ 设备编译链接
可加载二进制
        ↓ simpler runtime
NPU 执行 + 可选 DFX
```

## 2. 与 pypto-lib golden 路径对齐

`python kernel.py -p a2a3` 实际：

1. **Compile**：程序变换，`dump_passes` 可留中间  
2. **Codegen**：调 PTO backend → 写 `ptoas/` 与 `kernels/`  
3. **Input/Golden**：按 TensorSpec 生成；torch 参考  
4. **Runtime**：platform/device  
5. **Compare**：rtol/atol，失败非 0  

这是把「编译器课」和「算子课」接在一起的最佳实验床。

## 3. Outline 规则（性能关键）

观察来自 pypto-lib 文档的工程事实：

- 每个 `pl.at(CORE_GROUP)` 倾向变成 **独立 InCore**  
- 同一 at 内混 cube+vector → 可能 **拆成两个 InCore**（cube-only + vector-only）  
- 终点稳定态：  
  - **恰好 1 个 Orchestration**  
  - **N 个 InCore**  

### 3.1 对性能的直接推论

| 写法 | 后果 |
|------|------|
| 很多小 `pl.at` | 很多 kernel + AICPU 调度压力 |
| 该合并的 matmul+epilogue 拆开 | 额外 hand-off |
| 外层 `pl.range` 本可 parallel | 人为串行长链 |

## 4. Codegen 与 PTOAS 交互

- 环境：`$PTOAS_ROOT/ptoas` 或 PATH  
- `skip_ptoas=True`：只留 `.pto`（编译器开发有用）  
- 失败时：先看 `.pto` 是否非法，再看 ptoas 日志  

## 5. 调试分层表

| 阶段 | 信号 | 动作 |
|------|------|------|
| 前端 | Python 异常、类型错 | 查注解、Out 方向 |
| IR | verifier | dump passes |
| ptoas | 同步/内存 | 降 level、对照 lit |
| 链接/设备 | 驱动/CANN | soc/platform |
| 数值 | golden | 精度文档 |
| 性能 | swimlane | 合并/切分 |

## 6. 检验标准

- [ ] 默写端到端 8 步  
- [ ] 解释为何「两个相邻 at」可能变两个 kernel  
- [ ] 会用 dump 定位「多出来的 tmov」来自哪层  
