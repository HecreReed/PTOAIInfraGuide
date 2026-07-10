# Tile 编程模型

## Tile 是什么

Tile 是 **固定容量的二维片上缓冲区**，是大多数 PTO 指令的操作数单位，也是 GM ↔ 片上搬运的基本粒度。

可用五类属性刻画：

1. **位置 Location（TileType）**：Vec / Mat / Left / Right / Acc / …  
2. **元素类型**：`float`、`half`、`int8_t`、低精度格式等  
3. **容量形状**：编译期 `Rows × Cols`  
4. **布局**：基础布局 + 可选分形/盒化布局  
5. **有效区域 valid**：本次操作有意义的行列前缀（可静态或动态）

## C++ 形态（概念）

```cpp
pto::Tile<
  pto::TileType::Vec,
  half,
  /*Rows=*/64,
  /*Cols=*/64
  // layout / valid / pad ...
> tile;
```

上层（PTO IR / PyPTO）用等价元数据表达同一事实。

## GlobalTensor

GlobalTensor 是 GM 上的轻量视图（shape/stride/layout），被 `TLOAD`/`TSTORE` 消费。记住：

- Tile **拥有**片上缓冲语义（在模型里）  
- GlobalTensor **不拥有**数据，只是视图  

## 有效区域规则

- 有效索引是连续前缀：`0 ≤ i < valid_row`，`0 ≤ j < valid_col`  
- 有效区外行为除非指令定义，否则 **unspecified**  
- 尾块、动态 shape、mask 都靠 valid 表达  

## 为什么固定容量

固定 shape 便于：

- 编译期特化与地址规划  
- 与硬件 buffer 分区对齐  
- 代价是：算法要自己切 tile，处理边界  

这与 CUDA 动态 shared mem 配置不同，更接近「寄存器块 + 明确容量预算」。
