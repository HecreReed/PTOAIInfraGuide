# Event 与同步（深度）

> 上游：`docs/coding/Event_zh.md`。CPU-SIM 上 Event/TSYNC 常为 no-op，**正确性靠单线程顺序**；真机上乱序是真实的。

## 1. 问题本质

CUBE、VEC、MTE2… 是不同流水线。若：

- 计算读到尚未 load 完成的 tile → 错结果  
- store 覆盖仍在被读的 buffer → 错结果  
- 处处全局屏障 → 正确但极慢  

PTO 选择 **细粒度 Event**：表达「producer pipeline 完成后，consumer pipeline 才能开始」。

## 2. 核心类型

### 2.1 `Op` 与流水线映射

每个操作归类到某种 `Op`，再映射到硬件 pipeline（`PIPE_V`、`PIPE_MTE2`…）。

### 2.2 `RecordEvent`

多数内建指令返回 `RecordEvent`：表示「这条 op 完成后可记录的 token」。

### 2.3 `Event<SrcOp, DstOp>`（设备）

```cpp
template <Op SrcOp, Op DstOp>
struct Event {
  void Wait();
  void Record();
  Event& operator=(RecordEvent);
};
```

- 模板参数编码 **producer→consumer** 方向  
- `evt = SOME_OP(...)` 赋值即 Record  
- 下一条 op 把 `evt` 放进 `WaitEvents...` 参数包即 Wait  

### 2.4 内建接口的 Wait 包

模式：

1. 入口 `TSYNC(events...)` → 逐个 `Wait()`  
2. 执行指令  
3. 返回 `RecordEvent`  

于是 C++ 可以写成 **SSA 风格依赖链**。

### 2.5 `TSYNC<OpCode>()`

单流水线屏障。设备上实现有范围限制（例如偏向量流水线）；SIM 上 no-op。

## 3. 最小可运行示例

```cpp
void pipeline(__gm__ float* in0, __gm__ float* in1, __gm__ float* out) {
  using TileT = Tile<TileType::Vec, float, 16, 16>;
  // ... GlobalTensor 省略
  TileT a, b, c;

  Event<Op::TLOAD, Op::TADD> e0, e1;
  Event<Op::TADD, Op::TSTORE_VEC> e2;

  e0 = TLOAD(a, gin0);
  e1 = TLOAD(b, gin1);
  e2 = TADD(c, a, b, e0, e1);
  TSTORE(gout, c, e2);
}
```

读法：

- 两个 load 都完成后才能 add  
- add 完成后才能 store  

## 4. 双缓冲：性能同步学的第一课

```text
iter i:   compute on bufA   |  load into bufB
iter i+1: compute on bufB   |  load into bufA
```

要点：

1. **两套物理 tile 区域**（或 multi-buffer slots）  
2. 只 wait **真实** producer-consumer 边  
3. 分离 **warmup / steady / drain**，别让首尾把稳态串行化  

错误示范：

- 每个微步骤后全局 wait  
- 两套 buffer 实际别名到同一地址  
- drain 阶段漏 wait 导致提前返回  

## 5. 遗留 flag 风格

旧代码可能直接 `set_flag` / `wait_flag`。语义等价思路相同，但更贴硬件、可读性差。新代码优先 Event 抽象。

## 6. A5 BufID 同步

A5 增加基于 buffer id 的程序序同步（`get_buf`/`rls_buf` 一类模型），减少 event 资源压力。

约束更强：例如同一物理 buf id 的 get/rls **不能随意嵌套**。

PTOAS：

```bash
ptoas in.pto --pto-arch=a5 --enable-bufid_sync -o out.cpp
# A3 仍常用
ptoas in.pto --pto-arch=a3 --enable-insert-sync -o out.cpp
```

## 7. 编译器自动插入 vs 手写

| 模式 | 谁插 sync | 风险 |
|------|-----------|------|
| Auto / InsertSync | 编译器 | 过粗 → 气泡；过稀 → 偶发错误（若模型不全） |
| Manual | 你 | 漏边、错 Op 对、event id 耗尽 |
| Level-3 | 你全责 | 调试成本高，上限也高 |

**建议流程：** Auto 先正确 → profiler 定位 → 热点改 Manual 精修依赖。

## 8. 调试表

| 现象 | 可能原因 |
|------|----------|
| 偶发错误 | wait 不足、错误 Src/Dst Op |
| 必现错误 | 地址别名、valid、算法 |
| 正确极慢 | wait 过粗、无双缓冲 |
| event 资源问题 | 过多独特依赖、未复用 |

## 9. 与 CUDA 同步对照

| CUDA | PTO |
|------|-----|
| `__syncthreads` | 粗粒度；PTO 更偏跨 pipeline event |
| `cuda::pipeline` / async copy | 双缓冲 + MTE/CUBE event 链 |
| warp sync | 无直接对应；别硬套 |

## 10. 检验标准

- [ ] 默写 Event 的 Wait/Record 含义  
- [ ] 给 VecAdd 画依赖图  
- [ ] 说明双缓冲为何至少两套 buffer  
- [ ] 解释为何 CPU-SIM 过了仍可能真机挂（sync 相关）  
- [ ] 说出 A5 BufID 相对 Event 的动机  

## 11. 下一步

结合 [GEMM 优化](/kernels/gemm) 看真实 kernel 的 flag/event 流；再读上游 Event 文档细节。
