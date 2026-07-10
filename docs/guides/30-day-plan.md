# 新人 30 天上手计划

目标：30 天内从「听说过昇腾」走到「能在 PTO 栈上独立完成一个小算子闭环」。

## 第 1 周：建立地图

| 天 | 任务 | 产出 |
|----|------|------|
| D1 | 读本站学习路线 + 四仓库 README | 手绘生态分层图 |
| D2 | 达芬奇 1C2V 与存储层次 | 一张内存图 + 三条典型数据流 |
| D3 | 装 pto-isa 依赖，跑 CPU-SIM | `run_cpu.py` 通过 |
| D4 | 读 Tile / Event 文档 | 笔记：Tile 五要素 |
| D5 | 跑 GEMM / FA demo（CPU） | 记录命令与结果 |
| D6 | 浏览 PTO 指令列表 | 自己做分类表 |
| D7 | 复盘 + CUDA 对照表 | 完成 [CUDA 对照](/guides/cuda-vs-pto) 练习 |

## 第 2 周：ISA 与正确性

| 天 | 任务 | 产出 |
|----|------|------|
| D8–9 | 读 demos Auto Mode Add | 解释 Auto 做了什么 |
| D10–11 | 读 Manual GEMM 结构 | 标出 load/compute/store 阶段 |
| D12 | 学 Event 双缓冲 | 画 warm-up / steady / drain |
| D13–14 | 选 1 个小 ST 用例跟读 | 写清 shape 与 dtype 约束 |

## 第 3 周：编译器与框架二选一

### 选项 B1：PTOAS

- 构建或使用现成 `ptoas` 二进制
- 用 sample 生成 `.pto` → 插入 sync → 出 C++
- 读 IR Level-2 `tile_buf` 示例

### 选项 B2：PyPTO

- `pip install -e .` 安装 pypto
- 跑 hello_world / softmax
- 读 `@pl.jit` 与 `pl.at` 风格文档

## 第 4 周：闭环

| 天 | 任务 |
|----|------|
| D22–24 | 在 pypto-lib beginner 目录跑通 simulator |
| D25–27 | 跟读 intermediate 一个算子 + golden 阈值 |
| D28–29 | 写一页性能/精度笔记（Bound 假设 + 误差阈值） |
| D30 | 整理个人知识卡：命令、路径、坑位清单 |

## 完成定义（Definition of Done）

- [ ] 能向同事 10 分钟讲清四仓库分工  
- [ ] CPU-SIM 或 sim 平台至少一条端到端命令可复现  
- [ ] 能指出自己 demo 里最可能的瓶颈阶段  
- [ ] 知道下一步该深挖 ISA / 编译器 / 框架哪条线  
