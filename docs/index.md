---
layout: home
title: PTO AI Infra Guide
titleTemplate: PTO 版 AI Infra 宝典

hero:
  name: PTO AI Infra Guide
  text: 昇腾原生 AI Infra 全栈宝典
  tagline: 对标 CUDA 版 AIInfraGuide 的深度：从达芬奇硬件、PTO ISA、PTOAS、PyPTO 到算子优化与 Profiling（持续扩写）
  actions:
    - theme: brand
      text: 开始学习（详细路线）
      link: /guides/learning-path
    - theme: alt
      text: GitHub
      link: https://github.com/HecreReed/PTOAIInfraGuide
    - theme: alt
      text: 四仓库协作
      link: /ecosystem/four-repos

features:
  - title: 系统学习路线
    details: 五层知识图谱、检验标准、30 天计划、CUDA 迁移手册——不是目录列表。
    link: /guides/learning-path
  - title: 硬件与 1C2V
    details: 达芬奇流水线、存储层次、A2/A3/A5 同步模型差异。
    link: /prerequisites/
  - title: PTO ISA 深潜
    details: Tile 五要素、Event 双缓冲、Auto/Manual、CPU-SIM 完整实战。
    link: /pto-isa/
  - title: PTOAS 编译器
    details: 三级 IR、Pass、构建合同、CLI 与上板 harness。
    link: /ptoas/
  - title: PyPTO / Lib
    details: 多级 IR、coding style 陷阱、MPMD、golden 与模型爬坡。
    link: /pypto/
  - title: 算子与性能
    details: GEMM 四旋钮、FA、通信融合、msprof 与 L2 swimlane。
    link: /kernels/
---

## 为什么需要本站

CUDA 侧已有高质量中文路径（[AIInfraGuide](https://caomaolufei.github.io/AIInfraGuide/)）。  
昇腾 PTO 生态（pto-isa / PTOAS / pypto / pypto-lib）迭代快，但缺少同等粒度的 **「知识点 + 代码 + 检验标准 + 调优决策树」** 串联。

本站目标：

1. 用 AI Infra 工程师语言解释每层 **牺牲了什么、换取了什么**  
2. 给出可跑通命令与可验证 DoD  
3. 与 CUDA 知识对齐，降低迁移税  

## 全景

```text
模型（Qwen3 / DeepSeek）
  → pypto-lib + golden
  → pypto + simpler（MPMD）
  → PTOAS（.pto Pass）
  → pto-isa（90+ Tile 指令）
  → Ascend 1C2V
```

## 建议阅读顺序

1. [学习路线](/guides/learning-path)（长文，建议收藏）  
2. [CPU-SIM 上手](/pto-isa/cpu-sim)  
3. 选主线：ISA / 编译器 / PyPTO  
4. [GEMM](/kernels/gemm) 或 [L2 Swimlane](/perf/l2-swimlane)  

## 官方仓库

| 仓库 | 定位 |
|------|------|
| [pto-isa](https://github.com/hw-native-sys/pto-isa) | Tile ISA |
| [PTOAS](https://github.com/hw-native-sys/PTOAS) | 编译器 |
| [pypto](https://github.com/hw-native-sys/pypto) | 框架 |
| [pypto-lib](https://github.com/hw-native-sys/pypto-lib) | 算子与模型 |
