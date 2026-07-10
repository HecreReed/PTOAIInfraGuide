# Ascend / CANN 全景

## 昇腾在 AI Infra 中的位置

昇腾（Ascend）是华为的 AI 处理器产品线，CANN（Compute Architecture for Neural Networks）是其异构计算软件栈。对 AI Infra 工程师来说，CANN 大致对应 NVIDIA 世界里 **CUDA Toolkit + 驱动 + 集合通信 + 部分编译/算子库** 的组合。

```text
应用 / 训练框架 / 推理引擎
        ↓
CANN（运行时、图编译、算子、工具）
        ↓
PTO 生态（可选高性能路径：PyPTO / PTOAS / pto-isa）
        ↓
Ascend 硬件（910B / 910C / 950 …）
```

## 为什么还需要 PTO

传统 Ascend C / TBE 等路径已经能开发算子，但跨代迁移、融合算子表达、编译器自动优化仍有成本。PTO 的价值在于：

- **虚拟 Tile ISA**：用统一指令面描述计算与搬运  
- **保留调优旋钮**：tile shape、顺序、同步仍可控  
- **对接现代编译器**：MLIR dialect + Python 框架  

因此 PTO 不是「替代 CANN」，而是 CANN 生态内 **面向高性能与可移植的一层**。

## 你需要安装什么（心智模型）

| 目标 | 通常需要 |
|------|----------|
| 只学 ISA 语义 | pto-isa + C++20 + CPU-SIM |
| 编译 `.pto` | PTOAS + LLVM/MLIR（VPTO 分支） |
| 写 Python 融合算子 | pypto（+ simpler runtime） |
| 跑模型级 kernel | pypto-lib + 上述依赖 +（可选）真机 CANN |

## 实践建议

1. 没有 NPU 时，优先 CPU-SIM / `a2a3sim` / `a5sim`。  
2. 有 NPU 时，先固定 `soc-version` / `-p a2a3|a5`，再谈性能。  
3. 文档与版本强绑定：PTOAS 现依赖 **LLVM21 VPTO 分支**，不要混用随意 LLVM。  
