# CUDA 对照速查（详细迁移手册）

## 1. 概念表

| CUDA / GPU | PTO / Ascend | 迁移提示 |
|------------|--------------|----------|
| CUDA Core | VEC pipeline | 别找 warp shuffle 一一对应 |
| Tensor Core | CUBE | tile 形状更关键 |
| SM | AI Core (1C2V) | 内部已是异构 |
| Shared Memory | UB / L0 tiles | 类型化 + 静态容量 |
| Global Memory | GM | TLOAD/TSTORE |
| Registers | 标量 + 部分 tile 驻留 | 容量规划显式 |
| `__syncthreads` | Event/TSYNC | 跨 pipeline 细粒度 |
| grid/block/thread | block_idx + tile 循环 | 先 tile 后核 |
| PTX | PTO bytecode / IR | 中间层是虚拟 ISA |
| SASS | 后端实现 | 隐藏在 pto-isa |
| nvcc | PTOAS (+毕昇/CANN) | MLIR out-of-tree |
| Triton | PyPTO / TileLang / PTODSL | 都可落到 PTO |
| cuBLAS | 数学库 + manual GEMM | 对标学习用样例 |
| FlashAttention CUDA | FA PTO kernel | 算法同，载体异 |
| NCCL | HCCL + PTO 通信扩展 | 可算通融合 |
| Nsight Systems | msprof 时间线 | 方法论同 |
| Nsight Compute | 单元占比 / PMU | Bound 语言扩展 |
| CUDA Graph | 任务图 / simpler | MPMD 更常见 |

## 2. 思维转换练习

**练习 1**：把 CUDA 向量加 kernel 改写成 Tile 数据流。  
**练习 2**：把 shared memory tiling GEMM 映射到 L1/L0/stepK。  
**练习 3**：把 `__syncthreads` 换成最小 event 集。  

## 3. 常见误迁移

| 误区 | 后果 |
|------|------|
| 按线程想问题 | 写不出自然 PTO 代码 |
| 到处全局同步 | 性能崩 |
| 忽略 valid | 尾块错 |
| 把 SIM 性能当真机 | 决策错误 |
| 忽视 AICPU 调度 | 框架路径调不对 |

## 4. 检验标准

- [ ] 完成概念表默写 15 项  
- [ ] 三个练习各一页笔记  
