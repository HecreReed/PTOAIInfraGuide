# L2 Swimlane 与核间调度

来源：pypto-lib `docs/performance-tuning.md`。

## 采集

```bash
python models/qwen3/14b/qwen3_14b_decode.py -p a2a3 -d 0 --enable-l2-swimlane
```

产物大致在：

```text
build_output/<Program>_<ts>/dfx_outputs/
  l2_perf_records.json
  merged_swimlane_<ts>.json
```

可用 [Perfetto UI](https://ui.perfetto.dev/) 或 pypto-toolkit 插件打开。

## 症状 → 动作

| 症状 | 原因假设 | 动作 |
|------|----------|------|
| 核空闲但 AICPU 很忙 | kernel 太碎 | 合并 `pl.at`、折入内层 range |
| 单核长尾 | 某 kernel 过大/不均 | 拆分或重切分 |
| cube 忙 vector 闲 | epilogue 拆核 | 混放到同一 at |
| 顺序小任务排长队 | 该 parallel 写成 range | 改 parallel / spmd |

## 经验量级（文档经验）

A3/910C 上过小 kernel（例如远低于 ~50µs 量级）容易让调度开销显形——以你设备实测为准，但「太碎有害」是稳健结论。

## 层级回顾

- **L2**：芯片级 AICPU + 多核任务  
- **L1/L0**：更细的 cache/核内流水（再往下用 PMU/insight）  
