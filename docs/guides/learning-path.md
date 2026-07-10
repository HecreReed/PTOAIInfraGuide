# PTO AI Infra 学习路线

PTO 生态的本质是：**用 tile 级抽象释放昇腾达芬奇架构算力**。它对应 CUDA 世界里「GPU 架构 → CUDA → Triton/CUTLASS → 编译器/框架 → 推理引擎」那条链路，但术语、执行模型和工具链完全不同。

本文给出一条可检验的学习路线：每一层都有知识点、推荐资料和「做完算会」的标准。

## 全景概览：五层架构

| 层级 | 名称 | 核心关注点 | 对标 CUDA 侧 |
|------|------|------------|--------------|
| 第零层 | 前置基础 | Ascend 硬件、1C2V、存储层次、CANN | GPU SM / HBM / NCCL |
| 第一层 | PTO ISA | Tile、指令、Event、CPU-SIM | CUDA C++ / 寄存器级编程 |
| 第二层 | PTOAS | PTO IR、Pass、同步插入、代码生成 | nvcc / MLIR / Triton 编译 |
| 第三层 | PyPTO | Tensor/Tile/Block 图、MPMD、runtime | PyTorch + Triton + 调度器 |
| 第四层 | 算子与整网 | GEMM/FA/通信融合、模型 kernel、Profiling | FlashAttention / vLLM / 调优 |

始终问自己：**这项技术牺牲了什么，换取了什么？**

| 技术 | 牺牲 | 换取 |
|------|------|------|
| 跨代 Tile ISA | 部分指令细节不可见 | A2/A3/A5 可移植 |
| Auto Mode | 峰值性能上限 | 开发效率、正确性 |
| Manual Mode | 心智负担与同步细节 | 流水线可控、性能上限 |
| 双缓冲 | 片上 buffer 占用 | 计算与搬运重叠 |
| MPMD（PyPTO） | 调度复杂度 | 多核异构任务图 |
| 量化 / 低精度 | 数值误差 | 带宽与吞吐 |

---

## 第零层：前置基础

### 知识点

**硬件与软件栈**

- Ascend 910B（A2）/ 910C（A3）/ 950（A5）代际定位
- CANN：驱动、运行时、编译器、算子生态
- 达芬奇 **1C2V**：1 个 AIC（含 CUBE）+ 2 个 AIV（向量）

**存储与流水线**

- GM → MAT(L1) → Left/Right/Acc(L0) / UB(Vec)
- Pipeline：SCALAR / MTE2 / MTE1 / CUBE / VEC / FIXP / MTE3
- 性能 Bound 直觉：CUBE Bound / MTE Bound / Vector Bound

**软件能力**

- Python 熟练 + 能读 C++ 模板
- 理解矩阵乘法分块与 Attention 计算复杂度
- Linux 开发环境、CMake、基本 profiling 概念

### 检验标准

- 能画出 1C2V 框图，并说出 CUBE 与 VEC 各自擅长什么
- 给定 GEMM 数据流，能写出 `GM → TLOAD → MAT → TMATMUL → TSTORE` 的路径
- 能解释 A3 Event 同步与 A5 BufID 同步的差异动机

推荐阅读：[Ascend / CANN 全景](/prerequisites/ascend-cann)、[达芬奇架构](/prerequisites/davinci-1c2v)

---

## 第一层：PTO ISA

这一层是「CUDA Programming Guide」对应物。

### 知识点

- Tile：位置（Vec/Mat/Left/Right/Acc）、静态 shape、valid region、布局
- GlobalTensor：GM 视图与 TLOAD/TSTORE
- 指令族：算术、矩阵、归约、激活、搬运、量化、通信
- Event / SetFlag / WaitFlag；双缓冲流水线
- Auto Mode vs Manual Mode
- CPU Simulator 与 NPU ST 测试路径

### 检验标准

- 独立写出 Vec Add / Reduce 类 Manual kernel（或读懂 demos）
- 在 CPU-SIM 上跑通 `tests/run_cpu.py --demo gemm`
- 能说明为何 double buffer 能隐藏 MTE 延迟，以及同步插错会怎样

推荐阅读：[什么是 PTO ISA](/pto-isa/overview)、[Tile 编程模型](/pto-isa/tile-model)

官方仓库：https://github.com/hw-native-sys/pto-isa

---

## 第二层：PTOAS 编译器

这一层是「nvcc + MLIR dialect + 算子融合 pass」的混合体。

### 知识点

- PTO Bytecode / `.pto` 文件
- IR Level-1（SSA tile）/ Level-2（DPS tile_buf）/ Level-3（显式 pipeline/event）
- 关键 Pass：InsertSync、PlanMemory、Tile Fusion、架构相关 lowering
- 产物：可调用 pto-isa 的 C++，以及 Python bindings
- 与 PyPTO / PTODSL / TileLang-DSL 的衔接

