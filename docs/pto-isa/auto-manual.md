# Auto / Manual 模式（完整工作流）

## 1. 一句话

- **Auto**：你描述数据流，工具链尽量管 buffer 与同步。  
- **Manual**：你显式管地址与顺序，换取流水线上限。  

二者与 **SPMD/MPMD** 正交。

## 2. 对比表

| 维度 | Auto | Manual |
|------|------|--------|
| 地址 | 编译器/运行时 | `TASSIGN` 等 |
| 同步 | 自动或隐式 | Event/flag/BufID |
| 开发速度 | 快 | 慢 |
| 性能上限 | 中 | 高 |
| 调试 | 相对简单 | 依赖图复杂 |
| 典型场景 | 正确性、教学、初期融合 | GEMM/FA 峰值、通信重叠 |
| CPU-SIM | 首选 | 可测，但 sync 语义被简化 |

## 3. Auto 风格特征

源码中：

- 无（或可忽略）`TASSIGN`  
- 无显式 event  
- 宏 `__PTO_AUTO__` 下 `TASSIGN` 可 no-op  

适合：

- 新算子先跑通  
- 给编译器 fusion/bufferization 空间  

## 4. Manual 风格特征

源码中：

- 明确 buffer 地址规划  
- Event 链完整  
- 双缓冲 index 与 warmup/drain 清晰  

适合：

- profiler 已证明自动方案不够  
- 需要与 DMA 深度重叠  

## 5. 推荐工作流（工业级）

```text
1. 算法用 Auto 或 PyPTO 写清
2. golden 锁精度
3. profiler/swimlane 找热点
4. 仅热点改 Manual / 调 pl.at 粒度 / 调 tiling
5. 回归精度 + 记录表格
6. 再考虑通信融合等大招
```

**反模式**：一上来全 Manual 双缓冲——你会同时调试算法、地址、同步三座山。

## 6. 与 PTOAS / PyPTO 的关系

| 层 | Auto 体现 | Manual 体现 |
|----|-----------|-------------|
| pto-isa | 少写 sync 的 demo | kernels/manual/* |
| PTOAS | InsertSync/PlanMemory | `--pto-level=level3` |
| PyPTO | 默认可自动 outline/codegen | 精细控制 at/pipeline/spmd |

## 7. 检验标准

- [ ] 同一 VecAdd 能写 Auto 与 Manual 两版并说明差异  
- [ ] 能决策「这个项目现在该 Auto 还是 Manual」  
- [ ] 理解 `__PTO_AUTO__` 对 TASSIGN 的影响  
