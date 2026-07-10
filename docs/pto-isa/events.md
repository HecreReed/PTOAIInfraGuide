# Event 与同步

## 为什么需要显式同步

CUBE、VEC、MTE 等是不同硬件流水线。没有依赖信息时，后序指令可能读到未就绪数据，或过早覆盖仍在使用的 buffer。

PTO 用 **Event（set/wait flag）** 表达「谁完成后谁才能开始」，尽量避免全局大屏障。

## 典型模式

```text
TLOAD  tile0
set_flag(MTE → CUBE)
wait_flag(...)
TMATMUL using tile0
set_flag(CUBE → VEC)
wait_flag(...)
vector epilogue
```

## 双缓冲

```text
buffer A: compute    | load next
buffer B: load next  | compute
```

要点：

- 需要两套 tile 存储  
- 只 wait **真实** producer-consumer 边  
- 区分 warm-up / steady-state / drain，避免稳态被首尾串行化  

## A5 BufID

除 Event 外，A5 支持基于 buffer id 的顺序同步。编译器（PTOAS）可插入对应 pass。手写时要遵守嵌套与配对约束。

## 调试直觉

| 现象 | 可能原因 |
|------|----------|
| 偶发错误结果 | wait 不足 / 错误 event id |
| 正确但极慢 | wait 过粗、缺乏重叠 |
| 资源耗尽 | event 过多、未复用 id |

详见官方 `docs/coding/Event_zh.md`。
