import React from 'react';
import { X } from 'lucide-react';

import type { ExportStatus } from '../../hooks/useExportSlides';

interface ExportProgressModalProps {
  isOpen: boolean;
  isExporting: boolean;
  exportStatus: ExportStatus;
  exportProgress: { done: number; total: number } | null;
  failedPages: number[];
  exportNotice: string;
  onClose: () => void;
  onHide: () => void;
  onCancel: () => void;
}

export function ExportProgressModal({
  isOpen,
  isExporting,
  exportStatus,
  exportProgress,
  failedPages,
  exportNotice,
  onClose,
  onHide,
  onCancel,
}: ExportProgressModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/45 p-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h3 className="text-base font-semibold text-slate-800">导出图片</h3>
          {!isExporting && (
            <button
              type="button"
              onClick={onClose}
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
                onClick={onHide}
                className="px-3 py-1.5 text-sm rounded-lg border border-neutral-300 text-slate-600 hover:bg-neutral-100 transition-colors"
              >
                后台继续
              </button>
              <button
                type="button"
                onClick={onCancel}
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
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              关闭
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
