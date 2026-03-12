import React from 'react';

import { CoverCard, type CoverSettings } from '../CoverCard';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { IPhoneHeader } from '../ThemeHeaders';
import type { Block } from '../../hooks/useSmartPagination';
import type { AppearanceSettings } from '../../lib/appearanceSettings';
import type { ThemeConfig } from '../../lib/themeConfig';

interface DraftPreviewPaneProps {
  cardWidth: number;
  cardHeight: number;
  coverSettings: CoverSettings;
  showPageNumber: boolean;
  appearanceSettings: AppearanceSettings;
  currentTheme: ThemeConfig;
  pages: Block[][];
  blocks: Block[];
  selectedExportIds: string[];
  toggleExportSelection: (id: string) => void;
  isExporting: boolean;
  shouldRenderExportContainer: boolean;
  measureRef: React.RefObject<HTMLDivElement>;
  exportContainerRef: React.RefObject<HTMLDivElement>;
  themeStyles: React.CSSProperties;
  contentPadding: string;
}

const PageCard = React.memo(function PageCard({
  exportId,
  width,
  height,
  currentTheme,
  pageContent,
  pageIndex,
  totalPages,
  appearanceSettings,
  selectedExportIds,
  toggleExportSelection,
  isExporting,
  showPageNumber,
  themeStyles,
  contentPadding,
}: {
  exportId?: string;
  width: number;
  height: number;
  currentTheme: ThemeConfig;
  pageContent: Block[];
  pageIndex: number;
  totalPages: number;
  appearanceSettings: AppearanceSettings;
  selectedExportIds?: string[];
  toggleExportSelection?: (id: string) => void;
  isExporting?: boolean;
  showPageNumber: boolean;
  themeStyles: React.CSSProperties;
  contentPadding: string;
}) {
  return (
    <div
      className="shrink-0 relative overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...themeStyles,
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
        {exportId && selectedExportIds && toggleExportSelection && (
          <label className="absolute top-1 right-1 z-20 inline-flex items-center gap-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-slate-700 shadow-sm cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-slate-800"
              checked={selectedExportIds.includes(exportId)}
              onChange={() => toggleExportSelection(exportId)}
              disabled={isExporting}
            />
            第 {pageIndex + 1} 页
          </label>
        )}

        {currentTheme.container.headerStyle === 'iphone' && <IPhoneHeader />}

        <div className="flex-1">
          {pageContent.map((block) => (
            <MarkdownRenderer
              key={block.id}
              content={block.content}
              theme={currentTheme}
              appearanceSettings={appearanceSettings}
            />
          ))}
        </div>

        {showPageNumber && (
          <div className="mt-auto pt-0.5 opacity-40 text-[9px] leading-none font-sans">
            <span>{pageIndex + 1} / {totalPages}</span>
          </div>
        )}
      </div>
    </div>
  );
});

PageCard.displayName = 'PageCard';

function DraftPreviewPaneComponent({
  cardWidth,
  cardHeight,
  coverSettings,
  showPageNumber,
  appearanceSettings,
  currentTheme,
  pages,
  blocks,
  selectedExportIds,
  toggleExportSelection,
  isExporting,
  shouldRenderExportContainer,
  measureRef,
  exportContainerRef,
  themeStyles,
  contentPadding,
}: DraftPreviewPaneProps) {
  return (
    <>
      <div className="w-[540px] bg-neutral-100/50 overflow-y-auto p-8 relative flex flex-col items-center gap-8 shadow-inner">
        {coverSettings.enabled && (
          <div className="relative">
            <CoverCard
              settings={coverSettings}
              theme={currentTheme}
              width={cardWidth}
              height={cardHeight}
              appearanceSettings={appearanceSettings}
            />
            <label className="absolute top-1 right-1 z-20 inline-flex items-center gap-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-slate-700 shadow-sm cursor-pointer select-none">
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

        {pages.map((pageContent, index) => (
          <div
            key={index}
            id={`page-${index}`}
            className="preview-card shrink-0 relative shadow-2xl transition-transform hover:scale-[1.01] duration-300 ease-out origin-center overflow-hidden"
          >
            <PageCard
              exportId={`page-${index}`}
              width={cardWidth}
              height={cardHeight}
              currentTheme={currentTheme}
              pageContent={pageContent}
              pageIndex={index}
              totalPages={pages.length}
              appearanceSettings={appearanceSettings}
              selectedExportIds={selectedExportIds}
              toggleExportSelection={toggleExportSelection}
              isExporting={isExporting}
              showPageNumber={showPageNumber}
              themeStyles={themeStyles}
              contentPadding={contentPadding}
            />
          </div>
        ))}

        <div className="h-20" />
      </div>

      <div
        ref={measureRef}
        className="fixed top-0 -left-[9999px] -z-50 opacity-0 pointer-events-none"
        aria-hidden="true"
        style={{
          width: `${cardWidth}px`,
          ...themeStyles,
          fontFamily: 'var(--theme-font)',
          padding: contentPadding,
        }}
      >
        {blocks.map((block) => (
          <MarkdownRenderer
            key={block.id}
            content={block.content}
            theme={currentTheme}
            appearanceSettings={appearanceSettings}
          />
        ))}
      </div>

      {shouldRenderExportContainer && (
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
              width={cardWidth}
              height={cardHeight}
              appearanceSettings={appearanceSettings}
            />
          </div>
        )}

          {pages.map((pageContent, index) => (
            <div key={`export-page-${index}`} className="export-card" data-export-id={`page-${index}`}>
              <PageCard
                width={cardWidth}
                height={cardHeight}
                currentTheme={currentTheme}
                pageContent={pageContent}
                pageIndex={index}
                totalPages={pages.length}
                appearanceSettings={appearanceSettings}
                showPageNumber={showPageNumber}
                themeStyles={themeStyles}
                contentPadding={contentPadding}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export const DraftPreviewPane = React.memo(DraftPreviewPaneComponent);

DraftPreviewPane.displayName = 'DraftPreviewPane';
