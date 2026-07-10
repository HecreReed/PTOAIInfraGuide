# GEMM 优化路径

## 参考资产

- pto-isa：`kernels/manual/a2a3/gemm_performance/`（及中文 README）  
- 教学价值：完整展示 tiling、多核划分、搬运与 Cube 重叠  

## 关键旋钮

1. **M/N/K 三维切分**：2D 输出切分 + K 方向累加  
2. **stepK 缓存**：提高 A/B 复用  
3. **L0 Left/Right/Acc 形状**：匹配 Cube 偏好  
4. **双缓冲 load**：隐藏 GM 延迟  
5. **多核 block_idx 映射**：负载均衡、连续访问  

## 数据流复习

```text
GM A/B → TLOAD → 片上 → TMATMUL → Acc → （可选 VEC）→ TSTORE C
```

## 与 cuBLAS 心智对照

你不需要第一天打赢库峰值，但应：

- 说清自己的 tile 策略  
- 测量相对基线（torch_npu / 官方库）  
- 知道下一刀该砍 tiling 还是同步  

## 练习

1. 读 performance README 表格，标出随 shape 变化的效率趋势  
2. 假设 K 很大、M/N 很小，预测 Bound 并写验证计划  
3. 比较 Auto 路径与 Manual 路径在同一 shape 上的差异（若环境允许）  
