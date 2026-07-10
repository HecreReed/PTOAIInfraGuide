# 达芬奇架构与 1C2V

## 一句话

Ascend AI Core 常以 **1C2V** 组织：1 个 **AIC**（矩阵/向量全能核心）+ 2 个 **AIV**（向量侧核心）。高效 kernel 的目标是让 CUBE、VEC、MTE 等流水线尽可能重叠。

## 结构示意

```text
┌──────────────── Physical Core ────────────────┐
│  AIC                                          │
│   SCALAR | MTE2 | MTE1 | CUBE | VEC | FIXP    │
│                                               │
│  AIV0                    AIV1                 │
│   MTE2 | VEC | FIXP | MTE3   (同上)           │
└───────────────────────────────────────────────┘
```

### 单元职责

| 单元 | 作用 | 典型 PTO 指令 |
|------|------|----------------|
| CUBE | 矩阵乘累加 | `TMATMUL`、`TMATMUL_ACC` |
| VEC | 逐元素、归约、激活 | `TADD`、`TREDSUM`、`TEXP` |
| MTE2 | GM ↔ 片上 | `TLOAD` / 相关搬移 |
| MTE1 | L1 ↔ L0 准备 | 布局/提取类路径 |
| FIXP | 定点/量化相关 | 量化与格式路径 |
| SCALAR | 控制流与标量 | 循环、索引 |

## 为什么 1C2V 影响编程

1. **异构并行**：矩阵阶段与向量 epilogue 可在不同单元推进。  
2. **独立搬运**：AIC/AIV 各自 MTE 能力意味着数据供给可以并行。  
3. **调度形状**：PyPTO 把 cube-only 与 vector-only 区域 outline 成不同 InCore 函数，再由运行时编排——这不是偶然，而是硬件使然。

## 流水线重叠直觉

```text
时间 →
CUBE:  [  matmul tile0  ][ matmul tile1 ]
MTE2:  [load1][load2][load3]...
VEC:           [epilogue0][epilogue1]
```

若同步过粗，你会看到大量气泡；若 tile 太小，启动与同步开销吞噬收益。

## 和 CUDA 的类比（有限）

- CUBE ≈ Tensor Core 路径  
- VEC ≈ CUDA Core 向量路径  
- 但 **线程束/warp** 心智不要硬套；PTO 以 Tile 指令与 pipeline event 表达并行。  
