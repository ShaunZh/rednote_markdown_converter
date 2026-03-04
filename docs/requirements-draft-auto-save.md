# 需求文档：编辑内容本地保存与恢复

## 1. 需求概述

| 项目 | 说明 |
|------|------|
| 功能名称 | 编辑内容本地保存与恢复（Auto-save / Draft） |
| 目标用户 | 使用 RedNote Converter 编辑 Markdown 并导出图片的用户 |
| 核心目标 | 用户在同一浏览器内刷新页面或再次打开应用时，能恢复上次编辑的内容与设置，避免误关页或刷新导致内容丢失。 |
| 实现方式 | 纯前端，使用 `localStorage`，不依赖后端。 |

---

## 2. 功能范围

### 2.1 需要持久化的数据

| 数据项 | 类型 | 说明 | 存储键建议 |
|--------|------|------|------------|
| 正文内容 | `string` | 编辑器中的 Markdown 全文 | `rednote-draft-markdown` |
| 封面设置 | `CoverSettings` | `enabled`, `title`, `subtitle`, `author`, `variant` | `rednote-draft-cover` |
| 当前主题 | 主题标识 | 使用 `ThemeConfig.id`，便于从 `THEMES` 中还原 | `rednote-draft-theme` |

### 2.2 不持久化的数据（可选说明）

- **当前 Tab**（Editor / Cover）：每次进入页面默认恢复为 Editor，不强制记忆。
- **导出进度、弹窗状态**：会话级，不保存。

### 2.3 数据格式约定

- **Markdown**：原样字符串，直接 `localStorage.setItem(key, markdown)`；读取时需考虑历史可能存过空字符串或非法值，做默认回退。
- **封面设置**：`JSON.stringify(coverSettings)`；读取时 `JSON.parse`，并校验字段与类型，不合法则用默认 `CoverSettings`。
- **主题**：存 `currentTheme.id`（string）；读取时在 `THEMES` 中查找 `THEMES.find(t => t.id === id)`，找不到则用 `THEMES[0]`。

---

## 3. 行为规格

### 3.1 保存时机（写入 localStorage）

- **自动保存**（满足其一即写）：
  - 防抖：Markdown 内容变更后，**防抖 800ms** 再写入，避免每次按键都写。
  - 封面设置或主题变更：**立即写入**（或与 markdown 共用一次防抖亦可，由实现决定）。
- **不主动清除**：不提供「清空草稿」前不删除 key；若未来有「新建文档」可在此扩展为清除或覆盖。

### 3.2 恢复时机（从 localStorage 读取）

- **仅页面首次加载时**：在应用挂载后、渲染编辑器前，读取一次 localStorage。
- **恢复逻辑**：
  - 若存在 `rednote-draft-markdown` 且为非空字符串，则用其初始化 `markdown` state，否则使用当前默认占位内容。
  - 若存在且合法 `rednote-draft-cover`，则用其初始化 `coverSettings`，否则用默认 `CoverSettings`。
  - 若存在且能在 `THEMES` 中找到的 `rednote-draft-theme`，则用该 theme 初始化 `currentTheme`，否则用 `THEMES[0]`。
- **不重复恢复**：同一会话内不因路由或 re-render 再次用 localStorage 覆盖当前 state（避免覆盖用户正在编辑的内容）。

### 3.3 边界与异常

- **localStorage 不可用**：如隐私模式、配额满、被禁用时，`setItem` 可能抛错，需 try/catch，失败时仅不再写入，不弹强打扰提示（可选：在控制台 warning）。
- **数据损坏**：`JSON.parse` 失败或结构不合法时，丢弃该 key 的恢复，使用默认值。
- **主题被移除**：若未来 THEMES 列表变更，旧 id 找不到时，回退到 `THEMES[0]`。
- **存储容量**：Markdown 过大时可能触发 QuotaExceeded，捕获后不再尝试写入该会话，避免反复报错。

---

## 4. 非功能要求

- **性能**：防抖后写入，不阻塞输入；读取仅在首屏一次，数据量小，对首屏影响可忽略。
- **兼容性**：依赖标准 `localStorage`，支持所有现代浏览器及当前项目目标环境。
- **隐私**：数据仅存于用户本机，不上传、不跨设备同步。

---

## 5. 验收标准（简要）

- [ ] 编辑 Markdown 后，等待防抖时间，刷新页面，内容与封面、主题均恢复为保存时的状态。
- [ ] 仅修改封面或主题后，刷新页面，对应项恢复，Markdown 保持上次保存内容。
- [ ] 首次访问（无历史数据）或 localStorage 被清空后，表现与当前一致：使用默认 Markdown 与默认封面、默认主题。
- [ ] localStorage 不可用或单 key 数据损坏时，不报未捕获异常，应用仍可正常使用默认内容编辑。

---

## 6. 后续可选扩展（非本次范围）

- 提供「清除草稿」按钮，显式删除上述三个 key。
- 若引入多文档或路由（如 `/doc/:id`），可扩展为按文档 id 存多份 draft（如 `rednote-draft-{id}-markdown` 等）。

---

*文档版本：1.0 | 纯前端方案，无需后端。*
