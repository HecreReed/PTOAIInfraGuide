# PyPTO · 模块总览

仓库：[hw-native-sys/pypto](https://github.com/hw-native-sys/pypto)

PyPTO（发音 pai-p-t-o）是面向 AI 加速器的高性能编程框架：以 **Tile 编程** 为核心，通过多级 IR 把 Tensor 级程序降到 PTO 虚拟指令，再经 PTOAS/pto-isa 落地，并在设备上以 **MPMD** 方式调度。

## 文章

| 文章 | 内容 |
|------|------|
| [设计理念](./overview) | 特性与目标用户 |
| [多级 IR 与编译](./ir-pipeline) | Tensor→Execution |
| [编程风格与 API](./coding-style) | jit/program/at |
| [MPMD 与 simpler](./mpmd-runtime) | 运行时层级 |
