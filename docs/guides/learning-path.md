# PTO AI Infra 学习路线

PTO（Parallel Tile Operation）是昇腾 CANN 定义的 **面向 tile 编程的虚拟 ISA 与配套生态**。如果说 CUDA 版 AI Infra 解决的是「用系统工程释放 GPU 算力」，那 PTO AI Infra 解决的是：

> **用 tile 抽象 + 多级编译 + MPMD 调度，在达芬奇架构（CUBE / VEC / MTE）上把算子与整网性能榨干，同时尽量跨 A2/A3/A5 代际可移植。**

本文对标 [AIInfraGuide 学习路线](https://caomaolufei.github.io/AIInfraGuide/guides/ai-infra学习路线/)，但把「CUDA → 分布式 → 推理」替换为 **「Ascend 硬件 → PTO ISA → PTOAS → PyPTO → 算子/整网 → Profiling」**。每一层都给出：知识点、推荐资料、可量化检验标准。

**官方四仓库（必须收藏）：**

| 仓库 | 定位 |
|------|------|
| [hw-native-sys/pto-isa](https://github.com/hw-native-sys/pto-isa) | Tile 指令实现、CPU-SIM、Manual kernel 样例 |
| [hw-native-sys/PTOAS](https://github.com/hw-native-sys/PTOAS) | `.pto` 汇编/优化器（LLVM/MLIR），生成调用 pto-isa 的 C++ |
| [hw-native-sys/pypto](https://github.com/hw-native-sys/pypto) | Python 框架：Tensor→Tile→Block→Execution + simpler 运行时 |
| [hw-native-sys/pypto-lib](https://github.com/hw-native-sys/pypto-lib) | 生产级算子与模型（Qwen3/DeepSeek）+ golden harness |

---

## 全景概览：五层 + 一个不可能四元组

AI Infra 的本质是权衡。在 PTO 世界里，核心矛盾是：

| 资源 | 慢了会怎样 | 常见换取手段 |
|------|------------|--------------|
| **计算（CUBE/VEC）** | 吞吐上不去 | 更大 tile、融合、专用指令 |
| **搬运（MTE/GM 带宽）** | Cube 饿死 | 复用、stepK 缓存、减 transform |
| **同步（Event/BufID）** | 错误结果或全串行 | 精确依赖边、双缓冲 |
| **片上存储（UB/L0/L1）** | OOM 或被迫降 tile | 多缓冲、重计算式重排、量化 |

始终问自己：**这项技术牺牲了什么，换取了什么？**

| 技术 | 牺牲 | 换取 |
|------|------|------|
| 跨代 Tile ISA | 部分微架构细节不可见 | A2/A3/A5 迁移成本下降 |
| Auto Mode | 峰值上限、可控性 | 开发速度、正确性 |
| Manual Mode | 心智负担、易插错 sync | 流水线可控、性能上限 |
| 双缓冲 | 片上容量 ×2 倾向 | load/compute 重叠 |
| MPMD（PyPTO） | 调度与调试复杂度 | 异构任务图、融合整网 |
| 拆分 cube/vector kernel | AICPU hand-off | 单元专业化（有时更快，有时更慢） |
| 量化 / 低精度 | 数值误差 | 带宽与算力 |
| ZeRO 类思路（训练侧，对照） | 通信 | 显存 —— PTO 侧对应「用搬运换片上复用」的镜像问题 |

```text
算法 / 模型（Qwen3、DeepSeek…）
        ↓
PyPTO-Lib（算子库 + torch golden）
        ↓
PyPTO + simpler（Tensor/Tile/Block 图 + MPMD 任务图）
        ↓
PTOAS（.pto → Pass → pto-isa C++）
        ↓
pto-isa（90+ Tile 指令，A2/A3/A5 + CPU-SIM）
        ↓
Ascend NPU（1C2V：CUBE / VEC / MTE）
```

---

## 第零层：前置基础（硬件与栈）

> 没有硬件图，后面所有「优化」都是玄学。

### 0.1 知识点

**Ascend / CANN 位置**

- Ascend 910B（A2）、910C（A3）、950（A5）在产品线上的角色
- CANN ≈ 驱动 + 运行时 + 编译器 + 算子生态（对标 CUDA Toolkit 全家桶的一部分）
- PTO 不是替代 CANN，而是 CANN 内 **高性能/可移植 tile 编程层**

**达芬奇 1C2V**

把一颗物理 AI Core 想成一座小工厂：

- **1× AIC**：带 CUBE（矩阵乘主力）+ VEC + 完整 MTE 路径
- **2× AIV**：偏向量，也能搬数
- Pipeline：`SCALAR | MTE2 | MTE1 | CUBE | VEC | FIXP | MTE3`

高效 kernel 的目标不是「某个单元 100%」，而是 **多单元稳态重叠**。

**存储层次**

```text
GM (HBM)
  ↕ TLOAD/TSTORE
MAT (L1)
  ├ LEFT (L0A)  ─ TMATMUL 左
  ├ RIGHT(L0B)  ─ TMATMUL 右
  ├ ACC  (L0C)  ─ 累加/输出
  └ BIAS
VEC/UB          ─ 逐元素、softmax、规约
```

**软件前置**

- Python 熟练（装饰器、类型注解、调试）
- 能读 C++ 模板与宏
- 线性代数维度直觉（B,S,H 乘法）
- Transformer 前向与 Attention 复杂度 \(O(S^2)\)
- Linux + CMake + git；知道 profiling 是什么

### 0.2 推荐资料

| 类型 | 资料 | 说明 |
|------|------|------|
| 官方 | pto-isa README_zh | 生态定位与 demo 入口 |
| 官方 | `docs/coding/Tile_zh.md` / `Event_zh.md` | 核心抽象 |
| 硬件 | 本站 [1C2V](/prerequisites/davinci-1c2v) / [存储层次](/prerequisites/memory-hierarchy) | 中文串联 |
| 对照 | AIInfraGuide「GPU 硬件概论」 | 方法论可迁移 |
| 论文 | Attention Is All You Need | 后续 FA 优化前提 |

### 0.3 检验标准

- [ ] 不看资料画出 1C2V，标出 CUBE/VEC/MTE2
- [ ] 写出 GEMM 数据流：`GM→L1→L0→Acc→GM`，并点名可能用到的 PTO 指令族
- [ ] 解释 A3 Event 同步 vs A5 BufID 的动机（事件资源 vs 程序序）
- [ ] 给定「TLOAD≈100% 且 TMATMUL 下滑」，能说出至少两种调优方向

---

## 第一层：PTO ISA（对标 CUDA 编程 + 算子基础）

这一层是整座大厦的地基。官方仓库：**pto-isa**。

### 1.1 知识点

**Tile 五要素**

1. Location（`Vec/Mat/Left/Right/Acc/...`）
2. dtype
3. 静态容量 `Rows×Cols`
4. 布局（`BLayout` + 可选分形/盒化）
5. 有效区域 valid（静态或 `DYNAMIC`）

**GlobalTensor**：GM 视图（shape/stride/layout），不拥有数据。

**指令地图**

| 族 | 例子 | 主 pipeline |
|----|------|-------------|
| 逐元素 | TADD/TMUL/… | VEC |
| 矩阵 | TMATMUL/TMATMUL_ACC | CUBE |
| 归约/行操作 | TREDSUM/TROWMAX/… | VEC |
| 搬运 | TLOAD/TSTORE/TMOV/TEXTRACT | MTE* |
| 通信 | TGET/TPUT/异步变体 | 通信引擎 |
| 同步 | Event / TSYNC / flags | 跨 pipeline |

**Auto vs Manual**

- Auto：无 `TASSIGN`、少手写 sync，适合正确性
- Manual：显式地址与 Event，适合峰值

**执行模型**：SPMD（`block_idx` 切数据）与 MPMD（不同核不同程序）正交于 Auto/Manual。

### 1.2 最小可运行路径

```bash
git clone https://github.com/hw-native-sys/pto-isa.git
cd pto-isa
python3 tests/run_cpu.py --clean --verbose
python3 tests/run_cpu.py --demo gemm --verbose
python3 tests/run_cpu.py --demo flash_attn --verbose
```

### 1.3 向量加法：从 Auto 到 Manual

**Auto 风格（数据流清晰）：**

```cpp
template <typename T, int kRows, int kCols>
AICORE void VecAddAuto(__gm__ T* out, __gm__ T* in0, __gm__ T* in1) {
  using GT = GT2D<T, kRows, kCols>;
  using TileT = Tile<TileType::Vec, T, kRows, kCols, BLayout::RowMajor, DYNAMIC, DYNAMIC>;
  GT g0(in0), g1(in1), gout(out);
  TileT t0(kRows, kCols), t1(kRows, kCols), tout(kRows, kCols);
  TLOAD(t0, g0);
  TLOAD(t1, g1);
  TADD(tout, t0, t1);
  TSTORE(gout, tout);
}
```

**Manual 风格（显式依赖）：**

```cpp
Event<Op::TLOAD, Op::TADD> e_load;
Event<Op::TADD, Op::TSTORE_VEC> e_add;
TASSIGN(t0, 0x0000);
TASSIGN(t1, 0x4000);
TASSIGN(tout, 0x8000);
TLOAD(t0, g0);
e_load = TLOAD(t1, g1);
e_add  = TADD(tout, t0, t1, e_load);
TSTORE(gout, tout, e_add);
```

心智：**Event 是跨 pipeline 的「完成令牌」**，不是 CUDA 的 `__syncthreads` 全局屏障。

### 1.4 更大模式：Row Softmax / GEMM 骨架

Row-softmax 典型链：

`TROWMAX → expand → TSUB → TEXP → TROWSUM → expand → TDIV`

GEMM 典型链：

`TLOAD(A/B, Mat) → TMOV/TEXTRACT(Left/Right) → TMATMUL[_ACC] → TSTORE`

真实高性能实现还要：多核切分、stepK 缓存、双缓冲、warmup/steady/drain。

### 1.5 推荐资料

| 类型 | 路径 |
|------|------|
| 上手 | `docs/coding/tutorial_zh.md` |
| Tile | `docs/coding/Tile_zh.md` |
| Event | `docs/coding/Event_zh.md` |
| 优化 | `docs/coding/opt_zh.md` |
| GEMM 实战 | `kernels/manual/a2a3/gemm_performance/README_zh.md` |
| FA | `kernels/manual/common/flash_atten/README_zh.md` |
| 指令百科 | `docs/isa/README_zh.md` |

### 1.6 检验标准

- [ ] 独立解释 Tile valid 前缀语义；尾块为何危险
- [ ] 写出带 Event 的 VecAdd，并说明每条依赖边
- [ ] CPU-SIM 跑通 gemm demo，并读懂至少一段 kernel 主循环结构
- [ ] 看到「TLOAD 高、TMATMUL 低」能给出假设列表

---

## 第二层：PTOAS 编译器（对标 nvcc / MLIR / 算子融合编译）

官方仓库：**PTOAS**（依赖 LLVM21 VPTO 分支 `feature-vpto-llvm21`）。

### 2.1 知识点

**PTOAS 干什么**

1. 解析/校验 `.pto`（PTO Dialect）
2. 跑达芬奇相关 Pass（同步插入、内存规划、融合…）
3. Lowering 到可调用 pto-isa 的 C++
4. Python 绑定对接 PyPTO / PTODSL

**三级 IR**

| Level | 形态 | 谁管 buffer / sync |
|-------|------|---------------------|
| L1 | SSA `pto.tile` | 编译器规划存储 |
| L2 | DPS `pto.tile_buf` | 上层 `alloc_tile`，调度可自动 |
| L3 | 显式 pipeline/event | 专家全控 |

设计动机：buffer 分配与流水线调度都是 NP-hard 量级问题，**拆开**才工程可解。

**关键类型**

- `!pto.ptr` / `tensor_view` / `partition_tensor_view`
- `!pto.tile_buf<loc,dtype,rows,cols,v_row,v_col,blayout,...>`
- `!pto.multi_tile_buf`（多 slot，双缓冲等显式表达）

**Pass 家族**

- InsertSync / GraphSyncSolver
- BufID Sync（A5）
- PlanMemory
- Tile Fusion
- Arch-specific lowering（`--pto-arch=a3|a5`）

### 2.2 CLI 心智

```bash
ptoas input.pto --enable-insert-sync -o out.cpp
ptoas input.pto --pto-arch=a5 --enable-bufid_sync -o out.cpp
ptoas input.pto --pto-level=level3 -o out.cpp
ptoas --version
```

Python 安装合同（官方强调）：

```bash
pip install -e . --no-build-isolation
# import ptodsl / mlir.dialects.pto
```

### 2.3 与框架的边界

```text
PyPTO Codegen ──.pto──▶ PTOAS ──C++──▶ pto-isa ──▶ 硬件
```

调试时务必分层：前端类型错 vs IR illegal vs Pass 过粗 vs 指令实现 bug。

### 2.4 推荐资料

- `docs/PTO_IR_manual.md`
- `docs/designs/*`、`ptoas-tile-fusion-design.md`、`bufid_sync_a5_design.md`
- `test/lit/**/*.pto`（最好的语法教材）
- ReleaseNotes / v0.50+ 变更

### 2.5 检验标准

- [ ] 读懂一段含 `alloc_tile` + `tload` + `tmatmul` 的 IR，标出 loc/dtype/shape
- [ ] 解释为何 L2 用 DPS：举例「原地更新 + buffer 复用」
- [ ] 说明 level3 关闭 PlanMemory/InsertSync 的适用人群
- [ ] 能把一次编译失败归类到「前端 / ptoas / 链接 / 运行」四段之一

---

## 第三层：PyPTO 与 simpler 运行时（对标框架 + 调度器）

官方仓库：**pypto**（runtime submodule：**simpler**）。

### 3.1 知识点

**分层抽象**

| 层 | 用户 | 关注点 |
|----|------|--------|
| Tensor | 算法 | 正确性、shape、dtype |
| Tile | 性能 | 分块、复用 |
| Block/Execution | 系统 | 核划分、任务图 |

**编译管线**

`Tensor Graph → Tile Graph → Block Graph → Execution → Codegen(.pto) → ptoas → AIC/AIV kernels → simpler 调度执行`

**编程面**

- `import pypto.language as pl`
- `@pl.jit` / `@pl.jit.inline` 或 `@pl.program` + `@pl.function`
- `pl.at(level=CORE_GROUP)` 划 InCore 区域
- `pl.parallel` / `pl.range` / `pl.pipeline` / `pl.spmd`
- **输出方向**：`pl.Out` / `pl.InOut`（标错会 host 读回全 0）

**Outline 现实**

- 每个 `pl.at` 常变成独立 InCore kernel
- 混用 cube+vector 可能拆成两个核 + AICPU hand-off
- 最终常见形态：1 Orchestration + N InCore

### 3.2 最小路径

```bash
git clone https://github.com/hw-native-sys/pypto.git
cd pypto
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -e ".[dev]"
python examples/hello_world.py
python examples/kernels/06_softmax.py
```

### 3.3 MPMD 与性能

PyPTO 默认叙事是 **MPMD 任务图**：不同核跑不同程序片段。性能问题经常出在：

1. kernel 太碎 → AICPU 调度顶满，核空闲  
2. 该 `parallel` 写成 `range` → 人为串行  
3. epilogue 拆核 → hand-off 吃掉融合收益  

这些在 L2 swimlane 上一目了然。

### 3.4 检验标准

- [ ] 解释 `Out` vs `InOut`，并构造一个 KV cache 场景该怎么标
- [ ] 画出 `python kernel.py -p a2a3` 的 compile→golden→runtime→compare
- [ ] 能根据 swimlane「AICPU 实心、核空闲」给出合并 `pl.at` 的改法
- [ ] 说明 PyPTO 与 PTODSL 的定位差异（框架级 vs kernel/DSL 级）

---

## 第四层：PyPTO-Lib、算子与整网（对标 FlashAttention / vLLM 工程落地）

官方仓库：**pypto-lib**。

### 4.1 知识点

**资产结构**

- `examples/beginner|intermediate|advanced`
- `models/qwen3/*`、`models/deepseek/*`
- `golden/` harness：`-p a2a3|a2a3sim|a5|a5sim`

**正确性闸门**

`compile → 生成输入 → torch golden → device run → rtol/atol`

没有 golden 的「优化」不叫工程，叫赌博。

**算子优化两级**

| 级 | 视角 | 工具 |
|----|------|------|
| L2 | 核间调度 | `--enable-l2-swimlane` + Perfetto |
| L1/L0 | 核内流水 | PMU / kernel insight / msprof |

**经典算子**

- GEMM：多核 2D 切分、baseM/N/K、stepK、L1/L0 双缓冲（见 pto-isa gemm_performance）
- FlashAttention：online softmax + tile 复用 + 多阶段同步
- 通信融合：TGET vs TGET_ASYNC、GEMM+AllReduce

### 4.2 GEMM 性能画像（如何读表）

官方样例在 A3 24 核上展示：随 `m=k=n` 增大，TLOAD 占比可逼近 100%，此时继续「抠 TMATMUL 指令」收益有限，应转向 **减搬运字节/提升复用/重叠**。

### 4.3 推荐路径

1. `examples/beginner/hello_world.py -p a2a3sim`
2. intermediate：softmax / rms_norm / rope
3. 读 `docs/pypto-coding-style.md` 全文
4. 跟 `models/qwen3/14b/qwen3_14b_decode.py` 一条链
5. 打开 L2 swimlane，做一次合并 at 的对比实验

### 4.4 检验标准

- [ ] sim 上至少 1 个 intermediate 算子 golden 通过
- [ ] 能解释 FA 为何是 memory-aware 算法（HBM 流量从 \(O(S^2)\) 降到近似 \(O(S)\) 量级思想）
- [ ] 独立完成一次「改 tiling 常量 → 回归精度 → 记录性能」闭环
- [ ] 在 swimlane 上识别长尾核与空闲核

---

## 第五层：性能分析与工程体系（对标 Nsight + 回归门禁）

### 5.1 工具箱

| 工具 | 回答的问题 |
|------|------------|
| CPU-SIM | 语义对不对 |
| torch golden | 数值偏不偏 |
| msprof | 硬件单元谁忙谁闲 |
| L2 swimlane | 任务调度有没有气泡 |
| CostModel | 没板时 what-if |
| 表格回归 | 这次改动有没有偷偷变慢/变歪 |

### 5.2 决策树（简化版）

```text
慢在哪？
├─ 编译都过不了 → 分层看 pypto / ptoas 日志
├─ 数值不过 → Out 方向 / cast / 尾块 valid / 量化
├─ 正确但端到端慢
│   ├─ swimlane: AICPU 忙核闲 → 合并 kernel、改 parallel
│   ├─ swimlane: 单核长尾 → 拆分或重切分
│   └─ 核内：TLOAD/TEXTRACT/TMATMUL 谁高 → 对症
└─ 偶发挂死 → device log / 依赖环 / 同步
```

### 5.3 检验标准

- [ ] 输出报告至少含：shape 集合、平台、精度阈值、关键阶段占比、结论与下一步
- [ ] 两次实验只改一个变量
- [ ] 能向非编译器同事用「工厂流水线」讲清双缓冲

---

## 新人破局：三条主线

### 路线 A · 底层算子（pto-isa）

Week1 硬件图 + CPU-SIM → Week2 Event/双缓冲 → Week3 GEMM README 精读 → Week4 上板 msprof

### 路线 B · 编译器（PTOAS）

Week1 IR manual → Week2 lit 测试跟读 → Week3 InsertSync/PlanMemory 设计文档 → Week4 对接 codegen

### 路线 C · 框架/模型（PyPTO + lib）

Week1 hello/softmax → Week2 coding style 全读 → Week3 Qwen3 decode 跟读 → Week4 swimlane 优化小实验

### 时间盒建议

| 阶段 | 周期 | DoD |
|------|------|-----|
| 地图 | 1 周 | 能讲清四仓库边界 |
| 闭环 | 2–4 周 | 一条 sim/真机链路可复现 |
| 深入 | 1–3 月 | 选定 A/B/C 做出可演示优化 |
| 工程 | 持续 | PR + 性能/精度表 + 文档回写 |

---

## 与 CUDA AI Infra 路线的对照（迁移税）

| CUDA 路线模块 | PTO 路线模块 |
|---------------|--------------|
| GPU 架构 / CUDA | 1C2V / PTO ISA |
| Reduce/GEMM/Softmax/FA | 同名问题，Tile 指令实现 |
| Triton / torch.compile | PyPTO / PTOAS / TileLang |
| NCCL / 分布式 | 通信扩展 + HCCL + 融合 kernel |
| vLLM / 推理优化 | 业务推理栈 + pypto-lib 模型核 |
| Nsight | msprof + swimlane + CostModel |

**可迁移**：Roofline 思维、一次一变量、表格回归、正确性优先。  
**不可硬套**：threadIdx 扫元素、warp 投票、共享内存 bank 细节——换成 Tile + pipeline Event。

---

## 参考入口（浓缩）

- 学习站：本仓库各模块长文  
- 对标站：https://caomaolufei.github.io/AIInfraGuide/  
- 上游：四仓库 README + `docs/`  
- 社区：各仓 Issues / PR  

下一步建议：打开 [30 天计划](/guides/30-day-plan) 开始打卡，或直接进入 [CPU 仿真上手](/pto-isa/cpu-sim) 写第一个 kernel。


---

## 附录 A：白板题库（面试/自检）

### A.1 硬件与存储

1. 画出 1C2V，并标注一条 GEMM 指令最可能打在哪些 pipeline 上。  
2. 解释为何 TLOAD 占比接近 100% 时，继续微优化 TMATMUL 指令往往收益有限。  
3. fp16 的 `baseM=128, baseK=64` 占用多少 KiB？若 L0 单缓冲上限 32KiB，`baseN` 最大大概多少（按 `baseK*baseN*2`）？  

### A.2 ISA 与同步

4. Tile 五要素是什么？valid 区外语义是什么？  
5. 手写 VecAdd 的 Event 依赖图（两个 load、一个 add、一个 store）。  
6. 双缓冲为什么通常需要两套物理区域？warmup/steady/drain 各解决什么？  
7. A5 BufID 相对 A3 Event 的动机与额外约束？  

### A.3 编译器

8. 解释 PTO IR L1/L2/L3。为何 L2 用 DPS tile_buf？  
9. `--pto-level=level3` 会关掉什么？适合谁？  
10. 如何区分「前端类型错误」与「InsertSync 过粗」？  

### A.4 框架与运行时

11. 为什么 `pl.Out` 标错会导致 host 读回全 0？  
12. 两个相邻 `pl.at` 与一个合并 `pl.at` 在 outline 后可能差几个 InCore？  
13. swimlane 上 AICPU 实心、AICore 空闲，优先改什么？  

### A.5 算子

14. 默写 GEMM 四阶段与四个旋钮（多核/base/stepK/双缓冲）。  
15. 白板推导 FlashAttention 为何能减少 HBM 上的大矩阵物化。  
16. TGET 与 TGET_ASYNC 的差异动机是什么？  

### 参考答案方向（不唯一）

- 3：`128*64*2=16KiB`；`baseN <= 32KiB/(baseK*2)=256`。  
- 8：分配与调度都难，拆开才能工程化。  
- 11：In 默认可能不 copy-back。  
- 12：差 1 个 hand-off；若再拆 cube/vector 差距更大。  

---

## 附录 B：命令速查卡

```bash
# pto-isa
python3 tests/run_cpu.py --clean --verbose
python3 tests/run_cpu.py --demo gemm --verbose
./build.sh --run_all --a3 --sim

# PTOAS
ptoas in.pto --enable-insert-sync -o out.cpp
ptoas in.pto --pto-arch=a5 --enable-bufid_sync -o out.cpp
pip install -e . --no-build-isolation

# pypto
pip install -e ".[dev]"
python examples/hello_world.py
python examples/kernels/06_softmax.py

# pypto-lib
python examples/beginner/hello_world.py -p a2a3sim
python models/qwen3/14b/qwen3_14b_decode.py -p a2a3 -d 0 --enable-l2-swimlane
```

---

## 附录 C：与 AIInfraGuide 章节映射

| AIInfraGuide | 本站 |
|--------------|------|
| 第零层前置 | 前置基础 + 本路线第零层 |
| CUDA 编程与算子 | PTO ISA + 算子与优化 |
| 分布式训练 | 通信融合 +（框架外）HCCL/并行策略（后续可扩） |
| 推理优化 | PyPTO-Lib 模型核 + 精度/调度（后续可扩 Serving） |
| 性能分析 | msprof + L2 swimlane + CostModel |
| 面试宝典 | 附录 A 白板题（持续扩） |

> 说明：分布式训练与 Serving 全栈在 CUDA 侧极厚；PTO 站当前把重心放在 **算子/编译/框架内核路径**，分布式系统层可按同样结构继续加章。
