# CPU 仿真快速上手

## 为什么从 CPU-SIM 开始

- 无需 NPU 与完整 CANN  
- 跨 macOS / Linux / Windows（以官方文档为准）  
- 快速验证指令语义与数值  

## 最小路径

```bash
git clone https://github.com/hw-native-sys/pto-isa.git
cd pto-isa

# 依赖：Python>=3.11, CMake, C++20 编译器, numpy

python3 tests/run_cpu.py --clean --verbose
python3 tests/run_cpu.py --demo gemm --verbose
python3 tests/run_cpu.py --demo flash_attn --verbose
```

单测示例：

```bash
python3 tests/script/run_st.py -r sim -v a3 -t tadd \
  -g TADDTest.case_float_64x64_64x64
```

一键脚本：

```bash
./build.sh --run_all --a3 --sim
```

## 学习顺序

1. `demos/auto_mode/.../add`  
2. `kernels/manual/.../gemm_performance`  
3. `kernels/manual/.../flash_atten`  
4. 通信样例（需要融合时）  

## 常见坑

- 编译器太旧：需要 C++20  
- 只改算法不改 valid/shape：边界 case 挂  
- 把 CPU-SIM 性能数字当成 NPU 性能：SIM 主要验证正确性  

下一步：有板后用 msprof；或上钻 [PTOAS](/ptoas/) / [PyPTO](/pypto/)。