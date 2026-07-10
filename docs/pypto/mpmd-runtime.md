# MPMD 执行与 simpler 运行时（深度）

## 1. SPMD vs MPMD

| | SPMD | MPMD |
|--|------|------|
| 程序 | 同入口，数据不同 | 不同程序/任务 |
| 典型 | 规则 GEMM 切块 | 融合图、多阶段异构 |
| 调试 | 相对直观 | 要看任务图 |

PyPTO 把 MPMD 当默认能力：orchestration 把不同 InCore 派到 AIC/AIV 资源。

## 2. simpler 是什么

`pypto` 的 `runtime` submodule 指向 **simpler**：

- 构建/执行 **task dependency graph**  
- 协同 **AICPU + AICore**  
- 分层视角：L2 芯片 / L1 / L0（见 simpler 文档 hierarchical level）  

没有它，codegen 只是「生成了许多 kernel 文件」。

## 3. 调度如何变成性能

### 3.1 太碎

现象：swimlane 上 AICPU 实心，核空闲。  
动作：合并 at、内折 range、增大每核工作量。

### 3.2 太胖/不均

现象：单核长尾。  
动作：拆分、重切分、负载均衡。

### 3.3 错误依赖

现象：可并行却串行。  
动作：parallel/spmd、去掉伪依赖。

## 4. 和通信/多卡

MPMD 任务图上挂通信任务时，算通重叠才有「图级」空间；仅靠单 kernel 内双缓冲不够讲清整网。

## 5. 检验标准

- [ ] 解释 simpler 输入输出  
- [ ] 给出「碎 kernel」的三条改写策略  
- [ ] 说明 L2 调优为何优先于抠单指令  
