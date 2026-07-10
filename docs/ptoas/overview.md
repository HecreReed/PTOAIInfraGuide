# PTOAS 定位与架构（深度）

## 1. 它是什么

**ptoas**（PTO Assembler & Optimizer）是面向 **PTO Bytecode / `.pto` IR** 的专用编译工具链，构建在 **LLVM/MLIR** 之上（当前主线跟踪 **LLVM21 VPTO 分支** `vpto-dev/llvm-project:feature-vpto-llvm21`）。

一句话：

> 把「tile 程序」从 MLIR 方言变成可调用 pto-isa 的高效 C++，并尽可能自动处理同步与存储规划。

## 2. 为什么需要单独一个编译器

若每个前端（PyPTO、TileLang、PTODSL）各自直接 printf 出一堆 C++：

- 同步策略分裂  
- 无法共享 fusion / memory plan  
- 架构差异（A3/A5）散落各处  

PTOAS 把这些 **收口** 成：

```text
前端 → .pto (PTO Dialect) → Passes → C++(pto-isa APIs) → 设备编译/链接
```

## 3. 核心职责拆解

| 职责 | 细节 |
|------|------|
| 解析与验证 | Op 语义、类型、location 合法性 |
| 优化 Pass | 融合、同步插入、内存规划… |
| Lowering | EmitC 等路径 |
| 工具 | `ptoas` CLI、`ptobc` |
| 绑定 | Python / CAPI，对接框架 |

## 4. 仓库结构（抓重点）

```text
include/PTO/     TableGen 与方言定义
lib/PTO/         IR + Transforms
lib/Bindings/    Python
tools/ptoas      主编译器
tools/ptobc      bytecode 工具
test/lit         以 .pto 为中心的回归
ptodsl/          Python DSL
tilelang-dsl/    TileLang 相关
docs/            IR manual + designs
```

## 5. 在全栈中的位置

```text
pypto-lib 应用
   ↓
pypto codegen ──产生 .pto──┐
ptodsl / 手写 .pto ─────────┼→ PTOAS → kernels/aic|aiv/*.cpp
tilelang 路径 ──────────────┘            ↓
                                      pto-isa
```

**边界：**

- PTOAS 不管业务模型  
- pto-isa 不管全局任务图调度  
- simpler 管设备侧执行  

## 6. 版本与发布

- 上游：`hw-native-sys/PTOAS`  
- Releases：可见 v0.50 等（以 GitHub 为准）  
- 构建失败常见原因：**LLVM 版本/分支不对**、`pybind11>=3` 不兼容  

## 7. 学习路径

1. 读 README 构建章节（建立敬畏）  
2. 读 `PTO_IR_manual.md` 类型系统  
3. 跟 3 个 `test/lit/**/*.pto`  
4. 跑：`ptoas x.pto --enable-insert-sync -o x.cpp` 并 diff  
5. 读一个 design doc（fusion 或 bufid）  

## 8. 检验标准

- [ ] 画出 PTOAS 输入输出  
- [ ] 说出至少一个必须存在的 Pass 家族  
- [ ] 解释 Out-of-Tree 相对 in-tree 的含义  
- [ ] 知道 Python wheel 与 compiler tarball 的合同差异  
