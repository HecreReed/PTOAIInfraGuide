# 通信融合与 AllReduce

## 动机

大模型训练/推理里，通信经常与计算同样昂贵。若 GEMM 结束后再启动独立 AllReduce：

- 多一次全局同步  
- 无法用计算掩盖通信  
- 片上数据可能白写回再读出  

## 参考资产

- 带宽：`kernels/manual/a2a3/tget_bandwidth/`（TGET vs TGET_ASYNC）  
- 融合：`kernels/manual/a2a3/gemm_ar/`（GEMM + AllReduce 思路）  

## PTO 通信扩展角色

- 点对点远程读写  
- 信号同步  
- 集合通信原语（演进中）  

它们与计算指令共享 tile 抽象，使 **算通一体 kernel** 成为一等公民。

## 设计检查表

1. 通信粒度是否与 tile 匹配？  
2. 是否可用异步引擎与 Cube/Vec 重叠？  
3. 同步是否只卡在真实依赖？  
4. 多卡拓扑下是否选错路径（卡内 vs 卡间）？  

## 学习建议

先在单算子路径把计算打满，再引入通信；否则无法判断融合收益来自「算」还是「传」。
