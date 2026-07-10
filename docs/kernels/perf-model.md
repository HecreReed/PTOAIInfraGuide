# 性能模型与调优流程（深度）

## 1. 阶段流水线模型

几乎所有高性能 kernel 都是：

```text
TLOAD → Transform(TEXTRACT/TMOV/…) → COMPUTE(CUBE|VEC) → TSTORE
```

优化三目标：

1. **重叠** load/transform/compute/store  
2. **提高算术强度**（FLOP/Byte）  
3. **消灭虚假依赖**  

## 2. Bound 语言

| 画像 | 解释 | 优先动作 |
|------|------|----------|
| TLOAD→100% | 供给极限 | 减流量、stepK、复用、重叠 |
| TEXTRACT 高 | 布局/提取税 | 改 base tile、减 extract、重叠 |
| TMATMUL 低 | Cube 饿或气泡 | 查依赖与供给 |
| VEC 长 | epilogue 重 | 融合、算法、专用指令 |
| AICPU 忙核闲 | 调度顶 | 合并 kernel |

## 3. 可重复实验协议

1. 固定平台与 CANN/驱动版本  
2. 固定 shape 集合（小/中/大）  
3. warm-up + 多次计时  
4. **一次只改一个旋钮**  
5. 同步记录精度  
6. 表格入库（README/CI）  

## 4. 两级调优（框架场景）

### L2 核间

工具：`--enable-l2-swimlane` → Perfetto  
动作：parallel、合并 at、spmd、增大 kernel 粒度  

### L1/L0 核内

工具：msprof、PMU、kernel insight  
动作：tile、双缓冲、指令序、布局  

**先 L2 后 L1**：内核再快，喂不进去也白搭。

## 5. 与 CUDA Roofline 对照

Roofline 思想完全可迁移：  
算力墙 vs 带宽墙。  
达芬奇只是把墙拆成 **CUBE 墙 / VEC 墙 / MTE 墙 / 调度墙**。

## 6. 检验标准

- [ ] 独立解读一张「阶段占比表」  
- [ ] 写出你自己的实验记录模板  
- [ ] 说明为何禁止一次改三个参数  
