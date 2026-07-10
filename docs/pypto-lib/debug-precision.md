# 调试与精度对齐（深度）

## 1. 调试武器库

| 手段 | 用途 |
|------|------|
| 读 pypto/ptoas 报错 | 编译期问题 |
| `golden_data` 重放 | 固定失败输入 |
| `runtime_dir` 复用编译 | 加速迭代 |
| device log | hang/同步 |
| dump-tensor / dep-gen | 中间值与依赖 DFX |
| `dump_passes` | IR 演变 |

详见上游 `docs/debugging.md`。

## 2. 精度工作流

来自 `precision-tuning.md` 的工程顺序：

1. **cast 舍入** 与 torch 对齐  
2. 中间 dtype 对齐  
3. 量化方案两端一致  
4. `error_distribution` 扫描阈值  
5. 真实权重回归，而不仅随机输入  

## 3. 故障树

```text
数值失败
├─ 全 0 → Out 方向 / 未 store / 错 device
├─ 仅尾部 → valid / 尾块 tiling
├─ 全体小偏 → bf16 累加序 / online softmax 实现差
├─ 局部爆炸 → 溢出、缺 dequant、错 scale
└─ 偶发 → 未初始化、竞态（真机 sync）
```

## 4. 建议门禁

- sim 严格阈值先过  
- 真机同阈值  
- 优化提交必须附：精度表 + 性能表  

## 5. 检验标准

- [ ] 独立用重放定位一次失败  
- [ ] 列出 5 条精度检查项  
- [ ] 解释为何随机输入不够  
