# 多级 IR 与编译流程

## 编译阶段（概念）

```text
用户 Python（Tensor API / pl.function）
        ↓
Tensor Graph
        ↓ Pass 族
Tile Graph
        ↓
Block Graph
        ↓
Execution Graph / 可调度形态
        ↓ Codegen
.pto（PTO MLIR 文本）
        ↓ ptoas
AIC/AIV C++ kernels + 编排信息
        ↓ runtime (simpler)
NPU 执行
```

## 与 pypto-lib 实测路径对齐

运行 `python kernel.py -p a2a3` 时，golden harness 会：

1. **Compile**：程序变换，outline 出 Orchestration + 多个 InCore  
2. **Codegen**：InCore → `.pto` → `ptoas` → `kernels/aic|aiv`  
3. **准备输入 / golden**  
4. **Runtime** 加载执行  
5. **Compare** rtol/atol  

`dump_passes=True` 时保留中间产物，是学编译器行为的最佳教材。

## Outline 规则（直觉）

- 每个 `pl.at(CORE_GROUP)` 区域倾向变成 InCore 函数  
- 混合 cube + vector 的区域可能被拆成 **cube-only + vector-only** 两个 kernel  
- 最终通常：**1 个 Orchestration + N 个 InCore**

这解释了性能文档里「相邻 `pl.at` 太碎会让 AICPU 调度成为瓶颈」。

## 调试分层

| 症状 | 先查哪一层 |
|------|------------|
| 编译报错 / 非法 op | 前端类型与 shape、IR verifier |
| 生成代码离谱 | dump `.pto` 与 ptoas 日志 |
| 数值不对 | golden 对齐、cast 模式、In/Out 方向 |
| 很慢但正确 | swimlane 与 tiling，而非先怀疑 ISA 实现 |
