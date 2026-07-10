# 构建与 CLI 用法

## 依赖事实

- OS：Linux 为主（开发）  
- CMake ≥ 3.20、Ninja、C++17+  
- Python 3.8+；`pybind11<3`、`nanobind`、`numpy`  
- LLVM：**VPTO 适配的 llvm21 分支**，shared + MLIR Python  

## 推荐安装合同

官方 README 强调：需要 Python/PTODSL 时，优先：

```bash
cd PTOAS
pip install . --no-build-isolation
# 或开发
pip install -e . --no-build-isolation
```

然后：

```python
import ptodsl
from mlir.dialects import pto as mlir_pto
```

仅解压 compiler tarball **不保证** `import ptodsl` 可用。

## CLI 速查

```bash
ptoas test/lit/pto/empty_func.pto
ptoas input.pto --enable-insert-sync -o out.cpp
ptoas input.pto --pto-arch=a5 -o out.cpp
ptoas --version
```

## 环境变量（直接吃 build tree 时）

```bash
export MLIR_PYTHON_ROOT=.../mlir_core
export PTO_PYTHON_ROOT=.../install
export PYTHONPATH=$PTO_PYTHON_ROOT:$MLIR_PYTHON_ROOT:$PYTHONPATH
export LD_LIBRARY_PATH=.../llvm/lib:.../install/lib:$LD_LIBRARY_PATH
export PATH=.../build-llvm21/tools/ptoas:.../ptobc:$PATH
```

## 上板验证思路

1. sample 生成 `.cpp`  
2. `test/npu_validation/scripts/generate_testcase.py` 生成 harness  
3. 指定 `--soc-version Ascend910B1` 或 `Ascend950`  
4. `run.sh` 对比 golden  

无卡机器：参考仓库 `docs/no_npu_compile_only_guide_zh.md`。

## 现实建议

完整从零编 LLVM21 成本高。团队场景优先：

- 使用 CI/发布的 wheel 或内部预编译  
- 或 Docker 脚本（仓库 `docker/`）  

学习阶段即使暂时编不过全量，也应把 **IR 与 Pass 概念** 学完，再在有环境的机器上补实验。
