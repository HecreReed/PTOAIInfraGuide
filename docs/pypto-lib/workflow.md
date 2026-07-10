# 仓库结构与工作流（深度）

## 1. 目录职责

```text
examples/
  beginner/       工程骨架
  intermediate/   单段模式（softmax/rms_norm/rope…）
  advanced/       多段融合
models/
  qwen3/14b|32b/  prefill/decode
  deepseek/...    大模型路径
golden/           harness：编译-运行-对比
docs/             style/workflow/tuning/debug/precision
tools/            insight 导出
tests/            lint 与 golden-fn
```

`_draft.py`：进行中，CI 排除。

## 2. CLI 合同

```bash
python examples/beginner/hello_world.py -p a2a3sim
python models/qwen3/14b/qwen3_14b_decode.py -p a2a3 -d 0 --enable-l2-swimlane
```

| 参数 | 含义 |
|------|------|
| `-p a2a3` | 910B/C 真机 |
| `-p a2a3sim` | 仿真 |
| `-p a5`/`a5sim` | 950 |
| `-d` | device id |
| `--enable-l2-swimlane` | L2 轨迹 |
| `--export-kernel-insight` | （部分模型）导出 insight |

## 3. golden.run / run_jit 阶段

1. 解析 program 或 jit fn + specs  
2. compile_cfg（如 dump_passes）  
3. runtime_cfg（platform/device/dfx）  
4. 生成输入与 torch golden  
5. 执行  
6. rtol/atol 比较  

**失败必须非 0**——这是库级质量底线。

## 4. 依赖钉扎

四仓库版本应匹配 CI pin。混用「新 pypto + 旧 ptoas」是玄学之源。

## 5. 推荐 onboarding

| 天 | 任务 |
|----|------|
| 1 | hello sim |
| 2 | coding style 全文 |
| 3 | intermediate 一算子精读 |
| 4 | compile-runtime-workflow 对照 build_output |
| 5 | decode 模型跟读 + swimlane |

## 6. 检验标准

- [ ] 解释 beginner/intermediate/models 差异  
- [ ] 独立加一个 rtol 更严的实验并解读  
- [ ] 指出 CI pin 文件位置  
