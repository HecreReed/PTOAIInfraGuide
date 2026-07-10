# 优化 Pass 与同步插入（深度）

## 1. Pass 在流水线中的位置

```text
Parse/Verify → (规范化) → Fusion? → PlanMemory? → InsertSync/BufID? → Lower/Codegen
```

具体顺序以版本与 `--pto-level` 为准；**level3 常关闭** PlanMemory/InsertSync。

## 2. 同步插入（InsertSync 家族）

### 2.1 要解决的问题

从「仅数据依赖的 op 序列」推出 **跨 pipeline 的 event/flag**。

### 2.2 失败模式

| 模式 | 表现 |
|------|------|
| 过稀 | 真机偶发错误 |
| 过粗 | 正确但吞吐差 |
| arch 错配 | A5/A3 行为不一致 |

### 2.3 CLI

```bash
ptoas in.pto --enable-insert-sync -o out.cpp
ptoas in.pto --pto-arch=a5 --enable-bufid_sync -o out.cpp
```

## 3. PlanMemory

在合法前提下分配/规划片上地址，使 Manual 式 `TASSIGN` 不再必须由人完成。  
与 multi-buffer 属性交互：slot 数影响物理扇出。

## 4. Tile Fusion

合并相邻 tile op，减少中间材料化。  
收益：少访存、少 kernel/段。  
风险：合法融合边界、精度、寄存器/UB 压力。

设计文档：`ptoas-tile-fusion-design.md`。

## 5. 架构特化

`--pto-arch=a3|a5` 影响：

- 同步模型  
- 可用指令  
- 可能的 layout/对齐假设  

## 6. 调试 Pass 的方法

1. 最小 `.pto` 复现  
2. 关闭可疑 pass 对比  
3. dump 中间 IR（框架侧 `dump_passes`）  
4. 将问题分类：verifier / 同步 / 内存 / 后端  

## 7. 与性能的关系

自动同步保证正确是底线；**性能**往往还要：

- 前端少制造碎 op  
- fusion 抓住 epilogue  
- 双缓冲显式 multi-buffer  
- 必要时 level3 手写  

## 8. 检验标准

- [ ] 列举 4 类 Pass 家族  
- [ ] 说明 level3 的语义  
- [ ] 给出「怀疑 InsertSync 过粗」时的验证步骤  
