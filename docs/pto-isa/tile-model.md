# Tile 编程模型（深度）

> 对应上游：`docs/coding/Tile_zh.md`、`GlobalTensor_zh.md`、`tutorial_zh.md`。

## 1. 为什么需要 Tile

GPU 程序员习惯：线程 + 共享内存。达芬奇程序员面对的是：

- 矩阵单元要吃 **固定偏好的小块**  
- 向量单元在 **UB** 上做 SIMD 风格运算  
- 片上容量有限且分区明确  

于是 PTO 把「小块二维缓冲」提升为一等类型：**Tile**。

类比：

- CUDA shared memory tile ≈ 你手写的一块 smem  
- PTO Tile ≈ **带类型位置、静态容量、布局、有效区的规范化 smem 对象**，并且绝大多数指令只吃 Tile。

## 2. Tile 五要素（必须背）

### 2.1 位置 Location（`TileType`）

| TileType | 典型物理/逻辑位置 | 干什么 |
|----------|-------------------|--------|
| `Vec` | UB | 逐元素、规约、softmax 中间态 |
| `Mat` | Matrix L1 | 通用矩阵暂存 |
| `Left` | L0A | TMATMUL 左 |
| `Right` | L0B | TMATMUL 右 |
| `Acc` | L0C | 累加/矩阵输出 |
| `Bias`/`Scaling` | 辅助 | 偏置与缩放路径 |

**指令页会写清允许哪些 Location。** 把 Vec 当 Left 用，轻则编译失败，重则静默错结果。

### 2.2 元素类型

`float` / `half` / 整型 / bf16 / 低精度（f8、打包 f4 等）。  
dtype 不仅影响精度，还影响 **tile 字节 footprint**（能否塞进 32KiB 一类预算）。

### 2.3 容量形状 `Rows_ × Cols_`

多数指令要求 **编译期静态 shape**，以便特化与地址规划。  
算法侧负责外层循环切大张量。

### 2.4 布局

- **BLayout**：RowMajor / ColMajor  
- **SLayout / fractal**：盒化分形，服务矩阵引擎偏好的 base tile（常见 fractal 512/1024 字节级参数）  

布局选错 → 额外 `TTRANS/TEXTRACT` → 性能税。

### 2.5 有效区域 valid

- 完全静态：`valid == capacity`  
- 动态：`DYNAMIC`，运行时 `GetValidRow/Col`  
- 语义：有效区是 **连续前缀**；区外 **unspecified**  

尾块、mask、动态 shape 全靠它。这是新手写错数值的重灾区。

## 3. C++ 类型长相

```cpp
pto::Tile<
  pto::TileType Loc_,
  Element_,
  Rows_,
  Cols_,
  pto::BLayout BLayout_ = pto::BLayout::RowMajor,
  RowValid_ = Rows_,
  ColValid_ = Cols_,
  pto::SLayout SLayout_ = pto::SLayout::NoneBox,
  SFractalSize_ = pto::TileConfig::fractalABSize,
  pto::PadValue PadValue_ = pto::PadValue::Null
>;
```

常用别名思维：

```cpp
template <typename T, int R, int C>
using VecTile = Tile<TileType::Vec, T, R, C, BLayout::RowMajor>;
```

## 4. GlobalTensor：GM 上的视图

```cpp
// 2D 语法糖思路
GT2D<T, rows, cols> g(ptr);
```

心智模型：

> **GlobalTensor = 把这个 GM 指针解释成带 shape/stride/layout 的矩阵视图。**

它不拥有内存；`TLOAD/TSTORE` 消费它。

对比：

| | Tile | GlobalTensor |
|--|------|----------------|
| 在哪 | 片上 | GM |
| 拥有缓冲？ | 模型上是片上对象 | 否，视图 |
| 谁用 | 大多数计算指令 | 内存指令 |

## 5. 第一个完整故事：VecAdd

### 5.1 Auto

