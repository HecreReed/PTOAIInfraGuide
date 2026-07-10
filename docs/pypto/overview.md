# PyPTO 设计理念

## 要解决什么问题

写融合算子乃至整网时，如果只在框架图层面拼基础 op，会：

- 启动与访存开销大  
- 难以表达跨核异构流水  
- 性能专家缺乏下潜接口  

PyPTO 给出 **分层抽象**：

| 层级 | 面向 | 关注点 |
|------|------|--------|
| Tensor | 算法开发者 | 形状、dtype、算法正确性 |
| Tile | 性能专家 | 分块、片上复用 |
| Block / Execution | 系统开发者 | 核划分、任务图、调度 |

## 核心特性（官方归纳）

- Tile-based 编程模型  
- 多级计算图变换与 Pass  
- Codegen 到 PTO 虚拟指令  
- MPMD 执行调度  
- 工具链可视化与可控编译  
- Python 友好 API、动态 shape / 符号  

## 安装最小集

```bash
git clone https://github.com/hw-native-sys/pypto.git
cd pypto
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -e ".[dev]"
python examples/hello_world.py
python examples/kernels/06_softmax.py
```

## 依赖兄弟组件

| 组件 | 角色 |
|------|------|
| simpler（submodule runtime） | 设备侧任务依赖图执行 |
| PTOAS | `.pto` → 优化 → C++ |
| pto-isa | 指令实现 |
| pypto-lib | 算法与模型资产 |

许可证注意：CANN Open Software License 2.0，使用范围绑定华为 AI 处理器生态。
