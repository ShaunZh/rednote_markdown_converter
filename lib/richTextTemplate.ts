export const RICH_TEXT_TEMPLATE = `# 富文本模板示例

## 标题与段落
这是普通段落，支持 **加粗**、*斜体*、~~删除线~~、\`行内代码\` 与 [超链接](https://example.com)。

### 引用
> 这是一级引用。
> 
> > 这是二级引用。

## 列表
- 无序列表项 A
- 无序列表项 B
  - 嵌套子项 B.1
  - 嵌套子项 B.2

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

- [x] 已完成任务
- [ ] 待完成任务

---

## 表格
| 功能 | 状态 | 优先级 |
| :--- | :---: | ---: |
| Markdown 预览 | ✅ 已完成 | 高 |
| 图片导出 | ✅ 已完成 | 高 |
| 云端同步 | 🚧 进行中 | 中 |

## 代码块
\`\`\`ts
type User = {
  id: string;
  name: string;
};

const user: User = { id: 'u_001', name: 'RedNote' };
console.log(user);
\`\`\`

\`\`\`bash
npm install
npm run dev
\`\`\`

## 分隔线与图片
---
![示例图片](https://picsum.photos/seed/rednote/800/400)

## 小结
以上内容覆盖了编辑器内常用富文本语法，可直接用于排版与分页测试。`;
