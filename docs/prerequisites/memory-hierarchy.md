# 存储层次与 Tile 映射

## 层次总览

```text
GM (Global Memory / HBM)
        ↕ TLOAD / TSTORE
MAT (Matrix L1)
  ├─ LEFT  (L0A)
  ├─ RIGHT (L0B)
  ├─ ACC   (L0C)
  └─ BIAS
VEC / UB (Unified Buffer)  ← 向量 tile 主战场
```

## TileType 映射

| TileType | 典型位置 | 用途 |
|----------|----------|------|
| `Vec` | UB | 逐元素、归约、softmax 中间态 |
| `Mat` | Matrix L1 | 通用矩阵暂存 |
| `Left` | L0A | `TMATMUL` 左矩阵 |
| `Right` | L0B | `TMATMUL` 右矩阵 |
| `Acc` | L0C | 累加器 / 矩阵输出 |
| `Bias` / `Scaling` | 辅助缓冲 | 偏置与缩放路径 |

## 典型 GEMM 数据流

```text
GM --TLOAD--> MAT --TMOV/TEXTRACT--> Left/Right
                                      |
                                   TMATMUL
                                      ↓
                                     Acc --TSTORE--> GM
```

向量 epilogue（如 bias + activation）常把 Acc 结果转到 `Vec` tile 再写回。

## 调优含义

1. **容量约束是硬的**：tile 静态 `Rows×Cols` 必须放得下。  
2. **布局影响引擎效率**：分形/盒化布局服务矩阵引擎偏好。  
3. **有效区域（valid）**：处理尾块与动态 shape 的关键，未定义区不要假设有值。  
4. **复用决定算术强度**：同一次 load 参与更多 compute，才能摆脱 MTE Bound。

## 检验

不看文档，回答：

- Softmax 的中间 exp 更可能在哪个 TileType？  
- 为什么 double buffer 通常至少需要两套同形 tile？  
- Acc 上的结果为什么有时不直接 `TSTORE` 而要先 `TMOV`？  
