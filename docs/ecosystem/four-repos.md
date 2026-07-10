# 四仓库协作关系

## 总图

```text
                 ┌─────────────┐
                 │  pypto-lib  │  算子 / 模型 / golden
                 └──────┬──────┘
                        │ import / 调用
                 ┌──────▼──────┐
                 │    pypto    │  Tensor→Tile→Codegen
                 │  + simpler  │  MPMD runtime
                 └──────┬──────┘
                        │ 生成 .pto
                 ┌──────▼──────┐
                 │    PTOAS    │  MLIR Pass / 同步 / codegen
                 └──────┬──────┘
                        │ 调用 C++ API
                 ┌──────▼──────┐
                 │   pto-isa   │  90+ Tile 指令实现
                 └──────┬──────┘
                        ▼
                   Ascend NPU
```

## 职责边界

| 仓库 | 一句话 | 你不该指望它 |
|------|--------|----------------|
| [pto-isa](https://github.com/hw-native-sys/pto-isa) | 指令与硬件语义锚点 | 管理整网调度 |
| [PTOAS](https://github.com/hw-native-sys/PTOAS) | 编译 `.pto` | 提供业务模型 |
| [pypto](https://github.com/hw-native-sys/pypto) | 框架与 lowering | 手写每条 event 的日常体验 |
| [pypto-lib](https://github.com/hw-native-sys/pypto-lib) | 生产级 kernel 资产 | 替代编译器 |

## 版本纪律

- CI 钉扎版本是「已知可组合」状态  
- 升级任一仓库后跑：hello_world sim → 一个 intermediate → 目标模型 decode  
- 接口变更优先读 ReleaseNotes / 各仓 docs  

## 相关卫星

- TileLang Ascend  
- PTODSL / tilelang-dsl（多在 PTOAS 仓）  
- pypto-toolkit IDE 插件  
- 官方 GitCode cann 组织镜像（部分文档仍指向 gitcode.com/cann/*）  
