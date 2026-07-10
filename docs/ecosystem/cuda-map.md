# 与 CUDA 生态对照

更细的术语表见 [CUDA 对照速查](/guides/cuda-vs-pto)。这里给 **生态角色** 对照。

| CUDA 生态角色 | PTO 生态角色 |
|---------------|--------------|
| CUDA Toolkit | CANN + 驱动运行时 |
| CUDA C++ | pto-isa C++ intrinsics |
| CUTLASS | pto-isa manual kernels + 模板化实现 |
| Triton | PyPTO / TileLang-Ascend / PTODSL |
| nvcc / MLIR 后端 | PTOAS |
| cuBLAS / cuDNN | 昇腾数学库 + 自定义 PTO kernel |
| NCCL | HCCL + PTO 通信扩展 |
| PyTorch CUDA backend | torch_npu +（可选）PyPTO 路径 |
| vLLM 类推理栈 | 业务推理框架 + pypto-lib 类内核资产 |
| Nsight | msprof + swimlane + CostModel |

## 迁移学习策略

1. **别从重写 FA CUDA kernel 开始**——先跑通 pypto-lib sim。  
2. **保留你的性能方法论**（roofline、一次一变量、表格回归）。  
3. **替换你的执行心智**（Tile + pipeline event + MPMD）。  
4. **重建你的工具肌肉记忆**（命令、日志、产物目录）。  
