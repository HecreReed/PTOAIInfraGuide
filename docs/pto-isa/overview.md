# 什么是 PTO ISA（深度导读）

## 1. 先讲人话

如果你来自 CUDA：写 kernel 时想的是「一堆线程各自算几个元素，用 shared memory 协作」。

在 PTO 里，你想的是：

> **一块固定大小的片上二维缓冲区（Tile）上，发一条条 tile 指令：搬进来、算一下、再搬出去；用 Event 告诉不同硬件流水线谁先谁后。**

PTO ISA 就是这些「tile 指令」的标准契约。它由 Ascend CANN 定义，**pto-isa** 仓库给出跨 A2/A3/A5 的实现、CPU 仿真、测试与文档。

它刻意做两件看起来矛盾的事：

1. **抬高抽象**：别让每个框架都去碰代际微架构细节  
2. **保留调优面**：tile 形状、布局、顺序、同步仍然可控  

不是把硬件藏起来，而是把「稳定的接口」和「可调的旋钮」拆开。

## 2. 项目定位（官方叙事 + 工程解读）

### 2.1 官方四句话

- 统一跨代 tile 抽象 → 降迁移成本  
- 兼顾可移植与性能 → 固定 shape 下保证正确，仍可调 size/order  
- 面向框架、算子、工具链 → 共同接口  
- 持续扩展 → 已有 90+ 标准操作，通信扩展并行演进  

### 2.2 工程解读：它处在哪一层

```text
业务模型 / 训练推理框架
        ↓
PyPTO / TileLang / 其他前端
        ↓
PTOAS（可选编译优化层）
        ↓
★ pto-isa（本层：指令语义 + 后端实现）
        ↓
Ascend 硬件 或 CPU-SIM
```

- 对上：保证「我说的 TMATMUL 是这个意思」  
- 对下：把同一语义 map 到 A2/A3/A5 不同实现  
- 对旁：给 PTOAS 一个稳定的 codegen 目标  

## 3. 覆盖能力地图

### 3.1 计算

| 类别 | 代表指令 | 典型用途 |
|------|----------|----------|
| 逐元素算术 | TADD/TSUB/TMUL/TDIV | epilogue、归一化准备 |
| 矩阵 | TMATMUL/TMATMUL_ACC | GEMM、线性层、FA 中的 matmul |
| 归约 | TREDSUM/TREDMAX/TROWMAX… | softmax、norm |
| 激活/初等函数 | TRELU/TEXP/TLOG… | 非线性 |
| 转换 | TCVT 等 | 混合精度 |
| 量化/MX | TQUANT、TMATMUL_MX… | 低精度路径 |

### 3.2 数据搬运与布局

`TLOAD/TSTORE`（GM↔片上）、`TMOV/TEXTRACT/TTRANS/TRESHAPE`（片上重组）。

**性能事实**：很多「算子慢」其实是 **布局税 + 供给不足**，不是 CUBE 算不动。

### 3.3 通信扩展

点对点、信号、集合通信相关原语（TGET/TPUT 及异步变体等）。用途：

- 多核/多卡数据交换  
- **算通融合**（计算与通信同一 pipeline 故事）  

### 3.4 平台

| 平台 | 用途 |
|------|------|
| A2 (910B) | 广泛部署 |
| A3 (910C) | 增强代，大量 manual 样例 |
| A5 (950) | 新特性（BufID、异步通信增强等） |
| CPU-SIM | 正确性与教学 |

## 4. 仓库地图（你该从哪读代码）

```text
include/pto/          公共类型与 CPU/NPU 实现
kernels/manual/       手写高性能样例（真经）
  a2a3/gemm_performance/
  common/flash_atten/
  a2a3/gemm_ar/  tget_bandwidth/
demos/                Auto Mode 等
docs/isa/             指令百科
docs/coding/          编程模型与优化
tests/cpu|npu         回归
```

**阅读优先级建议：**

1. `docs/coding/tutorial_zh.md`  
2. `Tile_zh.md` + `Event_zh.md`  
3. `demos/.../add`  
4. `gemm_performance`  
5. `flash_atten`  
6. 通信样例  

## 5. 目标读者与学到什么深度

| 角色 | 最小深度 | 进阶深度 |
|------|----------|----------|
| 算法 | 知道有 tile 层 | 能读懂 PyPTO 生成结果 |
| 算子优化 | Manual + Event + 双缓冲 | 打 GEMM/FA 性能表 |
| 编译器 | 指令约束与类型 | 为新 op 设计 lowering |
| 性能 | Bound 语言 | msprof 闭环 |

## 6. Auto / Manual / SPMD / MPMD（四种组合）

|  | Auto | Manual |
|--|------|--------|
| **SPMD** | 教学/正确性默认 | 高性能规则算子 |
| **MPMD** | 框架生成常见 | 专家定制任务图 |

PyPTO 更常把你带到 MPMD + 自动 lowering；pto-isa Manual 样例更多是 SPMD 风格多核切分。

## 7. 和「再写一套 CUDA」有何不同

1. **一等公民是 Tile 不是 Thread**  
2. **同步是流水线资源图，不是 block barrier**  
3. **跨代是设计目标，不是附带兼容**  
4. **通信指令与计算指令同一抽象层**（利于融合）  

## 8. Roadmap 意识（避免学过时接口）

官方持续推进：Auto/Fusion 编译器支持、通信扩展、A5 指令增强、CostModel、CPU-SIM 同步等。学习时以 **当前 docs/isa 与 ReleaseNote** 为准，本站给方法论与地图。

## 9. 检验标准

- [ ] 三分钟讲清 pto-isa 与 PTOAS、PyPTO 的边界  
- [ ] 列出五类指令族并各举一例  
- [ ] 说明为何需要 CPU-SIM  
- [ ] 指出 GEMM 样例目录并说出其优化手段关键词（多核/base block/stepK/双缓冲）  

## 10. 下一步

- [Tile 编程模型](./tile-model)  
- [Event 与同步](./events)  
- [CPU 仿真上手](./cpu-sim)（强烈建议边看边跑）  
