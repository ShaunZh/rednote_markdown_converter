# 编辑页右侧参数栏实施任务清单

## 1. 目标

基于 [`editor-settings-sidebar-redesign.md`](./editor-settings-sidebar-redesign.md) 的设计方案，将编辑页逐步重构为：

- 左栏：纯编辑
- 中栏：纯预览
- 右栏：统一参数设置

本清单用于指导后续代码实施，强调：

- 先做结构收敛
- 再做状态整理
- 最后补新功能

---

## 2. 总体实施顺序

建议分 4 个阶段推进：

1. Phase 1：页面结构收敛
2. Phase 2：右栏组件落地
3. Phase 3：状态模型整理
4. Phase 4：高级参数扩展

其中 Phase 1 和 Phase 2 可以先完成一个“可用版本”，不必等待高级参数一起上线。

---

## 3. Phase 1：页面结构收敛

### Task 1. 去掉左栏 `cover` tab

- 优先级：P0
- 目标：
  - 左栏只保留正文编辑
  - 删除“编辑 / 封面”双 tab 交互
- 涉及文件：
  - `components/draft/DraftEditorPane.tsx`
  - `app/draft/page.tsx`
- 实施要点：
  - 移除 `activeTab`
  - 移除 `setActiveTab`
  - 左栏只保留：
    - `EditorHeader`
    - `EditorToolbar`
    - `textarea`
- 验收标准：
  - 左栏不再出现封面设置表单
  - 左栏区域职责单一

### Task 2. 为右栏预留统一设置入口

- 优先级：P0
- 目标：
  - 用新组件取代当前 `ThemeSidebar`
- 涉及文件：
  - `components/ThemeSidebar.tsx`
  - `app/draft/page.tsx`
- 实施要点：
  - 不要直接继续扩展 `ThemeSidebar`
  - 新建 `components/draft/DraftSettingsSidebar.tsx`
  - 在页面层用新组件替换旧侧栏
- 验收标准：
  - 页面右侧只保留一个统一设置栏
  - 不再存在“单独主题栏”

---

## 4. Phase 2：右栏组件落地

### Task 3. 落地右栏顶部操作区

- 优先级：P0
- 目标：
  - 右栏顶部显示“参数设置”
  - 导出按钮迁移到右栏顶部
- 涉及文件：
  - `components/draft/DraftTopBar.tsx`
  - `components/draft/DraftSettingsSidebar.tsx`
  - `app/draft/page.tsx`
- 实施要点：
  - 当前顶部导航保留品牌与基础导航
  - 导出主入口迁移到右栏头部
  - 顶栏不再承担主要设置动作
- 验收标准：
  - 右栏顶部可以直接导出
  - 页面顶栏更轻

### Task 4. 落地主题选择 section

- 优先级：P0
- 目标：
  - 将主题选择并入右栏
  - 改成更紧凑的两列按钮式布局
- 涉及文件：
  - `components/draft/DraftSettingsSidebar.tsx`
  - 可选新增：
    - `components/draft/settings/ThemeSection.tsx`
- 实施要点：
  - 每个主题显示：
    - 主题名称
    - 小色点
    - 选中态
  - 不再沿用当前纵向缩略卡片列表
- 验收标准：
  - 用户能快速切换主题
  - 右栏主题 section 高度显著小于旧侧栏

### Task 5. 迁移现有封面设置到右栏

- 优先级：P0
- 目标：
  - 将当前左栏 `cover` tab 中的现有配置迁移到右栏
- 涉及文件：
  - `components/draft/DraftEditorPane.tsx`
  - `components/draft/DraftSettingsSidebar.tsx`
  - 可选新增：
    - `components/draft/settings/CoverSection.tsx`
- 迁移字段：
  - `enabled`
  - `showPageNumber`
  - `title`
  - `subtitle`
  - `author`
  - `variant`
- 实施要点：
  - 保持现有数据结构兼容
  - 这一阶段不新增 `date` 和 `coverImage`
- 验收标准：
  - 左栏不再包含封面配置
  - 右栏可完整控制当前已有封面能力

### Task 6. 统一右栏 section 样式

- 优先级：P1
- 目标：
  - 让右栏视觉结构清晰、可继续扩展
- 涉及文件：
  - `components/draft/DraftSettingsSidebar.tsx`
  - 可选新增：
    - `components/draft/settings/SectionCard.tsx`
- 实施要点：
  - section 标题统一
  - 间距统一
  - 分割线统一
  - 表单高度统一
- 验收标准：
  - 右栏 section 间层级清楚
  - 后续新增参数不会破坏整体布局

---

## 5. Phase 3：状态模型整理

### Task 7. 保留 `coverSettings`，但为 `appearanceSettings` 预留位置

- 优先级：P1
- 目标：
  - 不在本轮大改存储结构
  - 但为后续参数扩展准备新的状态容器
- 涉及文件：
  - `app/draft/page.tsx`
  - `hooks/useDraftDocument.ts`
  - `components/CoverCard.tsx`
