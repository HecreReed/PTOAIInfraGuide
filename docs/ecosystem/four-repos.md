# 四仓库协作关系（深度）

## 1. 总图

```text
pypto-lib ──调用──▶ pypto + simpler
                       │ codegen .pto
                       ▼
                     PTOAS
                       │ C++ APIs
                       ▼
                     pto-isa
                       ▼
                    Ascend NPU
```

## 2. 职责与非职责

| 仓库 | 管 | 不管 |
|------|----|------|
| pto-isa | 指令语义与实现 | 整网调度 |
| PTOAS | 编译优化 | 业务模型 |
| pypto | 框架 lowering + API | 手写每条 event 的日常体验（虽可下潜） |
| pypto-lib | 资产与 golden | 替代编译器 |

## 3. 版本纪律

- 以 CI pin 为「已知好组合」  
- 升级步骤：hello sim → intermediate → 目标模型  
- 接口变更读 ReleaseNotes  

## 4. 卫星

TileLang Ascend、PTODSL、pypto-toolkit、GitCode cann 镜像等。

## 5. 检验标准

- [ ] 默画总图  
- [ ] 给出升级回归三步  
