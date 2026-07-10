# Flash Attention 优化

## 为什么 FA 是「毕业题」

- 计算与访存交织  
- online softmax 数值敏感  
- 多阶段（QK、softmax、PV）要在片上复用  
- 序列长度跨数量级，tiling 策略要稳  

## 参考资产

- pto-isa：`kernels/manual/common/flash_atten/`、`kernels/manual/a5/flash_atten/`  
- 官方 README 给出 910B2 上相对 `torch_npu` 的加速表示例（随版本变化，以仓库为准）  

## 优化要点（PTO 视角）

1. **按块遍历 KV，复用 Q tile**（经典 FA tiling）  
2. **online softmax 状态**放在合适的 Vec tile  
3. **Cube 负责 matmul，Vec 负责 softmax 路径**，中间少 round-trip GM  
4. **多核切 S 维**时注意负载与尾块 valid  
5. Decode 与 Prefill 的 Bound 不同，不要共用一套「拍脑袋 tile」  

## 和 CUDA FA 论文对照

算法思想可迁移；实现载体变为 Tile 指令 + 达芬奇流水线。读论文建立「为何省 HBM」，读 pto-isa kernel 建立「如何在 UB/L0 上落地」。

## 检验

- 白板画出 FA 外层 KV 块、内层 Q 块循环  
- 指出至少一处必须同步的依赖边  
- 说明为何长序列下加速比可能收敛  