```cpp
#include <pto/pto-inst.hpp>
using namespace pto;

template <typename T, int kRows, int kCols>
AICORE void VecAddAutoOneTile(__gm__ T* out, __gm__ T* in0, __gm__ T* in1) {
  using GT = GT2D<T, kRows, kCols>;
  using TileT = Tile<TileType::Vec, T, kRows, kCols, BLayout::RowMajor, DYNAMIC, DYNAMIC>;

  GT g0(in0), g1(in1), gout(out);
  TileT t0(kRows, kCols), t1(kRows, kCols), tout(kRows, kCols);

  TLOAD(t0, g0);
  TLOAD(t1, g1);
  TADD(tout, t0, t1);
  TSTORE(gout, tout);
}
```

为何叫 Auto：无 `TASSIGN`、无显式 Event。适合 CPU-SIM 验证。

### 5.2 Manual（地址 + Event）

```cpp
TASSIGN(t0, 0x0000);
TASSIGN(t1, 0x4000);
TASSIGN(tout, 0x8000);

Event<Op::TLOAD, Op::TADD> e0;
Event<Op::TADD, Op::TSTORE_VEC> e1;

TLOAD(t0, g0);
e0 = TLOAD(t1, g1);
e1 = TADD(tout, t0, t1, e0);
TSTORE(gout, tout, e1);
```

`TASSIGN` 在 `__PTO_AUTO__` 下可能是 no-op——Auto/Manual 由编译宏与写法共同决定。

## 6. 进阶模式

### 6.1 Row Softmax（单 tile）

```text
TLOAD
TROWMAX → TROWEXPAND → TSUB
TEXP
TROWSUM → TROWEXPAND → TDIV
TSTORE
```

这是 FlashAttention 里 softmax 阶段的积木。

### 6.2 GEMM（单 tile 骨架）

```text
TLOAD A,B → Mat
TMOV/TEXTRACT → Left/Right
TMATMUL → Acc
(可选 VEC epilogue)
TSTORE
```

K 方向多 tile 用 `TMATMUL_ACC` 累加；真实 kernel 还要双缓冲与多核。

### 6.3 多核 SPMD

```cpp
auto cid = get_block_idx();
// 用 cid 计算本核负责的 m0/n0 偏移
```

切分原则：连续访问、负载均衡、尽量 2D 切 M/N。

## 7. 容量预算怎么算（实战）

以 fp16、L0 单 buffer 32KiB 为例：

\[
\text{bytes} \approx rows \times cols \times 2
\]

- `128×64×2 = 16KiB`  
- `64×256×2 = 32KiB`（贴满）  

再开双缓冲，逻辑上需要 **两套** 不重叠区域。  
这就是为什么 tiling 是「一阶旋钮」：它同时决定正确性（放不放得下）与性能（算术强度）。

## 8. 常见坑清单

| 坑 | 症状 | 处理 |
|----|------|------|
| valid 未设尾块 | 边界数值错 | 动态 valid |
| Location 不对 | 编译/运行失败 | 查指令页 |
| 布局不匹配 | 多一截 transform | 源头选对 layout |
| 静态 shape 写死过大 | 片上溢出 | 降 base tile |
| 忽略 pad 语义 | 脏数据进计算 | 明确 PadValue |

## 9. 检验标准

- [ ] 默写 Tile 五要素  
- [ ] 解释 Vec 与 Left 不能混用的原因  
- [ ] 手算一个 baseM/baseN/baseK 的字节数是否 ≤ 预算  
- [ ] 读懂一段含 DYNAMIC valid 的声明  
- [ ] 独立改 VecAdd tile 尺寸并在 CPU-SIM 验证  

## 10. 推荐阅读顺序

1. 本文  
2. 上游 `Tile_zh.md` 全文  
3. `GlobalTensor_zh.md`  
4. `Event_zh.md`  
5. `tutorial_zh.md` 第 5–6 节  
