# L2 Swimlane 与核间调度（深度）

## 1. 采集

```bash
python models/qwen3/14b/qwen3_14b_decode.py -p a2a3 -d 0 --enable-l2-swimlane
```

产物：

```text
build_output/<Program>_<ts>/dfx_outputs/
  l2_perf_records.json
  merged_swimlane_<ts>.json
```

查看：Perfetto UI 或 pypto-toolkit。

## 2. 症状手册

| 症状 | 假设 | 动作 |
|------|------|------|
| 核闲 AICPU 忙 | kernel 太碎 | 合并 at、内折 range、目标 ~数十 µs 级粒度（以实测为准） |
| 单核长尾 | 过大/不均 | 拆分、重切 |
| cube 忙 vec 闲 | epilogue 拆核 | 同 at 混合 |
| 顺序小任务队 | 误用 range | parallel/spmd |

## 3. 改写模式

**模式 A：外折改内折**

```python
# before: 每 iter 一个 kernel
for b in pl.parallel(0, BATCH):
    with pl.at(...):
        ...

# after: 每 kernel 处理 BATCH_TILE
for b0 in pl.parallel(0, BATCH, BATCH_TILE):
    with pl.at(...):
        for b in pl.range(b0, b0+BATCH_TILE):
            ...
```

**模式 B：合并相邻 at**

**模式 C：matmul+epilogue 同 at**

## 4. 层级

- L2：芯片级任务  
- L1/L0：更细流水与 cache  

## 5. 检验标准

- [ ] 打开一份 swimlane 指出瓶颈  
- [ ] 完成一次合并 at 前后对比  
