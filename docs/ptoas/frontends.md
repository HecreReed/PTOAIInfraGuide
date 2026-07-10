# PTODSL / TileLang-DSL 前端

PTOAS 仓库内还承载/对接多种前端实验与产品化路径。

## PTODSL

- Python 风格构造 PTO 计算  
- 随 `ptoas` Python 分发包安装（`import ptodsl`）  
- 定位接近「可 JIT 的 tile 级 DSL」，相对 PyPTO 更底层  

对比（社区常见说法）：

| | PyPTO | PTODSL |
|--|-------|--------|
| 抽象 | Tensor 友好，整图/MPMD 运行时 | 更贴近 kernel/tile |
| 执行 | 动态任务图 + simpler | 更偏 kernel/JIT 路径 |
| 类比 | 框架级 | CuTile / 底层 DSL 级 |

## TileLang-DSL

- 与 TileLang 生态衔接的语法糖与测试（见仓库 `tilelang-dsl/`）  
- 目标：让 SPMD tile 语言也能落到 PTO/PTOAS  

## 选型

| 需求 | 更合适 |
|------|--------|
| 整网、融合、调度、模型 | PyPTO + pypto-lib |
| 研究 pass / 直接玩 IR | 手写 `.pto` + ptoas |
| Python 快速拼 tile kernel | PTODSL |
| 已有 TileLang 资产 | TileLang-Ascend / tilelang-dsl 路径 |

前端再多，**语义终点仍是 pto-isa 指令契约**——这是生态一致性的锚点。