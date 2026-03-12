'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CoverSettings } from '../../components/CoverCard';
import { DraftEditorPane } from '../../components/draft/DraftEditorPane';
import { DraftPreviewPane } from '../../components/draft/DraftPreviewPane';
import { DraftSettingsSidebar } from '../../components/draft/DraftSettingsSidebar';
import { DraftTopBar } from '../../components/draft/DraftTopBar';
import { ExportProgressModal } from '../../components/draft/ExportProgressModal';
import { ImportModal } from '../../components/ImportModal';
import { useDraftDocument } from '../../hooks/useDraftDocument';
import { useExportSlides } from '../../hooks/useExportSlides';
import { useSmartPagination } from '../../hooks/useSmartPagination';
import {
  DEFAULT_APPEARANCE_SETTINGS,
  getCanvasPresetConfig,
  type AppearanceSettings,
} from '../../lib/appearanceSettings';
import { getThemeStyles } from '../../lib/themeConfig';

const CONTENT_PADDING_TOP_BOTTOM_REDUCTION = 6;
const CONTENT_PADDING_LEFT_RIGHT_REDUCTION = 14;

const DEFAULT_COVER_SETTINGS: CoverSettings = {
  enabled: true,
  title: '小红书创作指南',
  subtitle: '几分钟做出更容易传播的内容',
  date: '',
  author: '@小红书创作者',
  coverImage: '',
  variant: 'simple',
  showPageNumber: true,
};

