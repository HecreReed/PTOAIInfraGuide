# PTO IR 三级模型

来源：PTOAS `docs/PTO_IR_manual.md`。

## 三级一览

| Level | 形态 | 谁管 buffer / 同步 |
|-------|------|---------------------|
| Level-1 | SSA `pto.tile` | 编译器规划存储 |
| Level-2 | DPS `pto.tile_buf` | 用户/上层显式 `alloc_tile`，调度仍可自动 |
| Level-3 | 低层 scheduling IR | pipeline/event 显式，专家掌控 |

设计动机（L2/L3）：**buffer 分配**与**流水线调度**都是难问题，耦合在一次 pass 里不现实。于是 IR 让上层先决定 buffer 生命周期，PTOAS 聚焦依赖与编排。

## 类型系统速览

- 元素类型：`i8/i16/i32`、`f16/f32/bf16`、以及 f8/f4 等低精度  
- `!pto.ptr<...>`：类型化指针（gm/ub）  
- `!pto.tensor_view` / `partition_tensor_view`：GM 视图与分片  
- `!pto.tile_buf<loc, dtype, rows, cols, ...>`：片上 tile 缓冲  

## 最小 IR 直觉

```mlir
%a0 = pto.alloc_tile : !pto.tile_buf<loc=vec, dtype=f16, rows=16, cols=16, ...>
pto.tload ins(%pv0 : !pto.partition_tensor_view<16x16xf16>)
          outs(%a0 : !pto.tile_buf<...>)
```

含义：先拿到一块 16×16 f16 的 vec tile，再从 partition view 载入。

## 和框架 lowering 的关系

- PyPTO codegen 产出 `.pto` 文本，再喂给 `ptoas`  
- 不同框架可能从 L1 或 L2 切入  
- 读 IR 是调试「自动生成 kernel 为何慢/错」的关键技能  

## 检验

- 解释 DPS 与 SSA 对「原地更新 / buffer 复用」意味着什么  
- 指出 Level-3 适合什么人，不适合什么人  
