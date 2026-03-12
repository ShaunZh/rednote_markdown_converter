import React from 'react';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { LocalMarkdownImage } from './LocalMarkdownImage';
import type { AppearanceSettings } from '../lib/appearanceSettings';
import { isLocalImageMarkdownSrc, type LocalImageRenderMode } from '../lib/localImageStore';
import { type ThemeConfig } from '../lib/themeConfig';
import { cn } from '../lib/utils';

interface MarkdownRendererProps {
  content: string;
  theme: ThemeConfig;
  appearanceSettings?: AppearanceSettings;
  imageRenderMode?: LocalImageRenderMode;
}

const MacWindowHeader = () => (
  <div className="flex gap-1.5 mb-2 px-1 opacity-80">
    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
  </div>
);

const MarkdownRendererComponent: React.FC<MarkdownRendererProps> = ({
  content,
  theme,
  appearanceSettings,
  imageRenderMode = 'blob-url',
}) => {
  const defaultBodyFontSize = Number.parseFloat(theme.typography.baseFontSize || '16');
  const bodyFontSize = appearanceSettings?.bodyFontSize ?? (Number.isFinite(defaultBodyFontSize) ? defaultBodyFontSize : 16);
  const headingScale = appearanceSettings?.headingScale ?? 1;
  const baseLineHeight = Number.parseFloat(theme.typography.lineHeight || '1.6');
  const contentLineHeight = Math.min(2.1, Number.isFinite(baseLineHeight) ? baseLineHeight + 0.06 : 1.66);
  const paragraphFontSize = Math.max(12, bodyFontSize - 1);
  const listFontSize = Math.max(12, bodyFontSize - 0.5);
  const codeFontSize = Math.max(12, bodyFontSize - 2);
  const h1Size = Math.max(20, bodyFontSize * 1.42 * headingScale);
  const h2Size = Math.max(18, bodyFontSize * 1.18 * headingScale);
  const h3Size = Math.max(16, bodyFontSize * 1.06 * headingScale);

  // Use CSS variables for everything to ensure dynamic theming
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\S+)/.exec(className || '');
      const fullLang = match ? match[1] : '';
      const language = fullLang.split(':')[0]; // Detect "js:no-header"
      const hideHeader = fullLang.includes(':no-header');

      const isMacStyle = theme.components.codeBlock.style === 'mac';
      const isDarkTheme = theme.id === 'geek'; // Helper for SyntaxHighlighter specific theme

      if (!inline && match) {
        return (
          <div
            className="rounded-lg overflow-hidden my-3 shadow-sm border border-[var(--theme-border)]"
            style={{ backgroundColor: 'var(--code-bg)', fontSize: `${codeFontSize}px` }}
          >
            {(isMacStyle || isDarkTheme) && !hideHeader && (
              <div className="px-3 py-2 border-b border-black/5 bg-black/5">
                <MacWindowHeader />
              </div>
            )}
            <div className="p-1">
              <SyntaxHighlighter
                style={isDarkTheme ? oneDark : oneLight}
                language={language}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  background: 'transparent',
                  fontSize: 'inherit',
                  lineHeight: 'inherit'
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }
      return (
        <code
          className="px-1.5 py-0.5 rounded font-mono mx-0.5"
          style={{
            backgroundColor: 'var(--code-bg)',
            color: 'var(--code-text)',
            border: theme.id === 'minimal' ? '1px solid #e2e8f0' : 'none',
            fontSize: `${Math.max(11, paragraphFontSize * 0.92)}px`,
          }}
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ node, ...props }: any) => (
      <h1
        className="font-bold mb-2 mt-1"
        style={{ color: 'var(--theme-title-color)', fontSize: `${h1Size}px`, lineHeight: 1.12 }}
        {...props}
      />
    ),
    h2: ({ node, ...props }: any) => (
      <h2
        className={cn(
          "font-bold mb-2 mt-2.5",
          theme.id === 'minimal' && "pb-2 border-b border-slate-200",
          theme.id === 'geek' && "border-l-4 pl-3 border-[var(--theme-accent)]"
        )}
        style={{ color: 'var(--theme-title-color)', fontSize: `${h2Size}px`, lineHeight: 1.18 }}
        {...props}
      />
    ),
    h3: ({ node, ...props }: any) => (
      <h3
        className="font-bold mb-1.5 mt-2"
        style={{ color: 'var(--theme-title-color)', fontSize: `${h3Size}px`, lineHeight: 1.22 }}
        {...props}
      />
    ),
    p: ({ node, ...props }: any) => (
      <p
        className="mb-3"
        style={{
          color: 'var(--theme-text-color)',
          lineHeight: contentLineHeight,
          fontSize: `${paragraphFontSize}px`,
        }}
        {...props}
      />
    ),
    ul: ({ node, className, ...props }: any) => {
      const isTaskList = typeof className === 'string' && className.includes('contains-task-list');
      return (
        <ul
          className={cn(
            isTaskList
              ? "list-disc pl-[18px] mb-2.5 space-y-1"
              : "list-disc pl-[18px] mb-2.5 space-y-0.5 marker:text-[var(--theme-accent)]",
            className
          )}
          style={{ fontSize: `${listFontSize}px` }}
          {...props}
        />
      );
    },
    ol: ({ node, className, ...props }: any) => (
      <ol
        className={cn("list-decimal pl-[18px] mb-2.5 space-y-0.5 marker:text-[var(--theme-accent)]", className)}
        style={{ fontSize: `${listFontSize}px` }}
        {...props}
      />
    ),
    li: ({ node, className, ...props }: any) => (
      <li
        className={cn(
          "pl-1",
          typeof className === 'string' && className.includes('task-list-item') && "pl-0",
          className
        )}
        style={{
          color: 'var(--theme-text-color)',
          lineHeight: contentLineHeight,
          fontSize: `${listFontSize}px`,
        }}
        {...props}
      />
    ),
    input: ({ node, type, className, ...props }: any) => {
      if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            className={cn("mr-2 align-[-1px]", className)}
            disabled
            {...props}
            readOnly
          />
        );
      }
      return <input type={type} className={className} {...props} />;
    },
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className={cn(
          "pl-3.5 py-2 my-2.5 italic opacity-90 relative",
          theme.components.blockquote.style === 'card' && "rounded-lg pr-4 shadow-sm",
          theme.components.blockquote.style === 'bar' && "border-l-4"
        )}
        style={{
          backgroundColor: 'var(--quote-bg)',
          borderColor: 'var(--quote-accent)',
          color: 'var(--theme-text-color)',
          fontSize: `${Math.max(12, bodyFontSize - 1)}px`,
          lineHeight: contentLineHeight,
        }}
        {...props}
      />
    ),
    img: ({ node, src, alt, className, ...props }: any) => (
      <LocalMarkdownImage
        src={typeof src === 'string' ? src : ''}
        alt={alt || ''}
        renderMode={imageRenderMode}
        className={cn('rounded-lg my-2.5 w-full object-cover shadow-sm', className)}
        {...props}
      />
    ),
    a: ({ node, ...props }: any) => (
      <a
        className="underline underline-offset-2 decoration-2 font-medium"
        style={{ color: 'var(--theme-accent)', textDecorationColor: 'var(--theme-accent)' }}
        {...props}
      />
    ),
    hr: ({ node, ...props }: any) => (
      <hr className="my-3 border-t-2 opacity-20" style={{ borderColor: 'var(--theme-text-color)' }} {...props} />
    ),
    table: ({ node, className, ...props }: any) => (
      <div className="my-3 overflow-x-auto">
        <table
          className={cn("w-full border-collapse", className)}
          style={{ border: '1px solid var(--theme-border)', fontSize: `${Math.max(12, bodyFontSize * 0.95)}px` }}
          {...props}
        />
      </div>
    ),
    thead: ({ node, className, ...props }: any) => (
      <thead
        className={cn("bg-black/[0.03]", className)}
        style={{ borderBottom: '1px solid var(--theme-border)' }}
        {...props}
      />
    ),
    tbody: ({ node, className, ...props }: any) => (
      <tbody className={cn(className)} {...props} />
    ),
    tr: ({ node, className, ...props }: any) => (
      <tr
        className={cn(className)}
        style={{ borderBottom: '1px solid var(--theme-border)' }}
        {...props}
      />
    ),
    th: ({ node, className, ...props }: any) => (
      <th
        className={cn("px-3 py-2 text-left font-semibold", className)}
        style={{ borderRight: '1px solid var(--theme-border)', color: 'var(--theme-title-color)' }}
        {...props}
      />
    ),
    td: ({ node, className, ...props }: any) => (
      <td
        className={cn("px-3 py-2 align-top", className)}
        style={{ borderRight: '1px solid var(--theme-border)', color: 'var(--theme-text-color)' }}
        {...props}
      />
    )
  };

  return (
    <div className="w-full markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => (isLocalImageMarkdownSrc(url) ? url : defaultUrlTransform(url))}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const MarkdownRenderer = React.memo(
  MarkdownRendererComponent,
  (prevProps, nextProps) => (
    prevProps.content === nextProps.content
    && prevProps.theme.id === nextProps.theme.id
    && prevProps.appearanceSettings?.bodyFontSize === nextProps.appearanceSettings?.bodyFontSize
    && prevProps.appearanceSettings?.headingScale === nextProps.appearanceSettings?.headingScale
    && prevProps.imageRenderMode === nextProps.imageRenderMode
  )
);

MarkdownRenderer.displayName = 'MarkdownRenderer';
