import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ThemeConfig } from '../lib/themeConfig';
import { cn } from '../lib/utils';

interface MarkdownRendererProps {
  content: string;
  theme: ThemeConfig;
}

const MacWindowHeader = () => (
  <div className="flex gap-1.5 mb-2 px-1 opacity-80">
    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
  </div>
);

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, theme }) => {
  const baseLineHeight = Number.parseFloat(theme.typography.lineHeight || '1.6');
  const contentLineHeight = Math.min(2.1, Number.isFinite(baseLineHeight) ? baseLineHeight + 0.06 : 1.66);

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
            className="rounded-lg overflow-hidden my-3 text-xs shadow-sm border border-[var(--theme-border)]"
            style={{ backgroundColor: 'var(--code-bg)' }}
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
          className="px-1.5 py-0.5 rounded text-[0.9em] font-mono mx-0.5"
          style={{
            backgroundColor: 'var(--code-bg)',
            color: 'var(--code-text)',
            border: theme.id === 'minimal' ? '1px solid #e2e8f0' : 'none'
          }}
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ node, ...props }: any) => (
      <h1
        className="text-[23px] font-bold mb-2 mt-1"
        style={{ color: 'var(--theme-title-color)' }}
        {...props}
      />
    ),
    h2: ({ node, ...props }: any) => (
      <h2
        className={cn(
          "text-[19px] font-bold mb-2 mt-2.5",
          theme.id === 'minimal' && "pb-2 border-b border-slate-200",
          theme.id === 'geek' && "border-l-4 pl-3 border-[var(--theme-accent)]"
        )}
        style={{ color: 'var(--theme-title-color)' }}
        {...props}
      />
    ),
    h3: ({ node, ...props }: any) => (
      <h3
        className="text-[17px] font-bold mb-1.5 mt-2"
        style={{ color: 'var(--theme-title-color)' }}
        {...props}
      />
    ),
    p: ({ node, ...props }: any) => (
      <p
        className="mb-3 text-[calc(var(--theme-text-base)-1px)]"
        style={{
          color: 'var(--theme-text-color)',
          lineHeight: contentLineHeight,
        }}
        {...props}
      />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc pl-[18px] mb-2.5 space-y-0.5 marker:text-[var(--theme-accent)]" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal pl-[18px] mb-2.5 space-y-0.5 marker:text-[var(--theme-accent)]" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li
        className="pl-1"
        style={{
          color: 'var(--theme-text-color)',
          lineHeight: contentLineHeight,
        }}
        {...props}
      />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className={cn(
          "pl-3.5 py-2 my-2.5 italic text-sm opacity-90 relative",
          theme.components.blockquote.style === 'card' && "rounded-lg pr-4 shadow-sm",
          theme.components.blockquote.style === 'bar' && "border-l-4"
        )}
        style={{
          backgroundColor: 'var(--quote-bg)',
          borderColor: 'var(--quote-accent)',
          color: 'var(--theme-text-color)'
        }}
        {...props}
      />
    ),
    img: ({ node, ...props }: any) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="rounded-lg my-2.5 w-full object-cover shadow-sm" {...props} alt={props.alt || ''} />
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
    )
  };

  return (
    <div className="w-full markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
