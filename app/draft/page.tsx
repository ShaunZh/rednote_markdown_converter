'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, PenTool, Layout, X } from 'lucide-react';
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
const CARD_WIDTH = 405;
const CARD_HEIGHT = 540;
const EXPORT_TARGET_WIDTH = 1080;
// 405x540 * 2.6666667 = 1080x1440
const EXPORT_SCALE = EXPORT_TARGET_WIDTH / CARD_WIDTH;
const EXPORT_TIMEOUT_MS = 25000;
const CONTENT_PADDING_TOP_BOTTOM_REDUCTION = 6;
const CONTENT_PADDING_LEFT_RIGHT_REDUCTION = 14;

type ExportStatus = 'idle' | 'running' | 'canceling' | 'completed' | 'canceled' | 'error';

const DEFAULT_COVER_SETTINGS: CoverSettings = {
  enabled: true,
  title: 'RedNote Guide',
  subtitle: 'How to create viral content in minutes',
  author: '@RedNoteCreator',
  variant: 'simple',
  showPageNumber: true,
};

const normalizeCoverSettings = (
  input: Partial<CoverSettingsStored> | Partial<CoverSettings> | null | undefined
): CoverSettings => ({
  ...DEFAULT_COVER_SETTINGS,
  ...input,
  variant: (input?.variant as CoverSettings['variant']) ?? DEFAULT_COVER_SETTINGS.variant,
});



// --- Main App Component ---

