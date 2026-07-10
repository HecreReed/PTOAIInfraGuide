# Flash Attention 优化（深度）

## 1. 为什么难

- 算法：online softmax 状态  
- 系统：多阶段 matmul + vec  
- 数值：exp/归一对精度敏感  
- 形状：S 从 1k 到 32k+ 行为剧变  

## 2. 算法核心（可迁移自论文）

标准 attention 朴素实现物化 \(S\times S\) 矩阵 → HBM 炸。  
FA 思想：

- 外层遍历 KV 块  
- 内层遍历 Q 块  
- 片上完成 QK→softmax→PV  
- online 归一避免两遍扫  

HBM 流量从 \(O(S^2)\) 级额外物化降到与序列更友好的量级（精确复杂度以论文为准）。

## 3. PTO 落地要点

1. **Cube** 负责 QK/PV matmul  
2. **Vec** 负责 rowmax/exp/rowsum 与状态更新  
3. 中间态尽量留在 **Vec/Acc tile**，少写 GM  
4. Event 串起 load 与两阶段计算  
5. 多核切 S 时处理 **尾块 valid**  
6. Prefill vs Decode Bound 不同，tile 策略勿雷同  

## 4. 仓库资产

- A2/A3：`kernels/manual/common/flash_atten/`  
- A5：`kernels/manual/a5/flash_atten/`  
- README 含 vs `torch_npu` 的参考加速表（随版本变化）  

## 5. 读性能表时注意

- 短序列：固定开销与启动占比高，加速比可很大  
- 长序列：趋近带宽/算法极限，加速比收敛  
- 务必对照实现是否 FA2/3 思想变体  

## 6. 调试顺序

1. 单 tile row-softmax 正确  
2. 单头小 S 对齐 torch  
3. 多 tile online 状态  
4. 多核  
5. 再开双缓冲与激进重叠  

## 7. 检验标准

- [ ] 白板画 FA 双层循环  
- [ ] 指出至少 3 处必须同步的边界  
- [ ] 说明 online softmax 保的是什么  
- [ ] 能解释「短序列加速比更大」  
