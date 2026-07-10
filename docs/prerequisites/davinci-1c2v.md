# 达芬奇架构与 1C2V（深度）

## 1. 工厂类比

- **CUBE**：冲压大件（矩阵乘）  
- **VEC**：精加工（逐元素/归约）  
- **MTE**：物流（搬输入输出）  
- **SCALAR**：调度员  

好的班组长（kernel 作者）让物流与冲压同时进行，而不是全厂停工等一辆叉车。

## 2. 1C2V 结构

```text
Physical Core
├─ AIC: SCALAR, MTE2, MTE1, CUBE, VEC, FIXP
├─ AIV0: MTE2, VEC, FIXP, MTE3
└─ AIV1: 同上
```

含义：

- 矩阵主力在 AIC  
- 向量可分散  
- 多 MTE 实例 ⇒ 并行供给可能  

## 3. 与编程模型的映射

| 硬件 | PTO/PyPTO 现象 |
|------|----------------|
| CUBE vs VEC | outline 拆 cube/vector kernel |
| 多核 | block_idx / spmd |
| 有限 event 资源 | A5 BufID、复用 token |
| 有限片上容量 | tile 预算、双缓冲权衡 |

## 4. 流水线重叠示意

```text
时间 →
MTE2:  [L0][L1][L2][L3]
CUBE:    [C0][C1][C2]
VEC:        [V0][V1]
```

气泡来源：错误 wait、tile 太小、依赖链过长。

## 5. 检验标准

- [ ] 默画 1C2V  
- [ ] 给三条指令各标主 pipeline  
- [ ] 解释「拆核」硬件动机  
