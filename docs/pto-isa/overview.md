# 什么是 PTO ISA

## 定位

PTO ISA 不是「再发明一套汇编好看」，而是：

1. **抬高抽象**：用 tile 操作描述算法，而不是绑死某一代微架构细节  
2. **保留性能面**：tile 尺寸、布局、指令序、同步仍可调  
3. **服务三方**：框架（PyPTO/TileLang）、算子库、编译器（PTOAS）共用同一指令契约  

官方表述的核心：**跨代统一 tile 抽象 + 可移植与可调优兼顾**。

## 覆盖范围

- 计算：算术、矩阵、归约、激活、类型转换、量化/MX 等  
- 数据搬运：TLOAD/TSTORE/TMOV/…  
- 通信扩展：点对点、信号、集合通信相关原语  
- 平台：A2 / A3 / A5 + CPU  

## 谁该学

| 角色 | 学到什么深度 |
|------|----------------|
| 框架开发 | 指令语义与约束，保证 lowering 合法 |
| 算子优化 | Manual kernel、双缓冲、核划分 |
| 性能工程 | Bound 分析与指令序 |
| 算法同学 | 可先停在 PyPTO；需要时再下潜 |

## 仓库里有什么

```text
include/pto/     公共头文件与 CPU/NPU 实现
kernels/manual/  手写高性能样例（GEMM、FA、通信）
demos/           Auto Mode 等示例
docs/isa/        指令手册
docs/coding/     编程模型与优化指南
tests/           CPU / NPU 测试入口
```

## 和上下层关系

```text
PyPTO / TileLang / PTODSL
        ↓  生成或调用
PTOAS (.pto → 优化 → C++)
        ↓  调用
pto-isa APIs  ← 你在这里
        ↓
硬件或 CPU-SIM
```
