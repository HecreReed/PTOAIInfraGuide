# msprof 与 Profiling（深度）

## 1. 角色

msprof ≈ 昇腾上的「Nsight 家族入口」：看时间线、op 耗时、硬件计数，判断 **CUBE/MTE/VEC** 谁是瓶颈。

## 2. 使用协议

1. 固定 shape 与设备  
2. 固定版本  
3. 采集  
4. 对照 kernel 阶段假设  
5. 只改一个参数再采  

## 3. 解读表

| 问题 | 看什么 |
|------|--------|
| 是否在搬数 | MTE 相关 |
| Cube 吃饱吗 | 矩阵单元活跃与气泡 |
| epilogue | Vector 时长 |
| 多核不均 | 各核分布 |

## 4. 与 swimlane 分工

- msprof：偏硬件  
- L2 swimlane：偏任务调度  
二者互补，不可互相替代。

## 5. 检验标准

- [ ] 完成一次采集并写出 Bound 结论  
- [ ] 说明采样扰动  