### 检验标准

- 会用 `ptoas input.pto --pto-arch=a3 --enable-insert-sync -o out.cpp`
- 能读懂一段含 `pto.alloc_tile` / `pto.tload` / `pto.tmatmul` 的 IR
- 解释为何 Level-2 用 DPS buffer：把「分配」和「调度」拆开

推荐阅读：[PTOAS 定位](/ptoas/overview)、[三级 IR](/ptoas/ir-levels)

官方仓库：https://github.com/hw-native-sys/PTOAS（当前发布见 v0.50 一带）

---

## 第三层：PyPTO 与运行时

这一层对应「写算子的人真正天天摸的 API」。

### 知识点

- Tensor 级 API、分层抽象（算法 / 性能 / 系统）
- 编译：Tensor Graph → Tile Graph → Block Graph → Execution Graph
- Codegen → `.pto` → PTOAS → AIC/AIV kernel
- `@pl.jit` / `@pl.program`、`pl.at`、`pl.parallel` / `pl.pipeline` / `pl.spmd`
- MPMD 调度；simpler 运行时（AICPU + AICore 任务图）

### 检验标准

- `pip install -e .` 后跑通 `examples/hello_world.py` 与 `examples/kernels/06_softmax.py`
- 能画出一次 `python kernel.py -p a2a3` 的 compile→runtime→golden 流程
- 会用 `pl.Out` / `pl.InOut`，理解错标方向会导致 host 读回全 0

推荐阅读：[PyPTO 设计理念](/pypto/overview)、[编程风格](/pypto/coding-style)

官方仓库：https://github.com/hw-native-sys/pypto

---

## 第四层：PyPTO-Lib、算子与性能

### 知识点

- pypto-lib：`examples/` 学习路径 + `models/` 整网（Qwen3 / DeepSeek）
- golden harness：平台 `a2a3/a2a3sim/a5/a5sim`
- GEMM / Flash Attention 的 tiling、双缓冲、核划分
- L2 swimlane（核间调度）与 L1/L0（核内流水线）两级调优
- msprof、CostModel、精度对齐（cast 舍入、阈值阈值）

### 检验标准

- 跑通 `examples/beginner/hello_world.py -p a2a3sim`
- 读懂 GEMM 性能样例 README，能指出 MTE / CUBE 瓶颈假设
- 在 swimlane 上识别「kernel 太碎导致 AICPU 饱和」并给出合并策略

推荐阅读：[PyPTO-Lib 工作流](/pypto-lib/workflow)、[性能模型](/kernels/perf-model)

官方仓库：https://github.com/hw-native-sys/pypto-lib

---

## 新人破局：三条主线任选

### 路线 A：底层算子工程师（偏 pto-isa）

1. 第零层硬件图背熟  
2. CPU-SIM 写/读 TADD → GEMM  
3. Manual 同步与双缓冲  
4. msprof 看 Bound → 回改 tiling  

### 路线 B：编译器工程师（偏 PTOAS）

1. 读 PTO IR manual  
2. 跟一次 `.pto` → Pass → `.cpp`  
3. 研究 InsertSync / PlanMemory / Tile Fusion  
4. 对接 PyPTO codegen 或 PTODSL  

### 路线 C：框架 / 模型工程师（偏 PyPTO）

1. 跑通 pypto examples  
2. 按 coding style 写 fused softmax / RMSNorm  
3. 跟 pypto-lib Qwen3 decode 一条链路  
4. L2 swimlane 做调度合并与精度回归  

### 时间建议

| 阶段 | 周期 | 目标 |
|------|------|------|
| 基础 | 0–3 周 | 硬件图 + ISA 概念 + CPU-SIM demo |
| 深入 | 1–2 月 | 选定 A/B/C 主线做出可演示 demo |
| 工程 | 3 月+ | 参与开源 PR、建立性能回归表 |

---

## 参考资料（官方入口）

- pto-isa 文档：`docs/getting-started_zh.md`、`docs/coding/*`、`docs/isa/*`
- PTOAS：`README.md`、`docs/PTO_IR_manual.md`、`docs/designs/*`
- PyPTO：`README.zh-CN.md`、`examples/`
- PyPTO-Lib：`docs/pypto-coding-style.md`、`docs/compile-runtime-workflow.md`、`docs/performance-tuning.md`
- 对标阅读：CUDA 版 [AIInfraGuide 学习路线](https://caomaolufei.github.io/AIInfraGuide/guides/ai-infra学习路线/)
