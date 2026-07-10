# PTODSL / TileLang-DSL 前端（深度）

## 1. 为什么会有多前端

同一套 pto-isa 语义，可以有：

| 前端 | 风格 | 更像 |
|------|------|------|
| 手写 `.pto` | IR | 编译器教材 |
| PTODSL | Python tile/JIT | CuTile 级 |
| TileLang-DSL | Tile 语言 | SPMD DSL |
| PyPTO | Tensor/图 | 框架级 |

终点都是指令契约；前端差异在 **抽象高度与调度模型**。

## 2. PTODSL

- 随 ptoas Python 分发：`import ptodsl`  
- 更贴近 kernel 拼装  
- 适合研究 pass 与快速试 IR 语义  

## 3. TileLang 路径

- 仓库 `tilelang-dsl/` + 社区 TileLang Ascend  
- SPMD tile 程序也可落到 PTO  

## 4. 选型

| 需求 | 选择 |
|------|------|
| 整网/融合/调度 | PyPTO+lib |
| 研究编译 | `.pto`+PTOAS |
| 快速 tile 实验 | PTODSL |
| 已有 TileLang 资产 | TileLang 路径 |

## 5. 检验标准

- [ ] 一句话区分四前端  
- [ ] 知道 PTODSL 安装合同依赖 ptoas wheel  
