# PTO ISA · 模块总览

仓库：[hw-native-sys/pto-isa](https://github.com/hw-native-sys/pto-isa)

PTO（Parallel Tile Operation）是 CANN 定义的 **面向 tile 编程的虚拟 ISA**。本仓库提供 90+ 标准指令实现、CPU 仿真、NPU 测试、文档与高性能 kernel 样例。

## 文章

| 文章 | 内容 |
|------|------|
| [什么是 PTO ISA](./overview) | 定位、受众、生态位置 |
| [Tile 编程模型](./tile-model) | Tile 五要素与类型 |
| [指令分类与约定](./instructions) | 计算/搬运/通信 |
| [Event 与同步](./events) | 流水线依赖 |
| [Auto / Manual 模式](./auto-manual) | 两条开发路径 |
| [CPU 仿真快速上手](./cpu-sim) | 第一条命令 |

## 一句话心智

> 用固定容量的片上 Tile 表达计算与数据流；用 Event 表达流水线依赖；用统一指令面换跨代迁移，同时保留 tiling 与调度自由度。
