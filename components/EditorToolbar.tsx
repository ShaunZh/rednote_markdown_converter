import React, { useEffect, useRef, useState } from 'react';
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
  Image as ImageIcon,
  Loader2,
  BookOpenText,
  Copy,
  Check,
  X,
  Scissors,
  Undo2,
  Redo2,
} from 'lucide-react';

import {
  getStoredImageUploadMode,
  setStoredImageUploadMode,
  type ImageUploadMode,
} from '../lib/imageUploadMode';
import {
  createLocalImageMarkdownSrc,
  saveLocalImage,
} from '../lib/localImageStore';
import { RICH_TEXT_TEMPLATE } from '../lib/richTextTemplate';

interface EditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setMarkdown: (value: string) => void;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  textareaRef,
  setMarkdown,
}) => {
  const PAGE_BREAK_MARKER = '<!-- pagebreak -->';
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyntaxModalOpen, setIsSyntaxModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<ImageUploadMode>('local');
  const cloudinaryEnabled = Boolean(CLOUD_NAME && UPLOAD_PRESET);

  useEffect(() => {
    const storedMode = getStoredImageUploadMode();
    setImageUploadMode(cloudinaryEnabled && storedMode === 'cloudinary' ? 'cloudinary' : 'local');
  }, [cloudinaryEnabled]);

  const updateImageUploadMode = (mode: ImageUploadMode) => {
    const nextMode = mode === 'cloudinary' && !cloudinaryEnabled ? 'local' : mode;
    setImageUploadMode(nextMode);
    setStoredImageUploadMode(nextMode);
  };

  const insertImageMarkdown = (imageUrl: string, altText: string) => {
    const imageMarkdown = `![${altText}](${imageUrl})`;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prev = textarea.value;
    const newText = prev.substring(0, start) + imageMarkdown + prev.substring(end);
    setMarkdown(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + imageMarkdown.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleImageInsert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsUploading(true);
    try {
      const altText = file.name.replace(/\.[^.]+$/, '');

      if (imageUploadMode === 'local') {
        const localImageId = await saveLocalImage(file);
        insertImageMarkdown(createLocalImageMarkdownSrc(localImageId), altText);
      } else {
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
          throw new Error('Cloudinary 配置缺失，请检查 .env.local');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || '上传失败');
        }

        const data = await res.json();
        const imageUrl: string = data.secure_url.replace(
          '/upload/',
          '/upload/w_700,c_scale/'
        );
        insertImageMarkdown(imageUrl, altText);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '图片上传失败';
      alert(`图片上传失败：${message}`);
    } finally {
      setIsUploading(false);
    }
  };

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

  const insertPageBreakAtCursor = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const before = previousText.substring(0, start);
    const after = previousText.substring(end);

    const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');
    const needsTrailingNewline = after.length > 0 && !after.startsWith('\n');
    const insertion = `${needsLeadingNewline ? '\n' : ''}${PAGE_BREAK_MARKER}${needsTrailingNewline ? '\n' : ''}`;

    const newText = before + insertion + after;
    setMarkdown(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = before.length + insertion.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const triggerHistoryAction = (action: 'undo' | 'redo') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();
    try {
      document.execCommand(action);
    } catch {
      // Ignore unsupported browsers silently.
    }
  };

  const handleCopySyntax = async () => {
    try {
      await navigator.clipboard.writeText(RICH_TEXT_TEMPLATE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      alert('复制失败，请手动复制。');
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50 overflow-x-auto no-scrollbar shrink-0">
        <ToolbarButton
          icon={<Undo2 size={16} />}
          onClick={() => triggerHistoryAction('undo')}
          label="撤销"
        />
        <ToolbarButton
          icon={<Redo2 size={16} />}
          onClick={() => triggerHistoryAction('redo')}
          label="重做"
        />
        <div className="w-px h-4 bg-neutral-300 mx-1" />
        <ToolbarButton
          icon={<Bold size={16} />}
          onClick={() => insertText('**', '**')}
          label="加粗"
        />
        <ToolbarButton
          icon={<Italic size={16} />}
          onClick={() => insertText('*', '*')}
          label="斜体"
        />
        <div className="w-px h-4 bg-neutral-300 mx-1" />
        <ToolbarButton
          icon={<Heading2 size={16} />}
          onClick={() => insertAtLineStart('## ')}
          label="二级标题"
        />
        <ToolbarButton
          icon={<Heading3 size={16} />}
          onClick={() => insertAtLineStart('### ')}
          label="三级标题"
        />
        <div className="w-px h-4 bg-neutral-300 mx-1" />
        <ToolbarButton
          icon={<List size={16} />}
          onClick={() => insertAtLineStart('- ')}
          label="无序列表"
        />
        <ToolbarButton
          icon={<CheckSquare size={16} />}
          onClick={() => insertAtLineStart('- [ ] ')}
          label="任务清单"
        />
        <div className="w-px h-4 bg-neutral-300 mx-1" />
        <ToolbarButton
          icon={<Quote size={16} />}
          onClick={() => insertAtLineStart('> ')}
          label="引用"
        />
        <ToolbarButton
          icon={<Code size={16} />}
          onClick={() => insertText('```\n', '\n```')}
          label="代码块"
        />
        <ToolbarButton
          icon={<Minus size={16} />}
          onClick={() => insertText('\n---\n')}
          label="分割线"
        />
        <ToolbarButton
          icon={<Scissors size={16} />}
          onClick={insertPageBreakAtCursor}
          label="手动分页"
        />
        <div className="w-px h-4 bg-neutral-300 mx-1" />
        <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => updateImageUploadMode('local')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              imageUploadMode === 'local'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-neutral-100'
            }`}
          >
            本地
          </button>
          <button
            type="button"
            onClick={() => updateImageUploadMode('cloudinary')}
            disabled={!cloudinaryEnabled}
            title={cloudinaryEnabled ? '上传到 Cloudinary' : '当前未配置 Cloudinary'}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              imageUploadMode === 'cloudinary'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-neutral-100'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            云端
          </button>
        </div>
        <ToolbarButton
          icon={isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          onClick={() => !isUploading && imageInputRef.current?.click()}
          label={isUploading ? '上传中...' : imageUploadMode === 'local' ? '插入本地图片' : '插入云端图片'}
          disabled={isUploading}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageInsert}
        />
        <div className="w-px h-4 bg-neutral-300 mx-1" />
        <ToolbarButton
          icon={<BookOpenText size={16} />}
          onClick={() => setIsSyntaxModalOpen(true)}
          label="语法示例"
        />
      </div>

      {isSyntaxModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setIsSyntaxModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 className="text-base font-semibold text-slate-800">富文本语法示例</h3>
              <button
                type="button"
                onClick={() => setIsSyntaxModalOpen(false)}
                className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-neutral-100 transition-colors"
                title="关闭"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs text-slate-500">复制下面语法到编辑区即可看到对应样式：</div>
                <button
                  type="button"
                  onClick={handleCopySyntax}
                  className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-neutral-100 transition-colors"
                  title={copied ? '已复制' : '复制示例'}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <pre className="text-xs leading-6 text-slate-700 bg-neutral-50 border border-neutral-200 rounded-xl p-4 overflow-x-auto">
{RICH_TEXT_TEMPLATE}
              </pre>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

const ToolbarButton = ({
  icon,
  onClick,
  label,
  disabled = false,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`p-1.5 rounded transition-colors ${disabled
      ? 'text-slate-400 cursor-not-allowed'
      : 'text-slate-600 hover:text-slate-900 hover:bg-neutral-200'
      }`}
    title={label}
    type="button"
    disabled={disabled}
  >
    {icon}
  </button>
);
