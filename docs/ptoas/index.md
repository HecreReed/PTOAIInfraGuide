# PTOAS · 模块总览

仓库：[hw-native-sys/PTOAS](https://github.com/hw-native-sys/PTOAS)

**ptoas** 是基于 **LLVM/MLIR（LLVM21 VPTO 分支）** 的 Out-of-Tree 编译器工具链，面向 **PTO Bytecode**：解析 `.pto`、跑达芬奇相关优化 Pass、生成调用 pto-isa 的 C++，并提供 Python 绑定对接 PyPTO / PTODSL 等。

## 文章

| 文章 | 内容 |
|------|------|
| [定位与架构](./overview) | 在栈中的位置 |
| [PTO IR 三级模型](./ir-levels) | L1/L2/L3 |
| [优化 Pass](./passes) | sync、memory、fusion |
| [构建与 CLI](./build-usage) | 安装与常用命令 |
| [前端生态](./frontends) | PTODSL / TileLang-DSL |
