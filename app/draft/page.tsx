'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';

import type { CoverSettings } from '../../components/CoverCard';
import { DraftEditorPane } from '../../components/draft/DraftEditorPane';
import { DraftPreviewPane } from '../../components/draft/DraftPreviewPane';
import { DraftTopBar } from '../../components/draft/DraftTopBar';
import { ExportProgressModal } from '../../components/draft/ExportProgressModal';
import { ImportModal } from '../../components/ImportModal';
import { ThemeSidebar } from '../../components/ThemeSidebar';
import { useDraftDocument } from '../../hooks/useDraftDocument';
import { useExportSlides } from '../../hooks/useExportSlides';
import { useSmartPagination } from '../../hooks/useSmartPagination';
import { getThemeStyles } from '../../lib/themeConfig';

const CARD_WIDTH = 405;
const CARD_HEIGHT = 540;
const CONTENT_PADDING_TOP_BOTTOM_REDUCTION = 6;
const CONTENT_PADDING_LEFT_RIGHT_REDUCTION = 14;

const DEFAULT_COVER_SETTINGS: CoverSettings = {
  enabled: true,
  title: '小红书创作指南',
  subtitle: '几分钟做出更容易传播的内容',
  author: '@小红书创作者',
  variant: 'simple',
  showPageNumber: true,
};

const EditorContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'cover'>('editor');
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
    handleCreateNewDocument,
    documentRevision,
  } = useDraftDocument({
    defaultCoverSettings: DEFAULT_COVER_SETTINGS,
    pageCount: pageCountForSave,
  });

  const { pages, measureRef, blocks } = useSmartPagination({
    markdown,
    theme: currentTheme,
    cardHeight: CARD_HEIGHT,
    includePageNumber: coverSettings.showPageNumber,
    paddingYOffset: -CONTENT_PADDING_TOP_BOTTOM_REDUCTION * 2,
  });

  useEffect(() => {
    setPageCountForSave(pages.length);
  }, [pages.length]);

  const {
    isExporting,
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
    includeCover: coverSettings.enabled,
    pageCount: pages.length,
  });

  useEffect(() => {
    setActiveTab('editor');
    resetExportSelections();
  }, [documentRevision, resetExportSelections]);

  const themeStyles = getThemeStyles(currentTheme);
  const contentPadding = `calc(var(--theme-padding) - ${CONTENT_PADDING_TOP_BOTTOM_REDUCTION}px) calc(var(--theme-padding) - ${CONTENT_PADDING_LEFT_RIGHT_REDUCTION}px)`;

  return (
    <div className="flex flex-col h-screen bg-neutral-100 overflow-hidden text-slate-800">
      <DraftTopBar
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

      <main className="flex-1 flex overflow-hidden">
        <DraftEditorPane
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          textareaRef={textareaRef}
          markdown={markdown}
          setMarkdown={setMarkdown}
          coverSettings={coverSettings}
          setCoverSettings={setCoverSettings}
          onImportClick={() => setIsImportModalOpen(true)}
          onNewClick={handleCreateNewDocument}
        />

        <DraftPreviewPane
          cardWidth={CARD_WIDTH}
          cardHeight={CARD_HEIGHT}
          coverSettings={coverSettings}
          currentTheme={currentTheme}
          pages={pages}
          blocks={blocks}
          selectedExportIds={selectedExportIds}
          toggleExportSelection={toggleExportSelection}
          isExporting={isExporting}
          measureRef={measureRef}
          exportContainerRef={exportContainerRef}
          themeStyles={themeStyles}
          contentPadding={contentPadding}
        />

        <ThemeSidebar currentTheme={currentTheme} onSelect={setCurrentTheme} />
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
