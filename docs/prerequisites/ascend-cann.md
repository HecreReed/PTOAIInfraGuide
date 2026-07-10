# Ascend / CANN 全景（深度）

## 1. 栈的位置

```text
业务应用 / 训练框架 / 推理服务
        ↓
CANN（驱动、运行时、图编译、算子、工具）
        ↓
可选高性能路径：PyPTO / PTOAS / pto-isa / TileLang …
        ↓
Ascend 硬件（910B / 910C / 950 …）
```

类比 NVIDIA：

| NVIDIA | 昇腾 |
|--------|------|
| GPU 驱动 + CUDA Runtime | CANN 驱动/运行时 |
| CUDA C++ / PTX | Ascend C / PTO / … |
| cuBLAS/cuDNN | 数学库 + 自定义算子 |
| NCCL | HCCL 等 |
| Nsight | msprof 等 |

## 2. 为什么还要 PTO

传统路径能做算子，但在：

- 跨代迁移  
- 复杂融合  
- 编译器自动优化  
- 算通一体  

上成本高。PTO 提供 **虚拟 Tile ISA + 工具链收口**。

## 3. 你要装什么（决策表）

| 目标 | 最小集合 |
|------|----------|
| 学指令语义 | pto-isa + CPU-SIM |
| 玩 IR/Pass | + PTOAS (+LLVM) |
| 写 Python 融合 | + pypto (+simpler) |
| 跑模型核 | + pypto-lib +（真机）CANN |

## 4. 版本纪律

- CANN、驱动、内核、PTO 工具链 **钉扎**  
- 文档与 SoC 名（910B1、950…）以当前工具为准  
- 不要混用随机 LLVM  

## 5. 检验标准

- [ ] 画出含 PTO 的软件栈  
- [ ] 为三种目标选出安装集合  
- [ ] 解释 PTO 与 CANN 不是替代关系  
