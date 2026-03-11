# rednote-markdown-converter

将 Markdown 内容转换成适合小红书发布的分页图片卡片。

## 项目概述

这是一个基于 Next.js App Router 的前端工具，核心能力包括：

- Markdown 编辑与实时预览
- 智能分页
- 多主题样式切换
- 封面页配置
- 图片导出为 ZIP
- 微信公众号文章导入
- 本地“近期编辑”文档管理

## 当前产品模型

- `/draft` 表示新建文档入口
- `/draft?id=...` 表示打开一篇历史文档
- 文档仅持久化到浏览器 `localStorage`
- 当前仅保留 `recent edits` 这一套文档模型
- 不再维护独立的“自动草稿恢复”语义

## 技术栈

- Next.js 14.1.0
- React 18
- TypeScript
- Tailwind CSS
- `react-markdown` + `remark-gfm`
- `react-syntax-highlighter`
- `html-to-image`
- `jszip`
- `file-saver`
- `axios`
- `cheerio`
- `turndown`

## 目录说明

- `app/`
  - `page.tsx`：首页与近期编辑入口
  - `draft/page.tsx`：主编辑器、预览、导出
  - `notes/page.tsx`：笔记管理页
  - `api/parse-wechat/route.ts`：微信公众号文章导入
  - `api/proxy-image/route.ts`：远程图片代理
- `components/`：编辑器、主题、封面、渲染相关组件
- `hooks/useSmartPagination.ts`：分页逻辑
- `lib/themeConfig.ts`：主题定义
- `lib/draftStorage.ts`：本地文档存储
- `docs/project-optimization-roadmap.md`：后续优化路线图

## 本地开发

### 环境要求

- Node.js 18+
- npm

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

### 生产构建

```bash
npm run build
npm run start
```

## 环境变量

项目当前实际使用的环境变量：

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

用途：

- 编辑器内上传图片到 Cloudinary
- 将返回的图片 URL 插入 Markdown 内容

如果未配置这两个变量，编辑器内“上传图片”功能不可用，但其余功能仍可运行。

## 导入与图片代理限制

为避免服务端开放代理风险，当前做了来源限制：

- 微信文章导入仅接受 `https://mp.weixin.qq.com/...`
- 图片代理仅允许微信图片域名和 `res.cloudinary.com`

这不会影响你在编辑器内直接插入 Cloudinary 图片。

## 校验方式

当前建议的最低校验方式：

- `npm run build`

说明：

- `npm run lint` 目前尚未完成 ESLint 配置，执行时会进入 Next.js 初始化向导

## 后续计划

详见路线图文档：

- [`docs/project-optimization-roadmap.md`](docs/project-optimization-roadmap.md)
