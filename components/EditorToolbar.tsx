import React, { useRef, useState } from 'react';
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
  Image,
  Loader2,
  BookOpenText,
  FileText,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { RICH_TEXT_TEMPLATE } from '../lib/richTextTemplate';

interface EditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  setMarkdown: (value: string) => void;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  textareaRef,
  setMarkdown,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyntaxModalOpen, setIsSyntaxModalOpen] = useState(false);
  const [isTemplateConfirmOpen, setIsTemplateConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleImageInsert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      alert('Cloudinary 配置缺失，请检查 .env.local 中的 NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME 和 NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
      return;
    }

    setIsUploading(true);
    try {
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
      // Insert Cloudinary transformation: scale to 700px wide (2× card width for retina)
      const imageUrl: string = data.secure_url.replace(
        '/upload/',
        '/upload/w_700,c_scale/'
      );
      const altText = file.name.replace(/\.[^.]+$/, '');
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
    } catch (err: any) {
      alert(`图片上传失败：${err.message}`);
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

  const handleUseTemplate = () => {
    setMarkdown(RICH_TEXT_TEMPLATE);
    setIsTemplateConfirmOpen(false);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(0, 0);
    });
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
        <div className="w-px h-4 bg-neutral-300 mx-1" />
        <ToolbarButton
          icon={isUploading ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
          onClick={() => !isUploading && imageInputRef.current?.click()}
          label={isUploading ? '上传中...' : 'Insert Image'}
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
          icon={<FileText size={16} />}
          onClick={() => setIsTemplateConfirmOpen(true)}
          label="填充富文本模板"
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

      {isTemplateConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setIsTemplateConfirmOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 className="text-base font-semibold text-slate-800">使用富文本模板</h3>
              <button
                type="button"
                onClick={() => setIsTemplateConfirmOpen(false)}
                className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-neutral-100 transition-colors"
                title="关闭"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-slate-600 leading-6">
              将使用富文本模板填充编辑区。此操作会覆盖当前内容，是否继续？
            </div>
            <div className="px-5 pb-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsTemplateConfirmOpen(false)}
                className="px-3 py-1.5 text-sm rounded-lg border border-neutral-300 text-slate-600 hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleUseTemplate}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                确认填充
              </button>
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
