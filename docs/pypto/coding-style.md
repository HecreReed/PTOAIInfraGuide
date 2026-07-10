# 编程风格与 API（深度，对齐 pypto-lib）

> 事实标准：`pypto-lib/docs/pypto-coding-style.md`（约 700+ 行）。本文提炼工程必知，并补足 AI Infra 解读。

## 1. 铁律

```python
import pypto.language as pl  # 唯一推荐别名
```

## 2. 两种内核形态：不要混用

### 2.1 Form A — `@pl.jit` / `@pl.jit.inline`

```python
@pl.jit.inline
def expert_body(...):
    for i in pl.parallel(...):
        ...
    return out  # inline 必须有返回值

@pl.jit
def expert_entry(
    x: pl.Tensor[[N, D], pl.BF16],
    y: pl.Out[pl.Tensor[[N, D], pl.BF16]],
):
    expert_body(x, y)
    return y
```

| 装饰器 | 含义 |
|--------|------|
| `@pl.jit` | 编译入口，golden 调用边界 |
| `@pl.jit.inline` | 内联子核，不单独成入口 |

### 2.2 Form B — `@pl.program` + `@pl.function`

```python
@pl.program
class Qwen3Decode:
    @pl.function(type=pl.FunctionType.Opaque)
    def qwen3_decode(self, hidden: pl.Tensor[..., pl.BF16], ...):
        for b0 in pl.parallel(0, batch_padded, BATCH_TILE):
            with pl.at(level=pl.Level.CORE_GROUP, name_hint="rmsnorm"):
                ...
        return out
```

| FunctionType | 角色 |
|--------------|------|
| Opaque | 自包含；由 `pl.at` 暗示 InCore 边界 |
| Orchestration | 顶层编排、跨 rank 等 |
| InCore | 直接写核内，无外层 at |

**不要**让 program 方法去调另一个 `@pl.jit` 入口（或反过来）——降低可维护性与编译假设。

## 3. 输出方向：最高频陷阱

| 注解 | 含义 | 运行时 |
|------|------|--------|
| 裸 `pl.Tensor` | In | 可能不 device→host copy-back |
| `pl.Out[...]` | 纯输出 | 需要回读对比 |
| `pl.InOut[...]` | 读改写 | KV cache、累加状态 |

**错标 Out → host 全 0 → golden 失败且难查。**

规则：

- **只在 entry** 写 Out/InOut  
- inline 参数保持裸 Tensor（方向由调用点继承；乱写会 DeprecationWarning）

```python
@pl.jit
def attn_test(
    x: pl.Tensor[[T, D], pl.BF16],
    kv: pl.InOut[pl.Tensor[[BN, ...], pl.BF16]],
    y: pl.Out[pl.Tensor[[T, D], pl.BF16]],
):
    attn_inline(x, kv, y)
    return y
```

## 4. `pl.at` 作用域

```python
# 编排侧（host/AICPU 控制流）
for b0 in pl.parallel(...):
    with pl.at(level=pl.Level.CORE_GROUP, name_hint="q_proj"):
        # InCore：vector/cube/mte op
        ...
```

- at 内：核上计算  
- at 外：编排  
- `name_hint`：swimlane/调试可读性  

## 5. 循环构造

| 构造 | 语义 | 何时用 |
|------|------|--------|
| `pl.parallel` | 迭代无依赖，可多核 | 默认优先 |
| `pl.range` | 严格顺序 | 累加器、状态机 |
| `pl.pipeline` | 流水表达 | 软件流水 |
| `pl.spmd` | 一次 fan-out 多 block | 减 AICPU 逐发 |

**把独立维写成 range 是 L2 性能自杀。**

## 6. 类型写法

- 张量：`pl.Tensor[[D0, D1], pl.BF16]`  
- 标量：`pl.Scalar[pl.INT32]`  
- 输出包装：`pl.Out[...]` / `pl.InOut[...]`  

## 7. 与编译结果

前端 **不显式** 画 InCore/Orchestration 边界时，靠 `pl.at` 暗示；后面 pass 会 outline 成：

- 1 Orchestration  
- N InCore（可能再拆 cube/vector）  

所以 coding style 不只是审美，**直接决定生成 kernel 拓扑**。

## 8. 代码评审检查单

- [ ] 只用 `pl` 别名  
- [ ] 未混用 jit 与 program  
- [ ] entry 输出方向正确  
- [ ] 独立维用 parallel  
- [ ] at 粒度不过碎也不过胖（过胖难优化，过碎调度炸）  
- [ ] name_hint 有业务含义  
- [ ] golden 覆盖所有 Out  

## 9. 检验标准

- [ ] 默写 Out 三态表  
- [ ] 把一段错误的 range 改成 parallel 并说明收益  
- [ ] 阅读 Qwen3 decode 中一处 at，推断会生成几个 InCore  
