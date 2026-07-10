# PTOAS 定位与架构

## 一句话

> PTOAS = PTO 世界的「专用 assembler + optimizer + codegen」，把 `.pto` IR 变成可在昇腾上跑的内核代码骨架。

## 核心职责

1. **IR 解析与验证**：语义合法性  
2. **编译优化**：融合、自动同步、内存规划等  
3. **Lowering / Codegen**：EmitC 等路径 → 调用 pto-isa 的 C++  
4. **Python 绑定**：框架侧构建与编译 bytecode  

## 架构示意

```text
PyPTO / PTODSL / TileLang / 手写 .pto
              ↓
        PTO Dialect (MLIR)
              ↓
     Transforms (Passes)
              ↓
     C++ (pto-isa APIs)
              ↓
     真机 / 仿真 / 验证 harness
```

## 工具

| 工具 | 作用 |
|------|------|
| `ptoas` | 主编译/优化入口 |
| `ptobc` | bytecode 相关工具链能力 |

## 版本事实（写文档时）

- 上游活跃仓库：`hw-native-sys/PTOAS`  
- 发布可见 v0.50 一带（以 GitHub Releases 为准）  
- 构建强依赖：`vpto-dev/llvm-project` 的 `feature-vpto-llvm21`  

## 和 pto-isa 的边界

| 组件 | 管什么 |
|------|--------|
| PTOAS | 程序结构、优化、同步插入、缓冲规划、生成代码 |
| pto-isa | 指令「落地」的高性能实现与硬件/仿真后端 |

把两者揉成一个项目会失去「编译器 / 运行时库」清晰分工；保持边界是生态能长大的原因之一。
