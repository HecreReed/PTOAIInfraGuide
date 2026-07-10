# 指令分类与约定（地图 + 工程约束）

> 权威语义以 `docs/isa/*` 为准。本章解决：**如何在脑子里检索指令，而不是背 90 页手册**。

## 1. 分类地图

### 1.1 计算 · 向量

| 子类 | 例子 | 备注 |
|------|------|------|
| 算术 | TADD TSUB TMUL TDIV | 同 dtype 居多 |
| 比较选择 | 各类 compare/select | 注意谓词与 mask |
| 初等函数 | TEXP TLOG TRELU… | 精度与性能折中 |
| 归约 | TREDSUM TREDMAX TROWMAX TROWSUM | 输出 shape 变 |
| 广播/展开 | TROWEXPAND 等 | softmax 常用 |

### 1.2 计算 · 矩阵

| 例子 | 角色 |
|------|------|
| TMATMUL | 基础乘 |
| TMATMUL_ACC | K 方向累加 |
| 低精度/MX 变体 | 带宽优化路径 |

前置搬运往往是：`TLOAD → Mat → TMOV/TEXTRACT → Left/Right`。

### 1.3 搬运与布局

| 指令族 | 作用 | 性能敏感点 |
|--------|------|------------|
| TLOAD/TSTORE | GM↔片上 | 带宽、对齐、burst |
| TMOV | tile 间移动 | 多余拷贝 |
| TEXTRACT | L1→L0 提取 | GEMM 中占比可不低 |
| TTRANS/TRESHAPE | 布局变换 | 能避免则避免 |

### 1.4 内存/缓冲管理

| 概念 | 作用 |
|------|------|
| TASSIGN | Manual 绑定片上地址 |
| alloc（IR 层） | PTOAS `pto.alloc_tile` |

### 1.5 同步

Event、TSYNC、flag、A5 BufID —— 见 [Event 专章](./events)。

### 1.6 通信扩展

| 类型 | 例子/方向 | 用途 |
|------|-----------|------|
| 点对点 | TGET/TPUT 及异步 | 远程读写 |
| 信号 | TSIGNAL 等 | 跨核同步 |
| 集合 | 演进中 | AllReduce 等 |

样例：`tget_bandwidth`、`gemm_ar`。

### 1.7 量化与卷积等扩展

随 Release 增加；做业务前先查 **当前** isa 目录是否已有实现与平台支持矩阵。

## 2. 通用约定（违反就等着炸）

1. **dtype 一致性**：多数 elementwise 要求操作数同类型  
2. **Location 合法性**：指令只接受声明过的 TileType  
3. **valid 域**：以指令定义为准（有的跟 src，有的跟 dst）  
4. **对齐与 fractal**：矩阵路径常有隐式对齐假设  
5. **空 valid**：`v_row=0` 等表示空区域，别当「全有效」  
6. **低精度打包**：f4 打包类型的 shape 可能是 **物理 packed 维**，不是逻辑元素数  

## 3. 读指令页的方法

打开任意 `docs/isa/TXXX.md`，按固定顺序扫：

1. 支持的 dtype / location  
2. shape 约束  
3. 同步要求  
4. 特殊舍入/饱和  
5. 平台差异（A5 only？）  

## 4. 从算法到指令的翻译练习

### 4.1 `C = A + B`（同 shape）

`TLOAD A, TLOAD B, TADD, TSTORE`

### 4.2 行 softmax

`TROWMAX, expand, TSUB, TEXP, TROWSUM, expand, TDIV`

### 4.3 `C = A @ B`

`TLOAD, TEXTRACT/TMOV, TMATMUL[_ACC], TSTORE` + 多核循环

### 4.4 FA 一块

QK^T（matmul）→ online softmax 状态更新 → PV（matmul）→ 输出累加；中间尽量留在片上。

## 5. 性能视角的指令选择

| 目标 | 优先 |
|------|------|
| 提高算术强度 | 更大有效计算 tile、减 TLOAD 次数 |
| 减布局税 | 源头 layout 对齐 Cube |
| 重叠 | 双缓冲 + 精确 event |
| 融合 | 能在 Vec 上完成的 epilogue 别写回 GM 再读 |

## 6. 检验标准

- [ ] 能把 90+ 指令粗分成 6 大桶  
- [ ] 不看文档写出 GEMM 与 Softmax 的指令链草稿  
- [ ] 解释 f4 packed shape 的坑  
- [ ] 在 isa 目录定位一条指令的约束页  

## 7. 推荐精读清单

1. conventions  
2. TLOAD/TSTORE  
3. TADD  
4. TMATMUL  
5. TROWMAX/TROWSUM  
6. 通信 README  
