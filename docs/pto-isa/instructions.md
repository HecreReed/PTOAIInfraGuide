# 指令分类与约定

> 权威列表见仓库 `docs/isa/`。这里给 AI Infra 学习用的分类地图。

## 计算类

| 类别 | 例子 | 典型 pipeline |
|------|------|----------------|
| 逐元素算术 | TADD, TSUB, TMUL, TDIV | VEC |
| 矩阵 | TMATMUL, TMATMUL_ACC | CUBE |
| 归约 | TREDSUM, TREDMAX | VEC |
| 激活/初等函数 | TRELU, TEXP, TLOG | VEC |
| 转换 | TCVT / cast 族 | VEC / 特殊路径 |
| 量化 / MX | TQUANT, TMATMUL_MX… | 混合 |

## 数据搬运类

| 指令族 | 作用 |
|--------|------|
| TLOAD / TSTORE | GM ↔ 片上 |
| TMOV / TEXTRACT / TTRANS / TRESHAPE | 片上布局与抽取 |

**性能关键**：搬运与变换经常成为隐藏瓶颈——profiler 上 TMATMUL 比例低，不见得是「算力不够」，可能是「粮草跟不上」。

## 通信类（扩展）

点对点、信号同步、集合通信相关原语（如 TGET / TPUT / 异步变体、TSIGNAL 等）。用途：

- 多核/多卡数据交换  
- 计算-通信融合（如 GEMM+AllReduce 样例）  

## 通用约定（务必遵守）

1. **类型与 shape 一致**：多数 elementwise 要求操作数同 dtype。  
2. **位置合法**：指令页会写允许的 TileType。  
3. **valid 语义以指令定义为准**：有的看 src valid，有的看 dst。  
4. **先正确后融合**：非法组合在 CPU-SIM 就应暴露。  

## 阅读顺序建议

1. conventions  
2. TLOAD/TSTORE + TADD  
3. TMATMUL  
4. Event  
5. 通信扩展（需要算通融合时）  
