import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'PTO AI Infra Guide',
  description: 'PTO 版 AI Infra 宝典：从 Ascend 硬件到 PTO ISA / PTOAS / PyPTO 全栈知识体系',
  lang: 'zh-CN',
  base: '/PTOAIInfraGuide/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,

  head: [
    ['meta', { name: 'theme-color', content: '#0b3d91' }],
    ['meta', { name: 'keywords', content: 'PTO,PTOAS,PyPTO,pto-isa,Ascend,CANN,NPU,AI Infra' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'PTO AI Infra Guide',
    outline: { label: '本页目录', level: [2, 3] },
    search: { provider: 'local' },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/HecreReed/PTOAIInfraGuide' },
    ],
    editLink: {
      pattern: 'https://github.com/HecreReed/PTOAIInfraGuide/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    footer: {
      message: '参考 AIInfraGuide 结构，面向 PTO / Ascend CANN 生态重写',
      copyright: 'MIT · HecreReed · 内容持续更新',
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '学习路线', link: '/guides/learning-path' },
      {
        text: '知识模块',
        items: [
          { text: '前置基础', link: '/prerequisites/' },
          { text: 'PTO ISA', link: '/pto-isa/' },
          { text: 'PTOAS 编译器', link: '/ptoas/' },
          { text: 'PyPTO 框架', link: '/pypto/' },
          { text: 'PyPTO-Lib', link: '/pypto-lib/' },
          { text: '算子与优化', link: '/kernels/' },
          { text: '性能分析', link: '/perf/' },
          { text: 'CANN 生态', link: '/ecosystem/' },
        ],
      },
      { text: '关于', link: '/about/' },
    ],
    sidebar: {
      '/guides/': [
        {
          text: '学习指南',
          items: [
            { text: 'PTO AI Infra 学习路线', link: '/guides/learning-path' },
            { text: '新人 30 天上手计划', link: '/guides/30-day-plan' },
            { text: 'CUDA 对照速查', link: '/guides/cuda-vs-pto' },
          ],
        },
      ],
      '/prerequisites/': [
        {
          text: '前置基础',
          items: [
            { text: '模块总览', link: '/prerequisites/' },
            { text: 'Ascend / CANN 全景', link: '/prerequisites/ascend-cann' },
            { text: '达芬奇架构与 1C2V', link: '/prerequisites/davinci-1c2v' },
            { text: '存储层次与 Tile 映射', link: '/prerequisites/memory-hierarchy' },
            { text: 'A2 / A3 / A5 代际差异', link: '/prerequisites/a2-a3-a5' },
          ],
        },
      ],
      '/pto-isa/': [
        {
          text: 'PTO ISA',
          items: [
            { text: '模块总览', link: '/pto-isa/' },
            { text: '什么是 PTO ISA', link: '/pto-isa/overview' },
            { text: 'Tile 编程模型', link: '/pto-isa/tile-model' },
            { text: '指令分类与约定', link: '/pto-isa/instructions' },
            { text: 'Event 与同步', link: '/pto-isa/events' },
            { text: 'Auto / Manual 模式', link: '/pto-isa/auto-manual' },
            { text: 'CPU 仿真快速上手', link: '/pto-isa/cpu-sim' },
          ],
        },
      ],
      '/ptoas/': [
        {
          text: 'PTOAS 编译器',
          items: [
            { text: '模块总览', link: '/ptoas/' },
            { text: 'PTOAS 定位与架构', link: '/ptoas/overview' },
            { text: 'PTO IR 三级模型', link: '/ptoas/ir-levels' },
            { text: '优化 Pass 与同步插入', link: '/ptoas/passes' },
            { text: '构建与 CLI 用法', link: '/ptoas/build-usage' },
            { text: 'PTODSL / TileLang-DSL', link: '/ptoas/frontends' },
          ],
        },
      ],
      '/pypto/': [
        {
          text: 'PyPTO 框架',
          items: [
            { text: '模块总览', link: '/pypto/' },
            { text: 'PyPTO 设计理念', link: '/pypto/overview' },
            { text: '多级 IR 与编译流程', link: '/pypto/ir-pipeline' },
            { text: '编程风格与 API', link: '/pypto/coding-style' },
            { text: 'MPMD 执行与 simpler 运行时', link: '/pypto/mpmd-runtime' },
          ],
        },
      ],
      '/pypto-lib/': [
        {
          text: 'PyPTO-Lib',
          items: [
            { text: '模块总览', link: '/pypto-lib/' },
            { text: '仓库结构与工作流', link: '/pypto-lib/workflow' },
            { text: '从 Hello World 到模型', link: '/pypto-lib/examples' },
            { text: '调试与精度对齐', link: '/pypto-lib/debug-precision' },
          ],
        },
      ],
      '/kernels/': [
        {
          text: '算子与优化',
          items: [
            { text: '模块总览', link: '/kernels/' },
            { text: '性能模型与调优流程', link: '/kernels/perf-model' },
            { text: 'GEMM 优化路径', link: '/kernels/gemm' },
            { text: 'Flash Attention 优化', link: '/kernels/flash-attention' },
            { text: '通信融合与 AllReduce', link: '/kernels/comm-fusion' },
          ],
        },
      ],
      '/perf/': [
        {
          text: '性能分析',
          items: [
            { text: '模块总览', link: '/perf/' },
            { text: 'msprof 与 Profiling', link: '/perf/msprof' },
            { text: 'L2 Swimlane 与核间调度', link: '/perf/l2-swimlane' },
            { text: 'CostModel 性能仿真', link: '/perf/costmodel' },
          ],
        },
      ],
      '/ecosystem/': [
        {
          text: 'CANN 生态',
          items: [
            { text: '模块总览', link: '/ecosystem/' },
            { text: '四仓库协作关系', link: '/ecosystem/four-repos' },
            { text: '与 CUDA 生态对照', link: '/ecosystem/cuda-map' },
            { text: '资源索引与贡献入口', link: '/ecosystem/resources' },
          ],
        },
      ],
      '/about/': [
        {
          text: '关于',
          items: [
            { text: '项目说明', link: '/about/' },
            { text: '更新日志', link: '/about/changelog' },
          ],
        },
      ],
    },
  },
})
