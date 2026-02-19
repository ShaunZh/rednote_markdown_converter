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
} from 'lucide-react';

interface EditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  markdown: string;
  setMarkdown: (value: string) => void;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  textareaRef,
  markdown,
  setMarkdown,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    </div>
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