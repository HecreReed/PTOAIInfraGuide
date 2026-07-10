# CUDA 对照速查

如果你来自 CUDA / Triton 背景，这张表可以减少「术语翻译税」。

## 概念对照

| CUDA / GPU 生态 | PTO / Ascend 生态 | 备注 |
|-----------------|-------------------|------|
| CUDA Core / Tensor Core | VEC pipeline / CUBE unit | 达芬奇分单元更显式 |
| SM | AI Core（AIC + AIV 组合） | 1C2V 是核心心智模型 |
| Shared Memory / Registers | UB(Vec Tile) / L0 Left·Right·Acc | Tile 是一等公民 |
| Global Memory / HBM | GM | TLOAD/TSTORE 进出片上 |
| `__syncthreads` / pipeline | Event Set/Wait、BufID（A5） | 专家常手写依赖边 |
| CUDA C++ kernel | pto-isa C++ intrinsics | 更偏 tile 指令 |
| PTX / SASS | PTO bytecode / 底层 ISA 实现 | 中间层是虚拟 ISA |
| nvcc | PTOAS（+ 毕昇/CANN 工具链） | Out-of-tree MLIR |
| Triton | PyPTO / TileLang-Ascend / PTODSL | 都可落到 PTO |
| cuBLAS / FlashAttention lib | pto-isa kernels / pypto-lib | 手写与框架库并存 |
| NCCL | PTO 通信扩展（TGET/TPUT/…）+ HCCL 等 | 可做算通融合 |
| Nsight Systems/Compute | msprof、L2 swimlane、CostModel | 工具链不同但方法论类似 |
| SPMD grid/block/thread | SPMD block_idx + MPMD task | PyPTO 更强调 MPMD 任务图 |

## 编程模型差异（重要）

1. **Tile 优先，而不是 thread 优先**  
   CUDA 习惯 threadIdx 扫元素；PTO 习惯固定容量 Tile 上的指令。

2. **同步是流水线资源**  
   不是处处 barrier，而是 MTE↔CUBE↔VEC 之间的细粒度依赖。

3. **跨代抽象是一等目标**  
   pto-isa 明确要在 A2/A3/A5 间迁移；CUDA 虽有兼容，但生态更多绑定架构特性。

4. **上层框架默认 MPMD**  
   PyPTO 把不同核上的不同程序图当作常态；这和「一个 kernel 所有 SM 跑一样」的直觉不同。

## 学习迁移建议

- 会写 CUDA Reduce / GEMM tiling → 直接迁移到 PTO Manual 的阶段流水线思维  
- 会 Triton → 优先学 PyPTO `pl.at` + 自动 lowering，再下潜 ISA  
- 会读 MLIR → 直接攻 PTO dialect 与 PTOAS Pass  
