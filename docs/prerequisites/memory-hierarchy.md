# 存储层次与 Tile 映射（深度）

## 1. 层次与指令

```text
GM  ←TLOAD/TSTORE→  MAT(L1)  ←TEXTRACT/TMOV→  L0(Left/Right/Acc)
                         ↘
                          VEC/UB（向量主场）
```

## 2. TileType 映射表

见 [Tile 模型](/pto-isa/tile-model) 完整表。记忆口诀：

- 算元素 → Vec  
- 进矩阵引擎 → Left/Right/Acc  
- 在 L1 暂存 → Mat  

## 3. 算术强度直觉

\[
I \approx \frac{\text{FLOPs}}{\text{Bytes moved from GM}}
\]

提高 I：

- 更大复用（stepK、输出复用）  
- 更少中间写回  
- 更少布局变换  

## 4. 双缓冲与容量

双缓冲 ≈ 逻辑容量需求上升。  
先算 **单 buffer 上限**，再决定能不能开双缓冲。

## 5. 检验标准

- [ ] 画出 GEMM 数据流并标指令  
- [ ] 手算一组 tile 字节  
- [ ] 解释 valid 与物理容量区别  
