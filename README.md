# PTO AI Infra Guide

> 昇腾原生 AI Infra 全栈宝典：从 PTO ISA / PTOAS / PyPTO 到算子优化

**在线阅读：https://hecrereed.github.io/PTOAIInfraGuide/**

结构参考 [AIInfraGuide](https://caomaolufei.github.io/AIInfraGuide/)（CUDA 版），内容面向 **PTO（Parallel Tile Operation）** 生态重写。

## 为什么做这个站

CUDA 侧已有系统化中文路径，但 Ascend 上的：

- [pto-isa](https://github.com/hw-native-sys/pto-isa)  
- [PTOAS](https://github.com/hw-native-sys/PTOAS)  
- [pypto](https://github.com/hw-native-sys/pypto)  
- [pypto-lib](https://github.com/hw-native-sys/pypto-lib)  

仍缺少一条把 **硬件 → 指令 → 编译器 → 框架 → 模型算子 → 性能分析** 串起来的学习地图。本站补这条地图。

## 内容模块

| 模块 | 说明 |
|------|------|
| 学习路线 | 五层知识图谱 + 检验标准 + 30 天计划 |
| 前置基础 | 达芬奇 1C2V、存储层次、A2/A3/A5 |
| PTO ISA | Tile 模型、指令、Event、CPU-SIM |
| PTOAS | 三级 IR、Pass、构建与前端 |
| PyPTO | 多级 IR、编程风格、MPMD runtime |
| PyPTO-Lib | 工作流、样例爬坡、调试精度 |
| 算子与优化 | 性能模型、GEMM、FA、通信融合 |
| 性能分析 | msprof、L2 swimlane、CostModel |
| 生态 | 四仓库协作与 CUDA 对照 |

## 本地预览

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
```

## 部署

推送到 `main` 后，GitHub Actions 自动发布 GitHub Pages。

仓库设置中启用 Pages：Source = **GitHub Actions**。

## 贡献

欢迎 Issue / PR 勘误与扩写。上游项目请向对应官方仓库贡献。

## License

本站文档与站点代码默认 MIT。引用上游代码请遵循各项目许可证。
