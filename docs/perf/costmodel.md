# CostModel 性能仿真（深度）

## 1. 定位

在指令序列层做 what-if，补位：

| 手段 | 优点 | 缺点 |
|------|------|------|
| CPU-SIM | 正确性 | 非性能 |
| 真机 | 真实 | 慢、贵 |
| CostModel | 快迭代 | 模型误差 |

## 2. 使用建议

1. 合法指令序列  
2. 对比 tiling A/B  
3. 短名单上板  
4. 误差反馈  

入口：pto-isa `docs/costmodel*`、`tests/costmodel`。

## 3. 检验标准

- [ ] 说明适用/不适用场景  
