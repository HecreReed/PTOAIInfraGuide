# 从 Hello World 到模型（深度路径）

## 1. 爬坡表

| 阶段 | 路径 | 学习目标 | 完成标准 |
|------|------|----------|----------|
| L0 | beginner/hello_world | 平台参数、harness | sim 绿 |
| L1 | intermediate/softmax 等 | 单段 at/parallel | 读懂数据流 |
| L2 | intermediate/rms_norm rope | 融合与 dtype | 改一处不炸 |
| L3 | advanced/* | 多段+指令组合 | 能画阶段图 |
| L4 | models/qwen3 decode | 整网编排 | swimlane 能讲 |
| L5 | deepseek/* | 复杂路由/专家 | 知道风险点 |

## 2. 读代码时的批注模板

对每个入口函数记录：

1. TensorSpec 列表与方向  
2. 外层 parallel 维  
3. 每个 `pl.at` 的 name_hint 与大概 op  
4. 预期 outline 成几个 InCore  
5. golden_fn 对应关系  
6. 已知精度阈值  

## 3. 最小对比实验

```bash
# baseline
python examples/intermediate/xxx.py -p a2a3sim

# 合并两个 at 后再跑
# 记录：编译时间、是否数值过、（真机）时延
```

## 4. 与 pto-isa manual 对照学

| 问题 | 先看 |
|------|------|
| 指令级双缓冲怎么写 | pto-isa gemm_performance |
| 框架里怎么表达同类事 | pypto-lib + pl.pipeline/at |
| 整网怎么拼 | models/* |

## 5. 检验标准

- [ ] 完成 L0–L2  
- [ ] 输出一份个人批注（至少 1 个 intermediate）  
- [ ] 能向同事讲解 decode 主路径阶段  
