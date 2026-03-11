# 历史说明：旧版草稿恢复方案

## 状态

本文档已失效，仅作为历史记录保留，不再代表当前项目实现。

## 原因

该文档描述的是“独立 draft / auto-save 恢复”模型，也就是：

- 用户重新进入 `/draft` 时，自动恢复上一次编辑现场
- 使用单独的 `rednote-draft-*` localStorage key 保存当前草稿

当前项目已经明确切换为另一套产品语义：

- `/draft` 是“新建文档”
- `/draft?id=...` 是“打开历史文档”
- 唯一保留的持久化模型是 `recent edits`

因此：

- 不再使用独立的 `draft` 存储键
- 不再支持“打开 `/draft` 自动恢复上次草稿”的行为

## 当前应参考的文档

请改为参考：

- [`docs/project-optimization-roadmap.md`](./project-optimization-roadmap.md)
- [`README.md`](../README.md)

## 备注

如果未来产品再次引入“继续上次编辑”入口，可以重新设计草稿模型，但不应直接恢复此历史方案。