- 实施要点：
  - 当前阶段可先保留：
    - `coverSettings`
    - `currentTheme`
  - 新增空的或最小的 `appearanceSettings` 状态入口
  - 先不要让 `ThemeConfig` 承担文档级视觉覆盖项
- 验收标准：
  - 新的视觉参数有明确归属
  - 不需要再往 `coverSettings` 里继续堆字段

### Task 8. 定义后续扩展字段的边界

- 优先级：P1
- 目标：
  - 在实现前先统一字段归属
- 建议拆分：
  - `coverSettings`
    - `enabled`
    - `title`
    - `subtitle`
    - `author`
    - `variant`
    - 后续的 `date`
    - 后续的 `coverImage`
  - `appearanceSettings`
    - `canvasPreset`
    - `showPageNumber`
    - `coverTitleSize`
    - `bodyFontSize`
    - `headingScale`
- 涉及文件：
  - `components/CoverCard.tsx`
  - `hooks/useDraftDocument.ts`
  - `lib/draftStorage.ts`
- 验收标准：
  - 后续新增参数时不需要再次推翻结构

---

## 6. Phase 4：高级参数扩展

### Task 9. 新增封面图字段

- 优先级：P2
- 状态：已完成
- 目标：
  - 在右栏封面信息 section 中增加封面图入口
- 涉及文件：
  - `components/CoverCard.tsx`
  - `components/draft/DraftSettingsSidebar.tsx`
  - `hooks/useDraftDocument.ts`
  - `lib/draftStorage.ts`
- 注意：
  - 当前已落地为“本地上传 -> 浏览器端压缩 -> base64 持久化”
  - 保留手动删除入口
  - 需继续关注 `localStorage` 体积上限

### Task 10. 新增日期字段

- 优先级：P2
- 状态：已完成
- 目标：
  - 支持示意图中的“日期”
- 涉及文件：
  - `components/CoverCard.tsx`
  - `hooks/useDraftDocument.ts`
  - `lib/draftStorage.ts`

### Task 11. 新增画布尺寸 preset

- 优先级：P2
- 目标：
  - 让用户切换画布比例，如：
    - 小红书 3:4
    - 方图 1:1
    - 长图变体
- 涉及文件：
  - `app/draft/page.tsx`
  - `hooks/useSmartPagination.ts`
  - `components/draft/DraftPreviewPane.tsx`
  - `hooks/useExportSlides.ts`
- 注意：
  - 这会影响分页、导出尺寸、封面尺寸
  - 不属于主题，应属于文档级外观参数

### Task 12. 新增字号与排版滑块

- 优先级：P2
- 目标：
  - 支持示意图中的字号微调
- 涉及文件：
  - `components/MarkdownRenderer.tsx`
  - `components/CoverCard.tsx`
  - `app/draft/page.tsx`
  - `lib/themeConfig.ts`
- 注意：
  - 这里更适合做“基于主题的 override”
  - 不建议直接改写 `ThemeConfig` 预设本体

---

## 7. 推荐的组件拆分方案

建议新增：

- `components/draft/DraftSettingsSidebar.tsx`
- `components/draft/settings/SidebarHeader.tsx`
- `components/draft/settings/ThemeSection.tsx`
- `components/draft/settings/CoverSection.tsx`
- `components/draft/settings/AppearanceSection.tsx`

可选复用/抽象：

- `components/draft/settings/SectionCard.tsx`
- `components/draft/settings/LabeledField.tsx`

建议保留：

- `DraftEditorPane`
- `DraftPreviewPane`

建议逐步淘汰：

- `ThemeSidebar`

---

## 8. 建议的提交拆分

为了降低回归风险，建议后续按下面顺序提交：

### Commit 1

- 左栏去掉 `cover` tab
- 页面层引入新的右栏组件骨架

### Commit 2

- 右栏接入主题 section
- 右栏接入现有封面字段 section

### Commit 3

- 导出入口迁移到右栏顶部
- 清理旧顶部冗余逻辑

### Commit 4

- 引入 `appearanceSettings`
- 接入页码开关和预留的外观参数结构

### Commit 5+

- 再按功能逐个追加：
  - 封面图
  - 日期
  - 画布尺寸
  - 字号滑块

---

## 9. 验收清单

Phase 1 完成后，至少应满足：

- [ ] 左栏只有编辑功能
- [ ] 中栏只有预览功能
- [ ] 右栏成为唯一设置中心
- [ ] 当前已有主题和封面配置都能正常使用
- [ ] 导出功能入口明确
- [ ] 页面结构已经能支撑后续新增参数

全部阶段完成后，应满足：

- [ ] 右栏配置结构清晰
- [ ] 主题、封面、外观参数职责清楚
- [ ] 后续继续加参数时不需要重做页面结构

---

## 10. 推荐下一步

如果准备正式开始实现，建议直接从下面 3 个任务开始：

1. 去掉左栏 `cover` tab
2. 新建 `DraftSettingsSidebar`
3. 把当前主题选择和现有封面字段迁移到右栏

这是最小、最稳、收益最高的一轮改造。
