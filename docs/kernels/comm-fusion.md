# 通信融合与 AllReduce（深度）

## 1. 动机

若计算结束 → 写 GM → 独立通信算子 → 再读：

- 多同步  
- 少重叠  
- 浪费片上数据仍热时的窗口  

PTO 通信扩展让 **远程数据运动** 进入与 TLOAD/TMATMUL 同一套 tile 故事。

## 2. 关键样例

| 样例 | 学什么 |
|------|--------|
| `tget_bandwidth` | TGET vs TGET_ASYNC 带宽与路径（UB 中转 vs DMA 直连） |
| `gemm_ar` | GEMM 与 AllReduce 融合流水 |

## 3. 设计检查单

- [ ] 通信粒度与 tile 匹配  
- [ ] 异步是否真能与 Cube/Vec 重叠  
- [ ] 同步是否只卡真依赖  
- [ ] 拓扑：卡内/卡间路径是否选对  
- [ ] 数值：归约顺序与 dtype  

## 4. 与分布式训练课的关系

AIInfraGuide 的 AllReduce 通信量公式仍适用；  
PTO 侧多了 **算通同核/同图融合** 的实现维度。

## 5. 检验标准

- [ ] 解释同步 get 与异步 get 的差异动机  
- [ ] 画出 GEMM+AR 可能的重叠时间轴  
