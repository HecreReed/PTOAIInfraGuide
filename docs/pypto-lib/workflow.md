# 仓库结构与工作流

## 一键形态

```bash
# 需已安装 pypto + simpler + ptoas
python examples/beginner/hello_world.py -p a2a3sim
python models/qwen3/14b/qwen3_14b_decode.py -p a2a3 -d 0
```

| 参数 | 含义 |
|------|------|
| `-p a2a3` | 910B/C 真机 |
| `-p a2a3sim` | 对应仿真 |
| `-p a5` / `a5sim` | 950 路径 |
| `-d` | device id |
| `--enable-l2-swimlane` | 采集核间调度轨迹 |

## golden.run 流水线

1. 解析 program / jit 入口与 TensorSpec  
2. 编译 + codegen（可 dump passes）  
3. 生成输入与 torch golden  
4. device runtime  
5. 对比 rtol/atol，失败非 0 退出  

这是工业级算子库的「正确性闸门」：没有 golden，就没有回归。

## 依赖钉扎

四仓库版本应匹配（见 `.github/workflows/ci.yml` 钉扎）。混用过旧 PTOAS 与新 pypto 是常见「玄学编译失败」来源。

## 工程习惯

- `_draft.py` 表示进行中，CI 排除  
- 先 sim 后真机  
- 性能数字写入 README 表格，便于 PR 评审  
