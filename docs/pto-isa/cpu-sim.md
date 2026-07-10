# CPU 仿真快速上手（完整实战）

## 1. 为什么必须从 CPU-SIM 开始

| 路径 | 需要 | 验证什么 | 不验证什么 |
|------|------|----------|------------|
| CPU-SIM | Python/CMake/C++20 | 指令语义、shape/valid、多数数值 | 真机流水线性能、真实 sync 乱序 |
| NPU 仿真器 `a2a3sim/a5sim` | 更完整工具链 | 更接近设备的行为 | 仍可能有模型误差 |
| 真机 | CANN + 板卡 | 性能与最终正确性 | — |

**原则：正确性左移。** 在 SIM 上把算法与 tiling 弄对，再上板抠性能。

## 2. 环境准备

### 2.1 通用依赖

- Git
- Python ≥ 3.11
- CMake ≥ 3.16
- C++20 编译器（GCC 13+/Clang 15+/新 Xcode/MSVC 2022）
- `numpy >= 1.22`

### 2.2 系统示例

**macOS**

```bash
xcode-select --install
brew install cmake ninja python
```

**Ubuntu**

```bash
sudo apt-get update
sudo apt-get install -y build-essential cmake ninja-build python3 python3-pip python3-venv git
```

## 3. 获取代码与第一次运行

```bash
git clone https://github.com/hw-native-sys/pto-isa.git
cd pto-isa

# 建议 venv
python3 -m venv .venv
source .venv/bin/activate

python3 tests/run_cpu.py --clean --verbose
```

成功的标志：构建完成且测试/demo 退出码 0。

### 3.1 推荐 demo

```bash
python3 tests/run_cpu.py --demo gemm --verbose
python3 tests/run_cpu.py --demo flash_attn --verbose
```

### 3.2 单测定位

```bash
python3 tests/script/run_st.py -r sim -v a3 -t tadd \
  -g TADDTest.case_float_64x64_64x64
```

### 3.3 一键脚本

```bash
./build.sh --run_all --a3 --sim
```

## 4. 你在跑什么（心智模型）

```text
tests/run_cpu.py
   → CMake 配置 CPU 后端
   → 编译带 __CPU_SIM 的 kernel/测试
   → 在主机上执行，对比期望输出
```

注意：

- `AICORE` 等注解在 SIM 上接近普通函数属性  
- Event/TSYNC 常为 no-op，**依赖程序书写顺序**  
- 性能数字 **不能** 当 NPU 性能  

## 5. 第一个「自己改」的练习

1. 找到 VecAdd 或 TADD 相关测试  
2. 改 tile 尺寸（如 16→32）  
3. 同步修改 golden/输入生成（若有）  
4. 重跑 ST  
5. 记录：哪些静态断言触发、哪些数值阈值要放宽  

目标不是改出神 kernel，而是熟悉 **shape 契约**。

## 6. 阅读代码的导航顺序

| Day | 读什么 | 产出 |
|-----|--------|------|
| 1 | `tutorial_zh.md` + 本文 | 概念卡 |
| 2 | `demos/auto_mode/.../add` | 数据流注释 |
| 3 | `Event_zh.md` + manual VecAdd | 依赖图 |
| 4 | `gemm_performance` README | 优化旋钮表 |
| 5 | `flash_atten` README | 阶段划分 |

## 7. 从 SIM 到 NPU 的升级检查单

- [ ] SIM 全量相关 ST 绿  
- [ ] 固定 dtype/shape 集合  
- [ ] 明确 soc-version / `-p`  
- [ ] golden 阈值策略一致  
- [ ] 再打开 msprof / swimlane  

PTOAS 路径上板：

```bash
python3 test/npu_validation/scripts/generate_testcase.py \
  --input path/to/kernel.cpp \
  --run-mode npu \
  --soc-version Ascend910B1
```

## 8. 常见失败与排查

| 现象 | 排查 |
|------|------|
| 编译器不支持 C++20 | 升级 GCC/Clang |
| numpy 缺失 | pip install numpy |
| 链接错误 | 清 build：`--clean` |
| 单测名找不到 | 检查 `-t/-g` 与版本 |
| macOS 工具链怪 | 确认 Xcode CLT |

## 9. 检验标准

- [ ] 独立在一台无 NPU 机器跑通 `run_cpu.py`  
- [ ] 跑通 gemm 与 flash_attn 两个 demo  
- [ ] 能解释 SIM 与真机在 sync 语义上的差异  
- [ ] 完成一次「改 shape → 修测试 → 通过」小闭环  

## 10. 下一步

- 深入 [指令分类](./instructions)  
- 或跳转 [PTOAS](/ptoas/) / [PyPTO](/pypto/) 看上层如何生成这些 kernel  
