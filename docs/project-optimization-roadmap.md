# 项目优化路线图

## 1. 背景

本文档用于统一当前项目的后续优化方向，避免需求讨论、代码实现和历史文档之间出现语义冲突。

当前产品模型已经明确为：

- `recent edits` 是唯一的文档持久化模型。
- `/draft` 表示新建文档入口。
- 通过 `/draft?id=...` 打开历史文档。
- 不再维护独立的“当前草稿恢复”语义。

---

## 2. 当前状态

### 已完成

- [x] 收敛存储模型，只保留 `recent edits`
- [x] `/draft` 在无 `id` 参数时重置为空白新文档
- [x] 编辑器内加号按钮接为“新建笔记”

### 已知现状

- `hooks/useSmartPagination.ts` 仍依赖经验值和 DOM 测量时序。

---

## 3. 下一优先级

下一步建议优先推进：**增强分页稳定性**

原因：

- 分页仍然高度依赖经验值和测量时序。
- 这是当前最可能继续引发边界 bug 的模块。
- 页面与状态层已经完成基础拆分，适合转向算法稳定性。

### 目标

降低复杂 Markdown、图片和分页边界条件下的布局抖动与不可预测行为。

### 涉及文件

- `hooks/useSmartPagination.ts`
- `hooks/pagination/*`
- `components/MarkdownRenderer.tsx`

### 预期修改

1. 收敛 magic number。
2. 降低对 `setTimeout` 和 DOM 时序偶然性的依赖。
3. 补齐更多复杂内容的稳定分页策略。
4. 为后续性能优化打基础。

### 验收标准

- [ ] 图片、长段落、代码块分页更稳定。
- [ ] 分页逻辑更容易单独验证。
- [ ] 调整分页策略时不需要改 React 页面层。

---

## 4. 分阶段任务清单

### Phase 1：安全与正确性

#### Task 1. 导入与代理安全收口

- 优先级：P0
- 状态：已完成
- 文件：
  - `app/api/parse-wechat/route.ts`
  - `app/api/proxy-image/route.ts`
  - `lib/server/urlGuards.ts`
- 结果：
  - 限制 URL 来源
  - 收紧代理边界
  - 明确错误响应

#### Task 2. 清理旧 draft 文档与遗留说明

- 优先级：P1
- 状态：已完成
- 文件：
  - `docs/requirements-draft-auto-save.md`
  - `README.md`
- 结果：
  - 将旧草稿恢复说明标记为历史方案或移除
  - 把 README 改成真实项目说明

#### Task 3. 建立 lint 基线

- 优先级：P1
- 状态：已完成
- 文件：
  - `package.json`
  - `.eslintrc.json` 或 `eslint.config.*`
- 结果：
  - `npm run lint` 可执行
  - 至少覆盖 Next.js + TypeScript 基础规则

### Phase 2：编辑页结构治理

#### Task 4. 拆分 `app/draft/page.tsx`

- 优先级：P1
- 状态：已完成
- 文件：
  - `app/draft/page.tsx`
  - `components/draft/*`
  - `hooks/useDraftDocument.ts`
  - `hooks/useExportSlides.ts`
- 结果：
  - 页面层只负责组装
  - 文档加载/保存逻辑独立
  - 导出逻辑独立
  - UI 面板独立

#### Task 5. 收敛编辑器动作语义

- 优先级：P2
- 状态：待开始
- 文件：
  - `components/EditorHeader.tsx`
  - `app/page.tsx`
- 结果：
  - 清理没有实际行为的按钮
  - 或补足对应功能

### Phase 3：分页引擎可维护性

#### Task 6. 拆分页逻辑

- 优先级：P1
- 状态：进行中
- 文件：
  - `hooks/useSmartPagination.ts`
- 结果：
  - 抽出 `splitMarkdownIntoBlocks`
  - 抽出 `splitBlock`
  - 抽出 `paginateBlocks`
  - 将 magic number 集中管理

#### Task 7. 增强分页稳定性

- 优先级：P2
- 状态：待开始
- 文件：
  - `hooks/useSmartPagination.ts`
  - `components/MarkdownRenderer.tsx`
- 结果：
  - 减少对经验值和延迟定时器的依赖
  - 补充复杂内容下的边界处理

### Phase 4：性能优化

#### Task 8. 降低 `/draft` 初始包体积

- 优先级：P2
- 状态：待开始
- 文件：
  - `app/draft/page.tsx`
  - `components/MarkdownRenderer.tsx`
  - 导出相关依赖加载点
- 结果：
  - 对 `html-to-image`、`jszip`、`file-saver` 做延迟加载
  - 评估 `react-syntax-highlighter` 按需加载

#### Task 9. 减少重复渲染成本

- 优先级：P3
- 状态：待开始
- 文件：
  - `app/draft/page.tsx`
  - `hooks/useSmartPagination.ts`
- 结果：
  - 降低预览区、测量区、导出区三份渲染带来的重算成本

---

## 5. 推荐执行顺序

建议严格按下面顺序推进：

1. 导入与代理安全收口
2. README / 历史文档清理
3. ESLint 基线
4. 拆分 `app/draft/page.tsx`
5. 分页逻辑拆分
6. 包体积与渲染性能优化

---

## 6. 执行说明

后续每做完一个任务，建议在本文档中同步更新：

- 状态：`待开始` / `进行中` / `已完成`
- 实际修改文件
- 验证方式
- 是否引入新的后续任务

这样文档既是计划表，也是执行记录。