const EditorContent: React.FC = () => {
  // State
  const [markdown, setMarkdown] = useState<string>('');

  // Use the new ThemeConfig system
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES[0]);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ done: number; total: number } | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportNotice, setExportNotice] = useState('');
  const [failedPages, setFailedPages] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'cover'>('editor');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [excludedExportIds, setExcludedExportIds] = useState<string[]>([]);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const cancelExportRef = useRef(false);
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
      showPageNumber: true,
    },
    themeId: THEMES[0].id,
    pageCount: 1,
  });

  const searchParams = useSearchParams();

  // Cover State
  const [coverSettings, setCoverSettings] = useState<CoverSettings>(DEFAULT_COVER_SETTINGS);

  // --- Pagination Algorithm ---
  const { pages, measureRef, blocks } = useSmartPagination({
    markdown,
    theme: currentTheme,
    cardHeight: CARD_HEIGHT,
    includePageNumber: coverSettings.showPageNumber,
    paddingYOffset: -CONTENT_PADDING_TOP_BOTTOM_REDUCTION * 2,
  });

  const exportTargetIds = React.useMemo(() => {
    const ids: string[] = [];
    if (coverSettings.enabled) ids.push('cover');
    for (let i = 0; i < pages.length; i++) ids.push(`page-${i}`);
    return ids;
  }, [coverSettings.enabled, pages.length]);

  useEffect(() => {
    setExcludedExportIds((prev) => prev.filter((id) => exportTargetIds.includes(id)));
  }, [exportTargetIds]);

  const selectedExportIds = React.useMemo(() => {
    const excluded = new Set(excludedExportIds);
    return exportTargetIds.filter((id) => !excluded.has(id));
  }, [excludedExportIds, exportTargetIds]);

  const toggleExportSelection = (id: string) => {
    setExcludedExportIds((prev) => (
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    ));
  };

  const selectAllExportTargets = () => setExcludedExportIds([]);
  const clearAllExportTargets = () => setExcludedExportIds(exportTargetIds);

  // --- Load by ?id= (once) ---
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    const id = searchParams.get('id');
    if (id) {
      const doc = getDocumentById(id);
      if (doc) {
        setMarkdown(doc.markdown);
        setCoverSettings(normalizeCoverSettings(doc.coverSettings as Partial<CoverSettingsStored>));
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
      showPageNumber: coverSettings.showPageNumber,
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
  const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string) =>
    new Promise<T>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        reject(new Error(`${label} 超时`));
      }, ms);
      promise
        .then((v) => {
          window.clearTimeout(timer);
          resolve(v);
        })
        .catch((err) => {
          window.clearTimeout(timer);
          reject(err);
        });
    });

  const requestCancelExport = () => {
    if (!isExporting) return;
    cancelExportRef.current = true;
    setExportStatus('canceling');
    setExportNotice('正在取消，当前图片处理完成后将停止。');
  };

  const closeExportModal = () => {
    if (isExporting) {
      setIsExportModalOpen(false);
      return;
    }
    setIsExportModalOpen(false);
    setExportStatus('idle');
    setExportProgress(null);
    setExportNotice('');
    setFailedPages([]);
  };

  const handleExport = async () => {
    if (isExporting) return;

    const exportContainer = exportContainerRef.current;
    if (!exportContainer) return;

    const selectedSet = new Set(selectedExportIds);
    const pageElements = Array.from(
      exportContainer.querySelectorAll<HTMLElement>('.export-card')
    ).filter((el) => {
      const id = el.dataset.exportId;
      return typeof id === 'string' && selectedSet.has(id);
    });
    const total = pageElements.length;
    if (total === 0) {
      alert('请先在预览区勾选需要导出的页面。');
      return;
    }

    cancelExportRef.current = false;
    setFailedPages([]);
    setExportNotice('');
    setExportStatus('running');
    setIsExportModalOpen(true);
    setIsExporting(true);
    setExportProgress({ done: 0, total });
    try {
      if (typeof document !== 'undefined' && 'fonts' in document) {
        await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
      }

      const zip = new JSZip();
      const failedIndexes: number[] = [];
      let successCount = 0;

      for (let i = 0; i < pageElements.length; i++) {
        if (cancelExportRef.current) break;

        const el = pageElements[i] as HTMLElement;
        try {
          const dataUrl = await withTimeout(
            toPng(el, {
              pixelRatio: EXPORT_SCALE,
              cacheBust: true,
              skipAutoScale: true,
            }),
            EXPORT_TIMEOUT_MS,
            `第 ${i + 1} 张图片导出`
          );
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          const fileName = `slide-${String(i).padStart(2, '0')}.png`;
          zip.file(fileName, base64Data, { base64: true });
          successCount += 1;
          setExportProgress({ done: successCount, total });
        } catch (err) {
          console.error(`Export page ${i + 1} failed`, err);
          failedIndexes.push(i + 1);
        }
        await yieldToMain();
      }

      const wasCanceled = cancelExportRef.current;
      if (successCount > 0) {
        const content = await zip.generateAsync({ type: "blob" });
        const zipName = wasCanceled ? "rednote-slides-partial.zip" : "rednote-slides.zip";
        FileSaver.saveAs(content, zipName);
      }

      setFailedPages(failedIndexes);
      if (wasCanceled) {
        setExportStatus('canceled');
        setExportNotice(
          successCount > 0
            ? `已取消导出，已完成 ${successCount}/${total} 张，并已下载部分结果。`
            : '已取消导出，未生成可下载图片。'
        );
      } else if (successCount === 0) {
        setExportStatus('error');
        setExportNotice('导出失败，未生成任何图片。');
      } else if (failedIndexes.length > 0) {
        setExportStatus('completed');
        setExportNotice(`导出完成：成功 ${successCount}/${total} 张，失败 ${failedIndexes.length} 张。`);
      } else {
        setExportStatus('completed');
        setExportNotice('导出完成，图片已下载。');
      }
    } catch (err) {
      console.error("Export failed", err);
      setExportStatus('error');
      setExportNotice('导出出现异常，请重试或降低内容复杂度后再导出。');
    } finally {
      setIsExporting(false);
      cancelExportRef.current = false;
    }
  };

  // Helper styles wrapper
  const themeStyles = getThemeStyles(currentTheme);
  const contentPadding = `calc(var(--theme-padding) - ${CONTENT_PADDING_TOP_BOTTOM_REDUCTION}px) calc(var(--theme-padding) - ${CONTENT_PADDING_LEFT_RIGHT_REDUCTION}px)`;

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
          {!isExporting && exportTargetIds.length > 0 && (
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
              <span className="tabular-nums">已选 {selectedExportIds.length}/{exportTargetIds.length}</span>
              <button
                type="button"
                onClick={selectAllExportTargets}
                className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
              >
                全选
              </button>
              <button
                type="button"
                onClick={clearAllExportTargets}
                className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
              >
                清空
              </button>
            </div>
          )}
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
          {isExporting && !isExportModalOpen && (
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="hidden sm:inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
            >
              查看导出进度
            </button>
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

              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <span className="font-medium text-slate-700 text-sm">Show Page Number</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={coverSettings.showPageNumber}
                    onChange={(e) => setCoverSettings(prev => ({ ...prev, showPageNumber: e.target.checked }))}
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
        <div
          className="w-[540px] bg-neutral-100/50 overflow-y-auto p-8 relative flex flex-col items-center gap-8 shadow-inner"
        >

          {/* Render Cover Card First */}
          {coverSettings.enabled && (
            <div className="relative">
              <CoverCard
                settings={coverSettings}
                theme={currentTheme}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
              />
              <label className="absolute top-3 left-3 z-20 inline-flex items-center gap-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-slate-700 shadow-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-slate-800"
                  checked={selectedExportIds.includes('cover')}
                  onChange={() => toggleExportSelection('cover')}
                  disabled={isExporting}
                />
                封面
              </label>
            </div>
          )}

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
                padding: contentPadding,
                borderRadius: 'var(--theme-radius)',
                border: 'var(--theme-border)',
              }}
            >


              <div className="w-full h-full flex flex-col font-[family-name:var(--theme-font)]">
                <label className="absolute top-3 left-3 z-20 inline-flex items-center gap-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-slate-700 shadow-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-slate-800"
                    checked={selectedExportIds.includes(`page-${idx}`)}
                    onChange={() => toggleExportSelection(`page-${idx}`)}
                    disabled={isExporting}
                  />
                  第 {idx + 1} 页
                </label>

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

                {coverSettings.showPageNumber && (
                  <div className="mt-auto pt-0.5 opacity-40 text-[9px] leading-none font-sans">
                    <span>{idx + 1} / {pages.length}</span>
                  </div>
                )}
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
        className="fixed top-0 -left-[9999px] -z-50 opacity-0 pointer-events-none"
        aria-hidden="true"
        style={{
          width: `${CARD_WIDTH}px`,
          ...themeStyles as React.CSSProperties,
          fontFamily: 'var(--theme-font)',
          padding: contentPadding,
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

      {/* Dedicated offscreen export source to avoid preview DOM interference */}
      <div
        ref={exportContainerRef}
        className="fixed -left-[99999px] top-0 -z-50 opacity-0 pointer-events-none"
        aria-hidden="true"
      >
        {coverSettings.enabled && (
          <div className="export-card" data-export-id="cover">
            <CoverCard
              settings={coverSettings}
              theme={currentTheme}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
            />
          </div>
        )}

        {pages.map((pageContent, idx) => (
          <div key={`export-page-${idx}`} className="export-card" data-export-id={`page-${idx}`}>
            <div
              className="shrink-0 relative overflow-hidden"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                ...themeStyles as React.CSSProperties,
                background: 'var(--theme-bg)',
                backgroundImage: 'var(--theme-bg-image)',
                backgroundSize: '20px 20px, 100% 100%',
                backgroundRepeat: 'repeat, no-repeat',
                padding: contentPadding,
                borderRadius: 'var(--theme-radius)',
                border: 'var(--theme-border)',
              }}
            >
              <div className="w-full h-full flex flex-col font-[family-name:var(--theme-font)]">
                {currentTheme.container.headerStyle === 'iphone' && (
                  <IPhoneHeader />
                )}

                <div className="flex-1">
                  {pageContent.map((block) => (
                    <MarkdownRenderer key={block.id} content={block.content} theme={currentTheme} />
                  ))}
                </div>

                {coverSettings.showPageNumber && (
                  <div className="mt-auto pt-0.5 opacity-40 text-[9px] leading-none font-sans">
                    <span>{idx + 1} / {pages.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export Progress Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 className="text-base font-semibold text-slate-800">导出图片</h3>
              {!isExporting && (
                <button
                  type="button"
                  onClick={closeExportModal}
                  className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-neutral-100 transition-colors"
                  title="关闭"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="px-5 py-4 space-y-3">
              <p className="text-sm text-slate-600">
                {exportStatus === 'running' && '正在生成图片，请耐心等待。'}
                {exportStatus === 'canceling' && '正在取消导出，当前图片完成后会停止。'}
                {exportStatus === 'completed' && '导出已完成。'}
                {exportStatus === 'canceled' && '导出已取消。'}
                {exportStatus === 'error' && '导出发生异常。'}
              </p>

              {exportProgress && (
                <div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-slate-700 transition-all duration-200"
                      style={{ width: `${(exportProgress.done / exportProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 tabular-nums">
                    {exportProgress.done} / {exportProgress.total}
                  </p>
                </div>
              )}

              {failedPages.length > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  失败页码：{failedPages.join(', ')}
                </p>
              )}

              {exportNotice && (
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  {exportNotice}
                </p>
              )}
            </div>

            <div className="px-5 pb-5 flex items-center justify-end gap-2">
              {isExporting && exportStatus !== 'canceling' && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-neutral-300 text-slate-600 hover:bg-neutral-100 transition-colors"
                  >
                    后台继续
                  </button>
                  <button
                    type="button"
                    onClick={requestCancelExport}
                    className="px-3 py-1.5 text-sm rounded-lg bg-[#d43838] text-white hover:bg-[#be2e2e] transition-colors"
                  >
                    取消导出
                  </button>
                </>
              )}

              {isExporting && exportStatus === 'canceling' && (
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 text-sm rounded-lg bg-slate-300 text-white cursor-not-allowed"
                >
                  正在取消...
                </button>
              )}

              {!isExporting && (
                <button
                  type="button"
                  onClick={closeExportModal}
                  className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  关闭
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
