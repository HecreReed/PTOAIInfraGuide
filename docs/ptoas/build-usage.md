# 构建与 CLI 用法（工程手册）

## 1. 现实建议（先读）

完整从零编译 LLVM21 VPTO **非常重**。团队场景优先：

1. 官方/内部发布的 `ptoas` wheel 或二进制  
2. Docker（仓库 `docker/`）  
3. 最后才本地编 LLVM  

学习 IR/Pass **不必须**先编过全量。

## 2. 依赖清单

| 项 | 要求 |
|----|------|
| OS | Linux 为主 |
| CMake | ≥ 3.20 + Ninja |
| 编译器 | GCC≥9 / Clang，C++17+ |
| Python | 3.8+ |
| 包 | `pybind11<3`, `nanobind`, `numpy` |
| LLVM | `feature-vpto-llvm21` shared + MLIR Python |

```bash
python3 -m pip install 'pybind11<3' nanobind numpy
```

## 3. LLVM 构建纲要

```bash
export WORKSPACE_DIR=$HOME/llvm-workspace
export LLVM_SOURCE_DIR=$WORKSPACE_DIR/llvm-project
export LLVM_BUILD_DIR=$LLVM_SOURCE_DIR/build-shared

git clone https://github.com/vpto-dev/llvm-project.git
cd $LLVM_SOURCE_DIR && git checkout feature-vpto-llvm21

cmake -G Ninja -S llvm -B $LLVM_BUILD_DIR \
  -DLLVM_ENABLE_PROJECTS="mlir;clang" \
  -DBUILD_SHARED_LIBS=ON \
  -DMLIR_ENABLE_BINDINGS_PYTHON=ON \
  -DPython3_EXECUTABLE=$(which python3) \
  -Dpybind11_DIR=$(python3 -m pybind11 --cmakedir) \
  -Dnanobind_DIR=$(python3 -m nanobind --cmake_dir) \
  -DCMAKE_BUILD_TYPE=Release \
  -DLLVM_TARGETS_TO_BUILD="host"

ninja -C $LLVM_BUILD_DIR
```

## 4. PTOAS 构建纲要

```bash
export PTO_SOURCE_DIR=$WORKSPACE_DIR/PTOAS
export PTO_INSTALL_DIR=$PTO_SOURCE_DIR/install
# git clone https://github.com/hw-native-sys/PTOAS.git

cmake -G Ninja -S $PTO_SOURCE_DIR -B $PTO_SOURCE_DIR/build-llvm21 \
  -DLLVM_DIR=$LLVM_BUILD_DIR/lib/cmake/llvm \
  -DMLIR_DIR=$LLVM_BUILD_DIR/lib/cmake/mlir \
  -DPython3_EXECUTABLE=$(which python3) \
  -Dpybind11_DIR=$(python3 -m pybind11 --cmakedir) \
  -DMLIR_ENABLE_BINDINGS_PYTHON=ON \
  -DMLIR_PYTHON_PACKAGE_DIR=$LLVM_BUILD_DIR/tools/mlir/python_packages/mlir_core \
  -DCMAKE_INSTALL_PREFIX=$PTO_INSTALL_DIR

ninja -C $PTO_SOURCE_DIR/build-llvm21
ninja -C $PTO_SOURCE_DIR/build-llvm21 install
```

## 5. Python 安装合同（重要）

```bash
cd $PTO_SOURCE_DIR
pip install -e . --no-build-isolation
```

然后应可用：

```python
import ptodsl
from mlir.dialects import pto
```

仅解压 compiler-only tarball **不保证** PTODSL 可用。

## 6. 运行时环境变量（直接吃 build tree）

```bash
export MLIR_PYTHON_ROOT=$LLVM_BUILD_DIR/tools/mlir/python_packages/mlir_core
export PTO_PYTHON_ROOT=$PTO_INSTALL_DIR/
export PYTHONPATH=$PTO_PYTHON_ROOT:$MLIR_PYTHON_ROOT:$PYTHONPATH
export LD_LIBRARY_PATH=$LLVM_BUILD_DIR/lib:$PTO_INSTALL_DIR/lib:$LD_LIBRARY_PATH
export PATH=$PTO_SOURCE_DIR/build-llvm21/tools/ptoas:$PTO_SOURCE_DIR/build-llvm21/tools/ptobc:$PATH
```

## 7. CLI 菜谱

```bash
ptoas test/lit/pto/empty_func.pto
ptoas in.pto --enable-insert-sync -o out.cpp
ptoas in.pto --pto-arch=a5 -o out.cpp
ptoas in.pto --pto-level=level3 -o out.cpp
ptoas --version
```

## 8. Sample → 上板验证

```bash
# 生成 .pto（示例）
python3 test/samples/MatMul/tmatmulk.py > tmatmulk.pto
ptoas tmatmulk.pto -o tmatmulk.cpp

python3 test/npu_validation/scripts/generate_testcase.py \
  --input tmatmulk.cpp --run-mode npu --soc-version Ascend910B1
# 或 Ascend950
```

无卡：`docs/no_npu_compile_only_guide_zh.md`。

## 9. 故障排查

| 症状 | 处理 |
|------|------|
| pybind keep_alive 错误 | 降到 pybind11<3 |
| 找不到 mlir | LLVM_DIR/MLIR_DIR |
| import pto 失败 | PYTHONPATH 与是否 pip install |
| 真机链接失败 | CANN/soc-version |

## 10. 检验标准

- [ ] 能复述 wheel vs tarball 差异  
- [ ] 记住 5 条最常用 CLI  
- [ ] 知道上板 harness 生成脚本路径  
