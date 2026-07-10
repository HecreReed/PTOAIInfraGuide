# 前置基础 · 模块总览

在写第一条 PTO 指令前，先建立硬件直觉。本模块对应 CUDA 教程里的「GPU 架构入门」。

## 文章列表

| 文章 | 内容 |
|------|------|
| [Ascend / CANN 全景](./ascend-cann) | 软硬件栈位置、CANN 角色 |
| [达芬奇架构与 1C2V](./davinci-1c2v) | AIC/AIV、pipeline 组成 |
| [存储层次与 Tile 映射](./memory-hierarchy) | GM/MAT/L0/UB 与 TileType |
| [A2 / A3 / A5 代际差异](./a2-a3-a5) | 同步、指令扩展、平台选择 |

## 学习目标

- 能用「工厂流水线」类比解释为什么要双缓冲  
- 看到 kernel 时能猜它是 Cube 为主还是 Vector 为主  
- 知道自己的目标芯片是 a2a3 还是 a5，对应哪些工具参数  
