# 调试与精度对齐

## 调试入口

官方文档：`docs/debugging.md`（仓库内）。常见手段：

- 读 pypto / ptoas 报错信息（先修编译）  
- `golden_data` 重放失败输入  
- `runtime_dir` 复用编译产物  
- device log 查挂死  
- dump-tensor / dep-gen 等 DFX 开关  

## 精度调优清单

来自 `docs/precision-tuning.md` 的工程要点：

1. **`pl.cast` 舍入模式** 与 torch 参考一致  
2. kernel 与 golden 的中间 dtype 对齐  
3. 量化方案两端一致  
4. `error_distribution` 阈值扫描，区分「偶发尖峰」与「系统偏差」  
5. 真实权重测试，不只看随机输入  

## 典型坑

| 现象 | 排查 |
|------|------|
| 全 0 输出 | Out 方向、是否真的 store、错误 device |
| 仅尾部错误 | valid/尾块 tiling |
| 全盘微小偏差 | bf16/fp16 累加顺序、online softmax 实现差 |
| 大偏差 | 错 kernel、错 stride、漏 dequant |

## 建议流程

```text
sim 上 golden 严格过关
  → 真机同阈值
  → 再开性能优化
  → 每次优化后回归精度表
```

性能优化若不管精度，最后只是「跑得快的错误答案」。
