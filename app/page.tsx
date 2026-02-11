'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, PenTool, Layout } from 'lucide-react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { THEMES, ThemeConfig, getThemeStyles } from '../lib/themeConfig';
import { cn } from '../lib/utils';
import { EditorToolbar } from '../components/EditorToolbar';
import { EditorHeader } from '../components/EditorHeader';
import { ImportModal } from '../components/ImportModal';
import { CoverCard, CoverSettings } from '../components/CoverCard';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { ThemeSidebar } from '../components/ThemeSidebar';
import { useSmartPagination, Block } from '../hooks/useSmartPagination';

// --- Constants ---
const CARD_WIDTH = 375;
const CARD_HEIGHT = 500;
const EXPORT_SCALE = 3;



// --- Main App Component ---

const Page: React.FC = () => {
  // State
  const [markdown, setMarkdown] = useState<string>(`# 🎨 Design System Guide

Welcome to the **RedNote Converter** style guide. This document demonstrates all supported markdown features.

## 1. Typography & Formatting

We support standard markdown formatting:
- **Bold text** for emphasis
- *Italic text* for subtlety
- ~~Strikethrough~~ for deprecated items
- \`Inline code\` for technical terms

> "Design is not just what it looks like and feels like. Design is how it works."
> — *Steve Jobs*

---

## 2. Lists & Organization

### Ordered List
1.  **Research**: Understand the user patterns
2.  **Design**: Create high-fidelity mockups
3.  **Develop**: Build with efficient code

### Unordered List
- 🎨 **Color Palette**: Vibrant and accessible
- 📐 **Typography**: Clean and readable
- ⚡️ **Performance**: Fast loading times

### Nested List
- Frontend
  - React
  - Tailwind CSS
- Backend
  - Node.js
  - Next.js

---

## 3. Code Blocks

We support syntax highlighting with a Mac-style window header.

### TypeScript / React
\`\`\`tsx
interface Props {
  title: string;
  isActive: boolean;
}

const Button: React.FC<Props> = ({ title, isActive }) => {
  return (
    <button className={isActive ? 'active' : 'inactive'}>
      {title}
    </button>
  );
};
\`\`\`

### CSS / Styling
\`\`\`css
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
}
\`\`\`

---

## 4. Visual Elements

### Tables (GFM)
| Feature | Status | Priority |
| :--- | :---: | ---: |
| Dark Mode | ✅ Ready | High |
| Export | ✅ Ready | High |
| Cloud Sync | 🚧 WIP | Low |

### Images
![Abstract Design](https://picsum.photos/seed/design/800/400)
*Figure 1: Generated placeholder image*

### Links
Visit [Next.js Documentation](https://nextjs.org) to learn more.这是一个非常经典的前端难题。在 Web 开发中，浏览器本身是流式布局（Flow Layout），并不存在“页”的概念（除了打印模式）。针对将 Markdown 转为固定尺寸图片（如小红书 3:4 卡片）的场景，市面上没有直接能用的完美 npm 包，但有一套成熟的 “DOM 预计算 + 贪心算法” 解决方案核心原理：贪心装箱算法 (Greedy Bin Packing)想象你有这堆东西：标题、段落、代码块、图片。 你有一堆箱子（卡片），每个箱子高度固定为 1000px。这是一个非常经典的前端难题。在 Web 开发中，浏览器本身是流式布局（Flow Layout），并不存在“页”的概念（除了打印模式）。这是一个非常经典的前端难题。在 Web 开发中，浏览器本身是流式布局（Flow Layout），并不存在“页”的概念（除了打印模式）。针对将 Markdown 转为固定尺寸图片（如小红书 3:4 卡片）的场景，市面上没有直接能用的完美 npm 包，但有一套成熟的 “DOM 预计算 + 贪心算法” 解决方案核心原理：贪心装箱算法 (Greedy Bin Packing)想象你有这堆东西：标题、段落、代码块、图片。 你有一堆箱子（卡片），每个箱子高度固定为 1000px。这是一个非常经典的前端难题。在 Web 开发中，浏览器本身是流式布局（Flow Layout），并不存在“页”的概念（除了打印模式）。这是一个非常经典的前端难题。在 Web 开发中，浏览器本身是流式布局（Flow Layout），并不存在“页”的概念（除了打印模式）。针对将 Markdown 转为固定尺寸图片（如小红书 3:4 卡片）的场景，市面上没有直接能用的完美 npm 包，但有一套成熟的 “DOM 预计算 + 贪心算法” 解决方案核心原理：贪心装箱算法 (Greedy Bin Packing)想象你有这堆东西：标题、段落、代码块、图片。 你有一堆箱子（卡片），每个箱子高度固定为 1000px。这是一个非常经典的前端难题。在 Web 开发中，浏览器本身是流式布局（Flow Layout），并不存在“页”的概念（除了打印模式）。`);

  // Use the new ThemeConfig system
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES[0]);

  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'cover'>('editor');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cover State
  const [coverSettings, setCoverSettings] = useState<CoverSettings>({
    enabled: true,
    title: 'RedNote Guide',
    subtitle: 'How to create viral content in minutes',
    author: '@RedNoteCreator',
    variant: 'simple'
  });

  // --- Pagination Algorithm ---
  const { pages, measureRef, blocks } = useSmartPagination({
    markdown,
    theme: currentTheme,
    cardHeight: CARD_HEIGHT
  });

  // --- Export Logic ---
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const pageElements = document.querySelectorAll('.preview-card');

      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i] as HTMLElement;
        const dataUrl = await toPng(el, {
          pixelRatio: EXPORT_SCALE,
          cacheBust: true,
          skipAutoScale: true,
        });
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        const fileName = `slide-${String(i).padStart(2, '0')}.png`;
        zip.file(fileName, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      FileSaver.saveAs(content, "rednote-slides.zip");
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed. If using external resources, they might be blocked by CORS.");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper styles wrapper
  const themeStyles = getThemeStyles(currentTheme);

  return (
    <div className="flex flex-col h-screen bg-neutral-100 overflow-hidden text-slate-800">

      {/* --- Top Bar --- */}
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
            R
          </div>
          <h1 className="font-bold text-xl tracking-tight hidden sm:block">RedNote Converter</h1>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transform active:scale-95"
        >
          {isExporting ? (
            <span>Generating...</span>
          ) : (
            <>
              <Download size={18} />
              <span>Export Images</span>
            </>
          )}
        </button>
      </header>

      {/* --- Main Area (3 Columns) --- */}
      <main className="flex-1 flex overflow-hidden">

        {/* 1. Left Column: Editor & Settings */}
        <div className="flex-1 min-w-[350px] border-r border-neutral-200 bg-white flex flex-col shrink-0 relative z-30">
          {/* Tab Navigation */}
          <div className="flex border-b border-neutral-200">
            <button
              onClick={() => setActiveTab('editor')}
              className={cn(
                "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                activeTab === 'editor'
                  ? "border-red-500 text-red-600 bg-red-50/50"
                  : "border-transparent text-slate-500 hover:bg-slate-50"
              )}
            >
              <PenTool size={16} /> Editor
            </button>
            <button
              onClick={() => setActiveTab('cover')}
              className={cn(
                "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                activeTab === 'cover'
                  ? "border-red-500 text-red-600 bg-red-50/50"
                  : "border-transparent text-slate-500 hover:bg-slate-50"
              )}
            >
              <Layout size={16} /> Cover
            </button>
          </div>

          {/* Tab Content: Editor */}
          {activeTab === 'editor' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <EditorHeader onImportClick={() => setIsImportModalOpen(true)} />
              <EditorToolbar
                textareaRef={textareaRef}
                markdown={markdown}
                setMarkdown={setMarkdown}
              />
              <textarea
                ref={textareaRef}
                className="flex-1 w-full p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed text-slate-700 bg-slate-50/30"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Type your markdown here..."
                spellCheck={false}
              />
            </div>
          )}

          {/* Tab Content: Cover Settings */}
          {activeTab === 'cover' && (
            <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto bg-neutral-50/50">
              {/* Toggle Enable */}
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <span className="font-medium text-slate-700 text-sm">Enable Cover Page</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={coverSettings.enabled}
                    onChange={(e) => setCoverSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>

              {coverSettings.enabled && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                      <input
                        type="text"
                        value={coverSettings.title}
                        onChange={(e) => setCoverSettings(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                        placeholder="Main Headline"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subtitle</label>
                      <textarea
                        rows={2}
                        value={coverSettings.subtitle}
                        onChange={(e) => setCoverSettings(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm resize-none"
                        placeholder="Subtitle or description"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Author Name</label>
                      <input
                        type="text"
                        value={coverSettings.author}
                        onChange={(e) => setCoverSettings(prev => ({ ...prev, author: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Cover Layout</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['simple', 'modern', 'outline'] as const).map((variant) => (
                        <button
                          key={variant}
                          onClick={() => setCoverSettings(prev => ({ ...prev, variant }))}
                          className={cn(
                            "py-2 px-1 rounded-lg border-2 text-xs font-medium capitalize transition-all",
                            coverSettings.variant === variant
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          )}
                        >
                          {variant}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 2. Middle Column: Live Preview */}
        <div className="w-[540px] bg-neutral-100/50 overflow-y-auto p-8 relative flex flex-col items-center gap-8 shadow-inner">

          {/* Render Cover Card First */}
          <CoverCard
            settings={coverSettings}
            theme={currentTheme}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
          />

          {/* Rendering Pages */}
          {pages.map((pageContent, idx) => (
            <div
              key={idx}
              id={`page-${idx}`}
              className="preview-card shrink-0 relative shadow-2xl transition-transform hover:scale-[1.01] duration-300 ease-out origin-center overflow-hidden"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                ...themeStyles as React.CSSProperties, // Apply CSS Variables
                // Apply container styles directly as well for html-to-image compatibility
                background: 'var(--theme-bg)',
                padding: 'var(--theme-padding)',
                borderRadius: 'var(--theme-radius)',
                border: 'var(--theme-border)',
              }}
            >
              <div className="w-full h-full flex flex-col font-[family-name:var(--theme-font)]">

                {/* Page Content */}
                <div className="flex-1">
                  {pageContent.map((block) => (
                    <MarkdownRenderer key={block.id} content={block.content} theme={currentTheme} />
                  ))}
                </div>

                {/* Footer / Branding */}
                <div className="mt-auto pt-4 flex items-center justify-between opacity-40 text-[10px] font-sans border-t" style={{ borderColor: 'var(--theme-border)' }}>
                  <span>{idx + 1} / {pages.length}</span>
                  <span className="font-semibold tracking-widest uppercase">RedNote</span>
                </div>
              </div>
            </div>
          ))}

          <div className="h-20" /> {/* Spacer */}
        </div>

        {/* 3. Right Column: Theme Sidebar */}
        <ThemeSidebar
          currentTheme={currentTheme}
          onSelect={setCurrentTheme}
        />

      </main>

      {/* --- Hidden Measurement Container --- */}
      <div
        ref={measureRef}
        className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none"
        style={{
          width: `${CARD_WIDTH}px`,
          ...themeStyles as React.CSSProperties,
          fontFamily: 'var(--theme-font)',
          padding: 'var(--theme-padding)',
        }}
      >
        {blocks.map(block => (
          <MarkdownRenderer key={block.id} content={block.content} theme={currentTheme} />
        ))}
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(content) => {
          setMarkdown(content);
          setIsImportModalOpen(false);
        }}
      />

    </div>
  );
};

export default Page;