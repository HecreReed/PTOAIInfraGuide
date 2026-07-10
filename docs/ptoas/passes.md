# 优化 Pass 与同步插入

## 常见 Pass 家族（概念）

| Pass | 解决什么 | 关闭/降级场景 |
|------|----------|----------------|
| InsertSync / 相关同步 | 自动补 pipeline 依赖 | 已是 Level-3 手写同步 |
| BufID Sync（A5） | 用 buffer 序减少 event 压力 | 非 A5 目标 |
| PlanMemory | 地址/缓冲规划 | level3 专家路径 |
| Tile Fusion | 合并 tile 级 op，减往返 | 调试正确性时 |
| Arch lowering | 面向 a3/a5 差异 | 交叉编译注意 arch 标志 |

CLI 层面常见：

```bash
ptoas input.pto --enable-insert-sync -o out.cpp
ptoas input.pto --pto-arch=a5 --enable-bufid_sync -o out.cpp
ptoas input.pto --pto-level=level3 -o out.cpp   # 偏向保留手工调度
```

## 为什么同步插入是核心

手写 event 易错且费时；完全不插则错误或过保守。编译器插入策略要在 **正确性** 与 **重叠度** 间折中。

性能回退常见原因：

- 插入过粗 → 流水线气泡  
- 融合边界错误 → 非法依赖或多余拷贝  
- arch 选错 → 错误同步模型  

## 调试建议

1. 先在无优化/少 pass 路径对齐数值  
2. 逐个打开 pass，对比 `.pto` / 生成 C++ diff  
3. 对可疑 kernel 保留 `dump` 中间文件（框架侧常有 dump_passes）  
4. 将「编译器问题」与「算法问题」用 golden 隔开  

## 和设计文档

仓库 `docs/designs/`、`ptoas-tile-fusion-design.md`、`bufid_sync_a5_design.md` 等是进阶读物；贡献 pass 前先读对应 design。
