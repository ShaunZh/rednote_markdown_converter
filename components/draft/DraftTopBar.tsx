import Link from 'next/link';
import { Download } from 'lucide-react';

interface DraftTopBarProps {
  isExporting: boolean;
  exportProgress: { done: number; total: number } | null;
  isExportModalOpen: boolean;
  exportTargetCount: number;
  selectedExportCount: number;
  onSelectAll: () => void;
  onClearAll: () => void;
  onOpenExportModal: () => void;
  onExport: () => void;
}

export function DraftTopBar({
  isExporting,
  exportProgress,
  isExportModalOpen,
  exportTargetCount,
  selectedExportCount,
  onSelectAll,
  onClearAll,
  onOpenExportModal,
  onExport,
}: DraftTopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
      <Link href="/" className="flex items-center gap-2 hover:opacity-90">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
          R
        </div>
        <h1 className="font-bold text-xl tracking-tight hidden sm:block">小红书 Markdown 转图器</h1>
      </Link>

      <div className="flex items-center gap-3">
        {!isExporting && exportTargetCount > 0 && (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
            <span className="tabular-nums">已选 {selectedExportCount}/{exportTargetCount}</span>
            <button
              type="button"
              onClick={onSelectAll}
              className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
            >
              全选
            </button>
            <button
              type="button"
              onClick={onClearAll}
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
            onClick={onOpenExportModal}
            className="hidden sm:inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
          >
            查看导出进度
          </button>
        )}

        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transform active:scale-95"
        >
          {isExporting ? (
            <span>{exportProgress ? `导出中 ${exportProgress.done}/${exportProgress.total}...` : '正在准备...'}</span>
          ) : (
            <>
              <Download size={18} />
              <span>导出图片</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
