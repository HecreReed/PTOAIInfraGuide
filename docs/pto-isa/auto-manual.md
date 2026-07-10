# Auto / Manual 模式

## 一张表

| 维度 | Auto | Manual |
|------|------|--------|
| 目标用户 | 快速正确、可移植 | 性能专家 |
| 内存放置 | 编译器/运行时 | 开发者（如 TASSIGN） |
| 同步 | 自动插入 | 显式 Event/TSYNC |
| 调度/融合 | 工具链尽量做 | 开发者主导 |
| 现状 | CPU 仿真路径更成熟 | 高性能 kernel 主路径 |

二者与 **SPMD / MPMD** 正交：可以有 SPMD-Auto、SPMD-Manual、MPMD-Manual 等组合。

## 推荐工作流

```text
Auto（或高层 PyPTO）验证算法正确性
        ↓
定位热点阶段（load / cube / vec）
        ↓
对热点改为 Manual 控制 tiling 与同步
        ↓
回归数值 + 性能表
```

## 和 PyPTO 的关系

- PyPTO 让多数人停留在更高层，由编译器生成 PTO  
- 当自动结果不理想，下潜到 pto-isa Manual 或调整 `pl.at` 粒度 / tile 策略  
- PTOAS 的 insert-sync / plan-memory 是 Auto 能力在编译器侧的体现  

## 检验

- 能说明 Auto 省了什么劳动、可能丢掉什么峰值  
- 能在 Manual kernel 里指出至少一处显式依赖边  
