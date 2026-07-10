# 与 CUDA 生态对照（深度）

详见 [CUDA 对照速查](/guides/cuda-vs-pto)。此处强调 **岗位能力映射**：

| CUDA 岗技能 | PTO 岗落点 |
|-------------|-----------|
| 手写 CUDA kernel | pto-isa Manual |
| Triton 专家 | PyPTO/TileLang |
| 编译器 | PTOAS Pass |
| 推理引擎 | 业务栈 + pypto-lib |
| 性能分析 | msprof+swimlane |

迁移策略：保留方法论，替换执行心智与工具肌肉记忆。
