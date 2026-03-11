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

- `npm run lint` 当前不可作为自动化校验命令，因为仓库尚未配置 ESLint。
- `app/draft/page.tsx` 仍然过大，承担了过多状态和流程。

---

## 3. 下一优先级

下一步建议优先推进：**拆分 `app/draft/page.tsx`**

原因：

- 当前主编辑页承担了过多职责。
- 它已经是后续功能扩展和维护成本的主要来源。
- 现在 lint 和 build 基线已经可用，适合进入结构治理阶段。

### 目标

把主编辑页拆成更清晰的状态层、导出层和展示层，降低后续修改风险。

### 涉及文件

- `app/draft/page.tsx`
- `components/draft/*`
- `hooks/useDraftDocument.ts`
- `hooks/useExportSlides.ts`

### 预期修改

1. 将文档加载/保存逻辑从页面中抽离。
2. 将导出逻辑从页面中抽离。
3. 将编辑器、封面配置、预览区域拆成独立组件。
4. 让页面层只保留编排职责。

### 验收标准

- [ ] `app/draft/page.tsx` 明显瘦身。
- [ ] 文档状态与导出状态从页面层解耦。
- [ ] 拆分后 lint / build 仍通过。

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
- 状态：进行中
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
- 状态：待开始
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
