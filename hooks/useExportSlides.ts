import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';

import FileSaver from 'file-saver';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';

const CARD_WIDTH = 405;
const EXPORT_TARGET_WIDTH = 1080;
const EXPORT_SCALE = EXPORT_TARGET_WIDTH / CARD_WIDTH;
const EXPORT_TIMEOUT_MS = 25000;

export type ExportStatus = 'idle' | 'running' | 'canceling' | 'completed' | 'canceled' | 'error';

interface UseExportSlidesProps {
  exportContainerRef: RefObject<HTMLDivElement>;
  includeCover: boolean;
  pageCount: number;
}

export function useExportSlides({
  exportContainerRef,
  includeCover,
  pageCount,
}: UseExportSlidesProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ done: number; total: number } | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportNotice, setExportNotice] = useState('');
  const [failedPages, setFailedPages] = useState<number[]>([]);
  const [excludedExportIds, setExcludedExportIds] = useState<string[]>([]);

  const cancelExportRef = useRef(false);

  const exportTargetIds = useMemo(() => {
    const ids: string[] = [];
    if (includeCover) {
      ids.push('cover');
    }
    for (let index = 0; index < pageCount; index += 1) {
      ids.push(`page-${index}`);
    }
    return ids;
  }, [includeCover, pageCount]);

  useEffect(() => {
    setExcludedExportIds((prev) => prev.filter((id) => exportTargetIds.includes(id)));
  }, [exportTargetIds]);

  const selectedExportIds = useMemo(() => {
    const excluded = new Set(excludedExportIds);
    return exportTargetIds.filter((id) => !excluded.has(id));
  }, [excludedExportIds, exportTargetIds]);

  const toggleExportSelection = useCallback((id: string) => {
    setExcludedExportIds((prev) => (
      prev.includes(id) ? prev.filter((candidate) => candidate !== id) : [...prev, id]
    ));
  }, []);

  const selectAllExportTargets = useCallback(() => setExcludedExportIds([]), []);
  const clearAllExportTargets = useCallback(() => setExcludedExportIds(exportTargetIds), [exportTargetIds]);
  const resetExportSelections = useCallback(() => setExcludedExportIds([]), []);

  const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string) =>
    new Promise<T>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        reject(new Error(`${label} 超时`));
      }, ms);

      promise
        .then((value) => {
          window.clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          window.clearTimeout(timer);
          reject(error);
        });
    });

  const requestCancelExport = useCallback(() => {
    if (!isExporting) {
      return;
    }
    cancelExportRef.current = true;
    setExportStatus('canceling');
    setExportNotice('正在取消，当前图片处理完成后将停止。');
  }, [isExporting]);

  const closeExportModal = useCallback(() => {
    if (isExporting) {
      setIsExportModalOpen(false);
      return;
    }
    setIsExportModalOpen(false);
    setExportStatus('idle');
    setExportProgress(null);
    setExportNotice('');
    setFailedPages([]);
  }, [isExporting]);

  const handleExport = useCallback(async () => {
    if (isExporting) {
      return;
    }

    const exportContainer = exportContainerRef.current;
    if (!exportContainer) {
      return;
    }

    const selectedSet = new Set(selectedExportIds);
    const pageElements = Array.from(
      exportContainer.querySelectorAll<HTMLElement>('.export-card')
    ).filter((element) => {
      const id = element.dataset.exportId;
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

      for (let index = 0; index < pageElements.length; index += 1) {
        if (cancelExportRef.current) {
          break;
        }

        const element = pageElements[index];
        try {
          const dataUrl = await withTimeout(
            toPng(element, {
              pixelRatio: EXPORT_SCALE,
              cacheBust: true,
              skipAutoScale: true,
            }),
            EXPORT_TIMEOUT_MS,
            `第 ${index + 1} 张图片导出`
          );
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          const fileName = `slide-${String(index).padStart(2, '0')}.png`;
          zip.file(fileName, base64Data, { base64: true });
          successCount += 1;
          setExportProgress({ done: successCount, total });
        } catch (error) {
          console.error(`Export page ${index + 1} failed`, error);
          failedIndexes.push(index + 1);
        }

        await yieldToMain();
      }

      const wasCanceled = cancelExportRef.current;
      if (successCount > 0) {
        const content = await zip.generateAsync({ type: 'blob' });
        const zipName = wasCanceled ? 'rednote-slides-partial.zip' : 'rednote-slides.zip';
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
    } catch (error) {
      console.error('Export failed', error);
      setExportStatus('error');
      setExportNotice('导出出现异常，请重试或降低内容复杂度后再导出。');
    } finally {
      setIsExporting(false);
      cancelExportRef.current = false;
    }
  }, [exportContainerRef, isExporting, selectedExportIds]);

  return {
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
  };
}
