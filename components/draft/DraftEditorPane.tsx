import React from 'react';
import { Layout, PenTool } from 'lucide-react';

import type { CoverSettings } from '../CoverCard';
import { EditorHeader } from '../EditorHeader';
import { EditorToolbar } from '../EditorToolbar';
import { cn } from '../../lib/utils';

interface DraftEditorPaneProps {
  activeTab: 'editor' | 'cover';
  setActiveTab: React.Dispatch<React.SetStateAction<'editor' | 'cover'>>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  markdown: string;
  setMarkdown: (value: string) => void;
  coverSettings: CoverSettings;
  setCoverSettings: React.Dispatch<React.SetStateAction<CoverSettings>>;
  onImportClick: () => void;
  onNewClick: () => void;
}

export function DraftEditorPane({
  activeTab,
  setActiveTab,
  textareaRef,
  markdown,
  setMarkdown,
  coverSettings,
  setCoverSettings,
  onImportClick,
  onNewClick,
}: DraftEditorPaneProps) {
  return (
    <div className="flex-1 min-w-[350px] border-r border-neutral-200 bg-white flex flex-col shrink-0 relative z-30">
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('editor')}
          className={cn(
            'flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors',
            activeTab === 'editor'
              ? 'border-red-500 text-red-600 bg-red-50/50'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          )}
        >
          <PenTool size={16} /> 编辑
        </button>
        <button
          onClick={() => setActiveTab('cover')}
          className={cn(
            'flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors',
            activeTab === 'cover'
              ? 'border-red-500 text-red-600 bg-red-50/50'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          )}
        >
          <Layout size={16} /> 封面
        </button>
      </div>

      {activeTab === 'editor' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <EditorHeader onImportClick={onImportClick} onNewClick={onNewClick} />
          <EditorToolbar textareaRef={textareaRef} setMarkdown={setMarkdown} />
          <textarea
            ref={textareaRef}
            className="flex-1 w-full p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed text-slate-700 bg-slate-50/30"
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            placeholder="在这里输入 Markdown 内容..."
            spellCheck={false}
          />
        </div>
      )}

      {activeTab === 'cover' && (
        <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto bg-neutral-50/50">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <span className="font-medium text-slate-700 text-sm">启用封面页</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={coverSettings.enabled}
                onChange={(event) => setCoverSettings((prev) => ({ ...prev, enabled: event.target.checked }))}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
            </label>
          </div>

          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <span className="font-medium text-slate-700 text-sm">显示页码</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={coverSettings.showPageNumber}
                onChange={(event) => setCoverSettings((prev) => ({ ...prev, showPageNumber: event.target.checked }))}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
            </label>
          </div>

          {coverSettings.enabled && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">标题</label>
                  <input
                    type="text"
                    value={coverSettings.title}
                    onChange={(event) => setCoverSettings((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                    placeholder="输入主标题"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">副标题</label>
                  <textarea
                    rows={2}
                    value={coverSettings.subtitle}
                    onChange={(event) => setCoverSettings((prev) => ({ ...prev, subtitle: event.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm resize-none"
                    placeholder="输入副标题或说明"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">作者名称</label>
                  <input
                    type="text"
                    value={coverSettings.author}
                    onChange={(event) => setCoverSettings((prev) => ({ ...prev, author: event.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                    placeholder="@你的昵称"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">封面布局</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['simple', 'modern', 'outline'] as const).map((variant) => (
                    <button
                      key={variant}
                      onClick={() => setCoverSettings((prev) => ({ ...prev, variant }))}
                      className={cn(
                        'py-2 px-1 rounded-lg border-2 text-xs font-medium capitalize transition-all',
                        coverSettings.variant === variant
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {variant === 'simple' ? '简约' : variant === 'modern' ? '现代' : '描边'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
