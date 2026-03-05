import React from 'react';
import { Import, Plus } from 'lucide-react';

interface EditorHeaderProps {
  onImportClick: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ onImportClick }) => {
  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 bg-white shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          内容来源
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button 
           onClick={onImportClick}
           className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-md transition-colors"
        >
           <Import size={14} />
           <span>导入</span>
        </button>
        
        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors" title="新建草稿">
           <Plus size={16} />
        </button>
      </div>
    </div>
  );
};
