# PyPTO 设计理念（深度）

## 1. 定位

**PyPTO**（发音 pai-p-t-o）是面向 AI 加速器的高性能编程框架：用 **Tile 编程范式** 和 **多级 IR**，把 Python 侧 Tensor 程序逐步降到 PTO 虚拟指令，再经 PTOAS/pto-isa 落地，并在设备上以 **MPMD** 方式调度执行。

它要同时讨好三类人：

| 角色 | 期望 | PyPTO 给的接口 |
|------|------|----------------|
| 算法 | 快写对 | Tensor 级 API |
| 性能 | 可下潜 | Tile/Block 控制、`pl.at` 粒度 |
| 系统 | 可集成 | 多级 IR、codegen、工具链 |

## 2. 核心特性精读

1. **Tile-based**：计算以硬件可消化的块为单位  
2. **多级图变换**：Tensor→Tile→Block→Execution，每级有 Pass  
3. **自动 Codegen**：落到 `.pto` 再进 PTOAS  
4. **MPMD 调度**：不同核不同程序片段是一等能力  
5. **工具链可视化**：编译产物 + 运行轨迹  
6. **Python 友好**：动态 shape / 符号  
7. **分层暴露**：不是「只给黑盒」也不是「只给汇编」  

## 3. 与邻居的边界

| 组件 | PyPTO 依赖它做什么 |
|------|-------------------|
| simpler | 设备任务图执行（submodule runtime） |
| PTOAS | `.pto`→优化→C++ |
| pto-isa | 指令实现 |
| pypto-lib | 业务算子与模型资产（下游） |
| torch | golden / 开发依赖（常装 CPU 版即可） |

## 4. 安装与最小验证

```bash
git clone https://github.com/hw-native-sys/pypto.git
cd pypto
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -e ".[dev]"

python examples/hello_world.py
python examples/kernels/06_softmax.py
python examples/models/01_ffn.py
```

构建：scikit-build-core + CMake 自动编 C++ 扩展；默认 `RelWithDebInfo`。

## 5. 许可证注意

CANN Open Software License 2.0：面向 **华为 AI 处理器** 体系使用。商用/分发前读 LICENSE。

## 6. 设计取舍（AI Infra 视角）

| 取舍 | 含义 |
|------|------|
| 自动 outline 成多 kernel | 换调度灵活性，付 hand-off 成本 |
| Python 前端 | 换生产力，付 tracing/编译复杂度 |
| 绑定 PTO | 换跨代与生态，付学习新 ISA 成本 |

## 7. 检验标准

- [ ] 三分钟讲清 PyPTO 解决什么、不解决什么  
- [ ] 本地跑通 hello + softmax  
- [ ] 画出与 PTOAS/pto-isa 的调用关系  
- [ ] 说明 MPMD 相对纯 SPMD 的动机  
