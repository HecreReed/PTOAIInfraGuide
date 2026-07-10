# PTO IR 三级模型（深度）

> 主文档：PTOAS `docs/PTO_IR_manual.md`。

## 1. 为什么要三级

编译器同时解决：

1. **算什么**（op 图）  
2. **数据放哪**（buffer 分配/复用）  
3. **何时执行**（pipeline 调度/同步）  

1+2+3 耦合会爆炸。PTO IR 选择 **显式分层**：

| Level | 抽象 | buffer | sync |
|-------|------|--------|------|
| L1 | SSA `pto.tile` 值 | 编译器后期规划 | 可后置 |
| L2 | DPS `tile_buf` | 显式 alloc / 复用 | 可自动插 |
| L3 | 调度 IR | 显式 | 显式 pipeline/event |

## 2. Level-2 为什么是当前重点

手册明确：公开 API 聚焦 L2/L3；L1 仍在演进。

L2 核心思想：

> `tile_buf` 是 **有生命周期的存储对象**，不是纯值。  
> 用户/上层决定复用；PTOAS 专注调度。

```mlir
%a0 = pto.alloc_tile : !pto.tile_buf<loc=vec, dtype=f16, rows=16, cols=16, v_row=16, v_col=16, blayout=row_major, slayout=none_box, fractal=512, pad=0>
pto.tload ins(%pv0 : !pto.partition_tensor_view<16x16xf16>)
          outs(%a0 : !pto.tile_buf<...>)
```

## 3. 类型系统精讲

### 3.1 元素类型

- 整数：i1/i8/i16/i32 及有符号变体（视 op）  
- 浮点：f16/f32/bf16  
- 低精度：f8E4M3FN、f8E5M2、hif8、打包 f4…  

**定义了类型 ≠ 所有 op 都支持**，要以 op 约束为准。

### 3.2 指针与视图

| 类型 | 含义 |
|------|------|
| `!pto.ptr<T[, space]>` | 类型化指针，space=gm/ub |
| `!pto.tensor_view<...>` | GM 张量描述符 |
| `!pto.partition_tensor_view` | 分片视图（tile 大小区域） |

### 3.3 `tile_buf` 字段清单

| 字段 | 含义 |
|------|------|
| loc | vec/mat/left/right/acc/bias |
| dtype | 元素类型 |
| rows/cols | 物理容量 |
| v_row/v_col | 有效区，可为 `?` |
| blayout/slayout | 布局 |
| fractal | 分形大小 |
| pad | padding 策略 |

### 3.4 `multi_tile_buf`

N 个同构 slot（2..16），表达双缓冲/多缓冲物理扇出。  
相关 op：`alloc_multi_tile`、`multi_tile_get`。  
设计见 `ptoas-multi-buffer-explicit-design.md`。

### 3.5 `local_array`

C++ 栈数组语义，**不参与** PTO 内存规划——与 tile 世界隔离。

## 4. DPS 对编程的影响

SSA 思维：每次运算产生新值。  
DPS 思维：运算写入已有 buffer。

影响：

- 原地更新自然  
- 生命周期分析不同  
- 与硬件 buffer 复用一致  

## 5. Level-3 什么时候用

- 手写极致流水线  
- 调试 InsertSync 是否过粗  
- 研究同步算法本身  

代价：你要自己保证依赖完备。

## 6. 与 codegen 的衔接

PyPTO 生成的 `.pto` 最终会落到这些类型与 op 上。  
读 IR 是回答「框架为何生成了两个 kernel / 为何多了一次 tmov」的最佳方式。

## 7. 检验标准

- [ ] 解释 L1/L2/L3 一句话差异  
- [ ] 默写 tile_buf 至少 6 个关键字段  
- [ ] 说明 multi_tile_buf 解决什么问题  
- [ ] 看一段 IR 指出哪是视图、哪是片上缓冲  
