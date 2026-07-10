# 从 Hello World 到模型

## 推荐爬坡

| 阶段 | 路径 | 学什么 |
|------|------|--------|
| 入门 | `examples/beginner/` | 工程骨架、平台参数、最小 tensor op |
| 进阶 | `examples/intermediate/` | softmax、rms_norm、rope 等单段模式 |
| 高级 | `examples/advanced/` | 多段融合、指令组合 |
| 模型 | `models/qwen3/*`、`deepseek/*` | prefill/decode 整链 |

## 阅读代码时盯什么

1. entry 的 `pl.Out` / `pl.InOut`  
2. `pl.parallel` vs `pl.range`  
3. `pl.at` 的切分粒度（是否过碎）  
4. golden_fn 与 kernel 的 dtype/round 是否一致  
5. 常量 tiling 参数是否写死了目标 shape 假设  

## 最小实验建议

```bash
python examples/beginner/hello_world.py -p a2a3sim
# 改一个 tile 常量或合并一个 pl.at，再跑
# 记录：编译是否过、数值是否过、sim 时间变化（仅作相对参考）
```

## 与 pto-isa kernels 的分工

| 资产 | 更偏 |
|------|------|
| pto-isa `kernels/manual` | 指令级极致、教学与后端参考 |
| pypto-lib | 框架化生产、模型集成、回归体系 |

两者都要看：一个教「刺刀」，一个教「战役」。
