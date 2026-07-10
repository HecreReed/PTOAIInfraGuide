# 性能模型与调优流程

## 阶段流水线模型

多数高性能 kernel：

```text
TLOAD → (layout transform) → COMPUTE(CUBE/VEC) → TSTORE
```

优化目标：

1. 最大化阶段重叠  
2. 提高算术强度（每字节搬运对应更多 FLOP）  
3. 消灭不必要同步气泡  

## Bound 直觉

| Profiler 画像 | 含义 | 方向 |
|---------------|------|------|
| TLOAD 接近打满 | feed-limited | 减流量、加复用、双缓冲 |
| Transform 占比高 | 布局税 | 选对初始 layout |
| TMATMUL 很低 | Cube 挨饿 | 重叠、tile、带宽 |
| VEC 很长 | epilogue 重 | 融合、算法简化、专用指令 |

## 可重复流程（pto-isa 风格）

1. 正确性：CPU-SIM / golden  
2. 固定 shape set  
3. 定位阶段  
4. **一次只改一个杠杆**（tiling / 核划分 / 重叠）  
5. 记录表格，防止「玄学回退」  

## 两级调优（pypto-lib 风格）

| 级别 | 看什么 | 典型动作 |
|------|--------|----------|
| L2 | 核间 swimlane | 合并 pl.at、parallel、增大 kernel |
| L1/L0 | 核内流水与 PMU | tile 填满 buffer、双缓冲、指令序 |

先 L2 后 L1：内核再快，若 AICPU 喂不进核，也白搭。
