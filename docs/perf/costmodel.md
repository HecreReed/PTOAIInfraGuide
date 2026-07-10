# CostModel 性能仿真

## 是什么

pto-isa 在演进 **CostModel**：对 PTO 指令序列做性能仿真，便于在没有完整上板或早期探索时估计瓶颈。A5 相关能力在 roadmap 中持续增强。

## 为什么需要

| 手段 | 优点 | 限制 |
|------|------|------|
| CPU-SIM | 正确性好 | 非性能模型 |
| 真机 msprof | 最真实 | 环境贵、迭代慢 |
| CostModel | 快速 what-if | 模型误差、覆盖度 |

## 使用建议

1. 先保证指令序列合法  
2. 用 CostModel 比较 tiling 方案 A/B  
3. 短名单再上板确认  
4. 把误差 case 反馈给模型（若参与社区）  

具体入口见 pto-isa 文档 `docs/costmodel*` 与测试目录 `tests/costmodel`。