const EditorContent: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pageCountForSave, setPageCountForSave] = useState(1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  const {
    markdown,
    setMarkdown,
    currentTheme,
    setCurrentTheme,
    coverSettings,
    setCoverSettings,
    appearanceSettings,
    setAppearanceSettings,
    handleCreateNewDocument,
    documentRevision,
  } = useDraftDocument({
    defaultCoverSettings: DEFAULT_COVER_SETTINGS,
    defaultAppearanceSettings: DEFAULT_APPEARANCE_SETTINGS,
    pageCount: pageCountForSave,
  });

  const handleShowPageNumberChange = useCallback((checked: boolean) => {
    setAppearanceSettings((prev) => ({ ...prev, showPageNumber: checked }));
    setCoverSettings((prev) => (
      prev.showPageNumber === checked ? prev : { ...prev, showPageNumber: checked }
    ));
  }, [setAppearanceSettings, setCoverSettings]);

  const handleCanvasPresetChange = useCallback((canvasPreset: AppearanceSettings['canvasPreset']) => {
    setAppearanceSettings((prev) => (
      prev.canvasPreset === canvasPreset ? prev : { ...prev, canvasPreset }
    ));
  }, [setAppearanceSettings]);

  const handleCoverTitleSizeChange = useCallback((coverTitleSize: number) => {
    setAppearanceSettings((prev) => (
      prev.coverTitleSize === coverTitleSize ? prev : { ...prev, coverTitleSize }
    ));
  }, [setAppearanceSettings]);

  const handleBodyFontSizeChange = useCallback((bodyFontSize: number) => {
    setAppearanceSettings((prev) => (
      prev.bodyFontSize === bodyFontSize ? prev : { ...prev, bodyFontSize }
    ));
  }, [setAppearanceSettings]);

  const handleHeadingScaleChange = useCallback((headingScale: number) => {
    setAppearanceSettings((prev) => (
      prev.headingScale === headingScale ? prev : { ...prev, headingScale }
    ));
  }, [setAppearanceSettings]);

  const canvasPreset = useMemo(
    () => getCanvasPresetConfig(appearanceSettings.canvasPreset),
    [appearanceSettings.canvasPreset]
  );

  const contentStyleSignature = useMemo(
    () => `${appearanceSettings.bodyFontSize ?? 'auto'}:${appearanceSettings.headingScale ?? 'auto'}`,
    [appearanceSettings.bodyFontSize, appearanceSettings.headingScale]
  );

  const { pages, measureRef, blocks } = useSmartPagination({
    markdown,
    theme: currentTheme,
    cardHeight: canvasPreset.height,
    includePageNumber: appearanceSettings.showPageNumber,
    contentStyleSignature,
    paddingYOffset: -CONTENT_PADDING_TOP_BOTTOM_REDUCTION * 2,
  });

  useEffect(() => {
    setPageCountForSave(pages.length);
  }, [pages.length]);

  const {
    isExporting,
    shouldRenderExportContainer,
    exportProgress,
    isExportModalOpen,
    setIsExportModalOpen,
    exportStatus,
    exportNotice,
    failedPages,
    exportTargetIds,
    selectedExportIds,
    toggleExportSelection,
    selectAllExportTargets,
    clearAllExportTargets,
    resetExportSelections,
    requestCancelExport,
    closeExportModal,
    handleExport,
  } = useExportSlides({
    exportContainerRef,
    cardWidth: canvasPreset.width,
    exportTargetWidth: canvasPreset.exportWidth,
    includeCover: coverSettings.enabled,
    pageCount: pages.length,
  });

  useEffect(() => {
    resetExportSelections();
  }, [documentRevision, resetExportSelections]);

  const themeStyles = useMemo(() => getThemeStyles(currentTheme), [currentTheme]);
  const contentPadding = useMemo(
    () => `calc(var(--theme-padding) - ${CONTENT_PADDING_TOP_BOTTOM_REDUCTION}px) calc(var(--theme-padding) - ${CONTENT_PADDING_LEFT_RIGHT_REDUCTION}px)`,
    []
  );

  return (
    <div className="flex flex-col h-screen bg-neutral-100 overflow-hidden text-slate-800">
      <DraftTopBar />

      <main className="flex-1 flex overflow-hidden">
        <DraftEditorPane
          textareaRef={textareaRef}
          markdown={markdown}
          setMarkdown={setMarkdown}
          onImportClick={() => setIsImportModalOpen(true)}
          onNewClick={handleCreateNewDocument}
        />

        <DraftPreviewPane
          cardWidth={canvasPreset.width}
          cardHeight={canvasPreset.height}
          coverSettings={coverSettings}
          showPageNumber={appearanceSettings.showPageNumber}
          appearanceSettings={appearanceSettings}
          currentTheme={currentTheme}
          pages={pages}
          blocks={blocks}
          selectedExportIds={selectedExportIds}
          toggleExportSelection={toggleExportSelection}
          isExporting={isExporting}
          shouldRenderExportContainer={shouldRenderExportContainer}
          measureRef={measureRef}
          exportContainerRef={exportContainerRef}
          themeStyles={themeStyles}
          contentPadding={contentPadding}
        />

        <DraftSettingsSidebar
          currentTheme={currentTheme}
          onThemeSelect={setCurrentTheme}
          coverSettings={coverSettings}
          setCoverSettings={setCoverSettings}
          appearanceSettings={appearanceSettings}
          onCanvasPresetChange={handleCanvasPresetChange}
          onCoverTitleSizeChange={handleCoverTitleSizeChange}
          onBodyFontSizeChange={handleBodyFontSizeChange}
          onHeadingScaleChange={handleHeadingScaleChange}
          onShowPageNumberChange={handleShowPageNumberChange}
          isExporting={isExporting}
          exportProgress={exportProgress}
          isExportModalOpen={isExportModalOpen}
          exportTargetCount={exportTargetIds.length}
          selectedExportCount={selectedExportIds.length}
          onSelectAll={selectAllExportTargets}
          onClearAll={clearAllExportTargets}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onExport={handleExport}
        />
      </main>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(content) => {
          setMarkdown(content);
          setIsImportModalOpen(false);
        }}
      />

      <ExportProgressModal
        isOpen={isExportModalOpen}
        isExporting={isExporting}
        exportStatus={exportStatus}
        exportProgress={exportProgress}
        failedPages={failedPages}
        exportNotice={exportNotice}
        onClose={closeExportModal}
        onHide={() => setIsExportModalOpen(false)}
        onCancel={requestCancelExport}
      />
    </div>
  );
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-screen bg-neutral-100 items-center justify-center text-slate-500">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm">加载中...</p>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
