'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, PenTool, Layout } from 'lucide-react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { THEMES, ThemeConfig, getThemeStyles } from '../../lib/themeConfig';
import { cn } from '../../lib/utils';
import {
  getDocumentById,
  saveRecentEdit,
  generateDocId,
  titleFromMarkdown,
  subtitleFromMarkdown,
  setDraft,
  type CoverSettingsStored,
} from '../../lib/draftStorage';
import { EditorToolbar } from '../../components/EditorToolbar';
import { EditorHeader } from '../../components/EditorHeader';
import { ImportModal } from '../../components/ImportModal';
import { CoverCard, CoverSettings } from '../../components/CoverCard';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';
import { ThemeSidebar } from '../../components/ThemeSidebar';
import { useSmartPagination, Block } from '../../hooks/useSmartPagination';
import { IPhoneHeader } from '../../components/ThemeHeaders';

// --- Constants ---
const CARD_WIDTH = 375;
const CARD_HEIGHT = 500;
const EXPORT_SCALE = 3;



// --- Main App Component ---

const EditorContent: React.FC = () => {
  // State
  const [markdown, setMarkdown] = useState<string>('');

  // Use the new ThemeConfig system
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES[0]);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ done: number; total: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'cover'>('editor');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentDocumentIdRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHydratedRef = useRef(false);
  const latestStateRef = useRef({
    markdown: '',
    coverSettings: {
      enabled: true,
      title: '',
      subtitle: '',
      author: '',
      variant: 'simple' as CoverSettingsStored['variant'],
    },
    themeId: THEMES[0].id,
    pageCount: 1,
  });

  const searchParams = useSearchParams();

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

  // --- Load by ?id= (once) ---
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    const id = searchParams.get('id');
    if (id) {
      const doc = getDocumentById(id);
      if (doc) {
        setMarkdown(doc.markdown);
        setCoverSettings(doc.coverSettings as CoverSettings);
        const theme = THEMES.find((t) => t.id === doc.themeId);
        if (theme) setCurrentTheme(theme);
        currentDocumentIdRef.current = doc.id;
      }
    }
  }, [searchParams]);

  const flushDraft = useCallback(() => {
    const { markdown: md, coverSettings: coverStored, themeId, pageCount } = latestStateRef.current;
    if (md.trim().length === 0) return;

    const id = currentDocumentIdRef.current ?? generateDocId();
    if (!currentDocumentIdRef.current) currentDocumentIdRef.current = id;

    setDraft(md, coverStored, themeId);
    saveRecentEdit({
      id,
      title: titleFromMarkdown(md),
      subtitle: subtitleFromMarkdown(md),
      markdown: md,
      coverSettings: coverStored,
      themeId,
      pageCount,
    });
  }, []);

  // --- Persist draft + recent edits (debounced for markdown) ---
  useEffect(() => {
    const coverStored: CoverSettingsStored = {
      enabled: coverSettings.enabled,
      title: coverSettings.title,
      subtitle: coverSettings.subtitle,
      author: coverSettings.author,
      variant: coverSettings.variant,
    };
    latestStateRef.current = {
      markdown,
      coverSettings: coverStored,
      themeId: currentTheme.id,
      pageCount: pages.length,
    };

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(flushDraft, 800);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    };
  }, [markdown, coverSettings, currentTheme.id, pages.length, flushDraft]);

  // Flush the latest edit before route change/unmount so Home can read recent edits immediately.
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      flushDraft();
    };
  }, [flushDraft]);

  // --- Export Logic ---
  const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));

  const handleExport = async () => {
    const pageElements = Array.from(document.querySelectorAll('.preview-card'));
    const total = pageElements.length;
    if (total === 0) return;

    setIsExporting(true);
    setExportProgress({ done: 0, total });
    try {
      const zip = new JSZip();

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
        setExportProgress({ done: i + 1, total });
        await yieldToMain();
      }

      const content = await zip.generateAsync({ type: "blob" });
      FileSaver.saveAs(content, "rednote-slides.zip");
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed. If using external resources, they might be blocked by CORS.");
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // Helper styles wrapper
  const themeStyles = getThemeStyles(currentTheme);

  return (
    <div className="flex flex-col h-screen bg-neutral-100 overflow-hidden text-slate-800">

      {/* --- Top Bar --- */}
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
            R
          </div>
          <h1 className="font-bold text-xl tracking-tight hidden sm:block">RedNote Converter</h1>
        </Link>

        <div className="flex items-center gap-3">
          {exportProgress && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full transition-all duration-150"
                  style={{ width: `${(exportProgress.done / exportProgress.total) * 100}%` }}
                />
              </div>
              <span className="tabular-nums">{exportProgress.done} / {exportProgress.total}</span>
            </div>
          )}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transform active:scale-95"
          >
            {isExporting ? (
              <span>{exportProgress ? `Exporting ${exportProgress.done}/${exportProgress.total}...` : 'Preparing...'}</span>
            ) : (
              <>
                <Download size={18} />
                <span>Export Images</span>
              </>
            )}
          </button>
        </div>
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
                backgroundImage: 'var(--theme-bg-image)', // Apply new background image var
                backgroundSize: '20px 20px, 100% 100%', // Default size for patterns (dots)
                backgroundRepeat: 'repeat, no-repeat',
                padding: 'var(--theme-padding)',
                borderRadius: 'var(--theme-radius)',
                border: 'var(--theme-border)',
              }}
            >


              <div className="w-full h-full flex flex-col font-[family-name:var(--theme-font)]">

                {/* Optional Theme Header */}
                {currentTheme.container.headerStyle === 'iphone' && (
                  <IPhoneHeader />
                )}

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

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen bg-neutral-100 items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        <p className="mt-3 text-sm">加载中...</p>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
