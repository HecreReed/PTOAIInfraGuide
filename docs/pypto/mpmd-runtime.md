# MPMD 执行与 simpler 运行时

## SPMD vs MPMD

| | SPMD | MPMD |
|--|------|------|
| 程序 | 各核同一入口 | 不同核可跑不同程序/任务 |
| 典型 | 规则张量切分 | 融合图、多阶段异构任务 |
| 在 PTO 栈 | pto-isa 手工 kernel 常见 | PyPTO 默认叙事更强调 |

PyPTO 把可执行体加载到设备后，由调度器把不同 tile 程序派到 AICPU/AICore 资源上。

## simpler 的位置

`pypto` 仓库通过 submodule 引入 **simpler** 运行时：

- 构建并执行 **task dependency graph**  
- 覆盖 AICPU + AICore  
- 提供分层 runtime 视角（L2 芯片级 / L1 / L0 核级）——见性能调优文档  

没有 runtime，编译器再强也只是「生成了一堆 kernel 文件」。

## 对性能的含义

1. **Kernel 粒度过细** → AICPU 调度成为顶端瓶颈  
2. **依赖边过长** → 并行度被串行化  
3. **cube/vector 拆核** → 额外 hand-off；有时要合并进同一 `pl.at`  

这些都不是 ISA 算子微优化能单独解决的，必须在 **图调度层** 处理。

## 学习建议

- 先会写正确的 `pl.function`  
- 再看一次完整 `build_output/` 目录结构  
- 然后用 `--enable-l2-swimlane` 把调度「看见」  

详见：[L2 Swimlane](/perf/l2-swimlane)
