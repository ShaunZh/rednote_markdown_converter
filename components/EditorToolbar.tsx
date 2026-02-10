import React from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  CheckSquare,
  Code,
  Quote,
  Minus,
} from 'lucide-react';

interface EditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  markdown: string;
  setMarkdown: (value: string) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  textareaRef,
  markdown,
  setMarkdown,
}) => {
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;

    const selectedText = previousText.substring(start, end);
    const newText =
      previousText.substring(0, start) +
      before +
      selectedText +
      after +
      previousText.substring(end);

    setMarkdown(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    });
  };

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;

    const beforeCursor = previousText.substring(0, start);
    const lastNewLine = beforeCursor.lastIndexOf('\n');
    const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;

    const newText =
      previousText.substring(0, lineStart) +
      prefix +
      previousText.substring(lineStart);

    setMarkdown(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    });
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50 overflow-x-auto no-scrollbar shrink-0">
      <ToolbarButton
        icon={<Bold size={16} />}
        onClick={() => insertText('**', '**')}
        label="Bold"
      />
      <ToolbarButton
        icon={<Italic size={16} />}
        onClick={() => insertText('*', '*')}
        label="Italic"
      />
      <div className="w-px h-4 bg-neutral-300 mx-1" />
      <ToolbarButton
        icon={<Heading2 size={16} />}
        onClick={() => insertAtLineStart('## ')}
        label="Heading 2"
      />
      <ToolbarButton
        icon={<Heading3 size={16} />}
        onClick={() => insertAtLineStart('### ')}
        label="Heading 3"
      />
      <div className="w-px h-4 bg-neutral-300 mx-1" />
      <ToolbarButton
        icon={<List size={16} />}
        onClick={() => insertAtLineStart('- ')}
        label="Bullet List"
      />
      <ToolbarButton
        icon={<CheckSquare size={16} />}
        onClick={() => insertAtLineStart('- [ ] ')}
        label="Check List"
      />
      <div className="w-px h-4 bg-neutral-300 mx-1" />
      <ToolbarButton
        icon={<Quote size={16} />}
        onClick={() => insertAtLineStart('> ')}
        label="Quote"
      />
      <ToolbarButton
        icon={<Code size={16} />}
        onClick={() => insertText('```\n', '\n```')}
        label="Code Block"
      />
      <ToolbarButton
        icon={<Minus size={16} />}
        onClick={() => insertText('\n---\n')}
        label="Divider"
      />
    </div>
  );
};

const ToolbarButton = ({
  icon,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-neutral-200 rounded transition-colors"
    title={label}
    type="button"
  >
    {icon}
  </button>
);