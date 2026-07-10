# 编程风格与 API

依据 pypto-lib `docs/pypto-coding-style.md`（生态事实标准）。

## 模块别名

```python
import pypto.language as pl  # 唯一推荐别名
```

## 两种内核形态

### A. `@pl.jit` / `@pl.jit.inline`

```python
@pl.jit.inline
def body(...):
    ...
    return out

@pl.jit
def entry(..., out: pl.Out[pl.Tensor[..., pl.BF16]]):
    body(..., out)
    return out
```

- `@pl.jit`：编译与 golden 入口  
- `@pl.jit.inline`：内联子核，**必须有返回值**  

### B. `@pl.program` + `@pl.function`

```python
@pl.program
class Foo:
    @pl.function(type=pl.FunctionType.Opaque)
    def main(self, x: pl.Tensor[..., pl.BF16], y: pl.Out[pl.Tensor[..., pl.BF16]]):
        for b0 in pl.parallel(...):
            with pl.at(level=pl.Level.CORE_GROUP, name_hint="stage"):
                ...
        return y
```

| FunctionType | 含义 |
|--------------|------|
| Opaque | 自包含，由 `pl.at` 划 InCore 边界 |
| Orchestration | 顶层编排 |
| InCore | 直接写核内区域 |

## 输出方向：血泪点

| 注解 | 含义 |
|------|------|
| 普通 `pl.Tensor` | In，运行时可能不 copy-back |
| `pl.Out[...]` | 纯输出 |
| `pl.InOut[...]` | 读改写（KV cache 等） |

**错标 Out 会导致 host 读回全 0，golden 静默失败。** 方向写在 entry；inline 参数保持裸 `pl.Tensor`。

## `pl.at` 与循环构造

- `pl.at(level=CORE_GROUP, ...)`：核上计算区域  
- `pl.parallel`：可并行迭代  
- `pl.range`：顺序依赖  
- `pl.pipeline`：流水表达  
- `pl.spmd`：一次 fan-out 多 block  

调优时「该 parallel 却写成 range」是 L2 swimlane 上最常见的自残方式之一。

## 签名习惯

- 张量：`pl.Tensor[[D0, D1], pl.BF16]`  
- 标量：`pl.Scalar[...]`  
- 输出：`pl.Out[...]`  
