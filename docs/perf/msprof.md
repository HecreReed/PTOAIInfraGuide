# msprof 与 Profiling

## 作用

msprof 是昇腾上定位算子耗时与硬件计数的基础工具（对应 NVIDIA 的 Nsight 家族角色）。pto-isa 学习路径明确建议：上板后用 msprof 看 **CUBE / MTE / Vector Bound**。

## 使用心智

1. 固定 shape 与设备  
2. 采集 timeline / op 统计  
3. 对照 kernel 阶段假设  
4. 一次只改一个参数再采  

## 和 PTO 术语对齐

| 你想知道 | 看什么 |
|----------|--------|
| 是否在搬数 | MTE 相关占用 |
| Cube 是否吃饱 | 矩阵单元活跃与气泡 |
| epilogue 是否过重 | Vector 时长 |
| 多核是否不均 | 各核耗时分布 |

## 注意

- 权限、驱动、CANN 版本要匹配  
- 采样本身有扰动，看趋势而非绝对小数点  
- 与 pypto L2 swimlane 互补：msprof 偏硬件计数，swimlane 偏任务调度  
