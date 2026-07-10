---
layout: home
title: PTO AI Infra Guide
titleTemplate: PTO 版 AI Infra 宝典

hero:
  name: PTO AI Infra Guide
  text: 昇腾原生 AI Infra 全栈宝典
  tagline: 从 PTO ISA、PTOAS、PyPTO 到 PyPTO-Lib，构建完整的 Ascend Tile 编程知识体系（对标 CUDA 版 AIInfraGuide）
  actions:
    - theme: brand
      text: 开始学习
      link: /guides/learning-path
    - theme: alt
      text: GitHub
      link: https://github.com/HecreReed/PTOAIInfraGuide
    - theme: alt
      text: 官方四仓库
      link: /ecosystem/four-repos

features:
  - title: 学习路线
    details: 系统化梳理从 Ascend 硬件、PTO ISA 到 PyPTO 整网开发的知识图谱与检验标准。
    link: /guides/learning-path
  - title: 前置基础
    details: 达芬奇架构、1C2V、存储层次、A2/A3/A5 代际差异，搞清楚硬件再写 kernel。
    link: /prerequisites/
  - title: PTO ISA
    details: 90+ 标准 tile 指令、Tile/Event 编程模型、Auto/Manual 双模式、CPU 仿真上手。
    link: /pto-isa/
  - title: PTOAS 编译器
    details: LLVM/MLIR Out-of-Tree 工具链，三级 IR、自动同步、内存规划与 C++ 代码生成。
    link: /ptoas/
  - title: PyPTO 框架
    details: Tensor → Tile → Block → Execution 多级 IR，MPMD 调度，Python 友好的融合算子开发。
    link: /pypto/
  - title: 算子与性能
    details: GEMM、Flash Attention、通信融合，以及 msprof / Swimlane / CostModel 调优实战。
    link: /kernels/
---

## 为什么需要 PTO AI Infra Guide

CUDA 生态已经有大量系统化教程（例如 [AIInfraGuide](https://caomaolufei.github.io/AIInfraGuide/)），但 **Ascend / CANN 上的 PTO（Parallel Tile Operation）生态** 仍缺少一条把硬件、指令集、编译器、上层框架串起来的中文学习路径。

本站基于官方社区仓库：

| 仓库 | 定位 |
|------|------|
| [hw-native-sys/pto-isa](https://github.com/hw-native-sys/pto-isa) | Tile 虚拟 ISA 与指令库 |
| [hw-native-sys/PTOAS](https://github.com/hw-native-sys/PTOAS) | PTO 字节码汇编器 / 优化器 |
| [hw-native-sys/pypto](https://github.com/hw-native-sys/pypto) | 高层 Python 编程框架 |
| [hw-native-sys/pypto-lib](https://github.com/hw-native-sys/pypto-lib) | 算子与模型实现库 |

目标不是复述官方 README，而是用 **AI Infra 工程师视角** 回答：

- 这层抽象解决什么问题？牺牲了什么、换取了什么？
- 和 CUDA / Triton / FlashAttention / vLLM 那套知识如何对照？
- 新人应该先跑通哪条路径，再深入哪一层？

## 全景分层

```text
算法 / 模型（Qwen3、DeepSeek…）
        ↓
PyPTO-Lib（算子库 + golden 验证）
        ↓
PyPTO + simpler 运行时（Tensor/Tile/Block 图 + MPMD）
        ↓
PTOAS（.pto IR → 优化 Pass → pto-isa C++）
        ↓
pto-isa（90+ Tile 指令，A2/A3/A5 + CPU-SIM）
        ↓
Ascend NPU（达芬奇 1C2V：CUBE / VEC / MTE）
```

所有优化都在 **计算、搬运、同步、片上存储** 这个四元组里做取舍：双缓冲用空间换重叠；重排指令用控制复杂度换流水线满载；量化用精度换带宽。

## 推荐起点

1. 先读 [学习路线](/guides/learning-path)
2. 用 pto-isa CPU 仿真跑通 `TADD` / GEMM
3. 再选一条主线深入：
   - **底层**：pto-isa Manual kernel
   - **编译器**：PTOAS IR / Pass
   - **上层**：PyPTO + pypto-lib 模型 kernel
