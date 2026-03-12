import React from 'react';

import { EditorHeader } from '../EditorHeader';
import { EditorToolbar } from '../EditorToolbar';

interface DraftEditorPaneProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  markdown: string;
  setMarkdown: (value: string) => void;
  onImportClick: () => void;
  onNewClick: () => void;
}

export function DraftEditorPane({
  textareaRef,
  markdown,
  setMarkdown,
  onImportClick,
  onNewClick,
}: DraftEditorPaneProps) {
  return (
    <div className="flex-1 min-w-[350px] border-r border-neutral-200 bg-white flex flex-col shrink-0 relative z-30">
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
    </div>
  );
}
