# GEMM 优化路径（深度实战）

> 主参考：`pto-isa/kernels/manual/a2a3/gemm_performance/README_zh.md` + kernel 源码。

## 1. 问题定义

\[
C = A \times B,\quad A\in\mathbb{R}^{m\times k},\; B\in\mathbb{R}^{k\times n},\; C\in\mathbb{R}^{m\times n}
\]

样例默认参考配置常取 `m=k=n=6144`，fp16 入、fp32 出（以 README 为准）。

## 2. 流水线四阶段

1. **TLOAD**：GM→L1（`aMatTile`/`bMatTile`）  
2. **TEXTRACT**：L1→L0A/L0B  
3. **TMATMUL[_ACC]**：L0→L0C  
4. **TSTORE**：L0C→GM  

## 3. 四大优化旋钮

### 3.1 多核切分

- 方阵问题倾向 **M、N 二维切**，而不是只切 K  
- 例：24 核 `4×6` → `singleCoreM=1536`, `singleCoreN=1024`, `singleCoreK=6144`  
- 检查：`m % singleCoreM == 0` 等整除假设  

### 3.2 base block

- 例：fp16 常用 `[baseM, baseN, baseK]=[128,256,64]`  
- 相对 `[128,128,128]` 可能更高算术强度，并利于写回对齐  
- **硬约束**：单 buffer footprint ≤ 预算（如 32KiB）  

字节估算（fp16）：

\[
\text{L0A} \approx baseM\cdot baseK\cdot 2,\quad \text{L0B}\approx baseK\cdot baseN\cdot 2
\]

### 3.3 L1 stepK 缓存

- `stepKa=stepKb=4`：一次 DMA 多搬几个 K micro-panel  
- 增大 stepK：降启动开销，直到 L1 满或重叠变差  

### 3.4 双缓冲

- L1/L0 ping-pang  
- 标志位 + event：load 下一块时算当前块  
- 保留 warmup/drain 逻辑，重构时别删「补齐首末同步」  

## 4. 如何读性能表（方法论）

当规模增大：

- 时间近似超线性（接近 \(n^3\)）  
- TMATMUL 占比可能先升后降  
- TLOAD 逼近 100% ⇒ **供给墙**  
- TSTORE 通常很小  
- TEXTRACT 不可忽视（可到 40%–70% 量级占比，视测量定义）  

**结论：** 大尺寸下别只抠 matmul 指令，优先减搬运与提重叠。

## 5. 调优决策树

```text
TLOAD≈100% 且 TMATMUL 下滑？
  是 → 增复用/stepK/重叠，检查是否真带宽墙
  否 →
    TEXTRACT 很高？
      是 → 改 base、减 extract、重叠 extract
      否 → 查多核不均 / 同步过粗 / epilogue
```

## 6. 换 shape 时的检查单

- [ ] 重算 singleCoreM/N  
- [ ] 重算 mLoop/nLoop/kLoop  
- [ ] 重算 base 是否仍 ≤ L0 预算  
- [ ] 双缓冲地址是否仍不重叠  
- [ ] 精度回归  

## 7. 与 PyPTO 路径对照

- Manual C++：极致可控  
- PyPTO：用 tiling 参数与 at 粒度逼近，但 outline 可能拆核  
- 学习顺序：先读懂 manual，再看框架如何近似  

## 8. 检验标准

- [ ] 默写四阶段  
- [ ] 手算一组 base 的 KiB  
- [ ] 解释 stepK 的收益与代价  
- [ ] 独立解读官方占比表一行数据  
