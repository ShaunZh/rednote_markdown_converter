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
  // Use CSS variables for everything to ensure dynamic theming
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const isMacStyle = theme.components.codeBlock.style === 'mac';
      const isDarkTheme = theme.id === 'geek'; // Helper for SyntaxHighlighter specific theme

      if (!inline && match) {
        return (
          <div 
            className="rounded-lg overflow-hidden my-4 text-xs shadow-sm border border-[var(--theme-border)]"
            style={{ backgroundColor: 'var(--code-bg)' }}
          >
            {(isMacStyle || isDarkTheme) && (
                <div className="px-3 py-2 border-b border-black/5 bg-black/5">
                    <MacWindowHeader />
                </div>
            )}
            <div className="p-1">
                <SyntaxHighlighter
                style={isDarkTheme ? oneDark : oneLight}
                language={match[1]}
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
    h1: ({node, ...props}: any) => (
        <h1 
            className="text-2xl font-bold mb-4 mt-2" 
            style={{ color: 'var(--theme-title-color)' }}
            {...props} 
        />
    ),
    h2: ({node, ...props}: any) => (
        <h2 
            className={cn(
                "text-xl font-bold mb-3 mt-4",
                theme.id === 'minimal' && "pb-2 border-b border-slate-200",
                theme.id === 'geek' && "border-l-4 pl-3 border-[var(--theme-accent)]"
            )}
            style={{ color: 'var(--theme-title-color)' }} 
            {...props} 
        />
    ),
    h3: ({node, ...props}: any) => (
        <h3 
            className="text-lg font-bold mb-2 mt-3" 
            style={{ color: 'var(--theme-title-color)' }} 
            {...props} 
        />
    ),
    p: ({node, ...props}: any) => (
        <p 
            className="mb-3 leading-[var(--theme-line-height)] text-[length:var(--theme-text-base)]" 
            style={{ color: 'var(--theme-text-color)' }} 
            {...props} 
        />
    ),
    ul: ({node, ...props}: any) => (
        <ul className="list-disc pl-5 mb-3 space-y-1 marker:text-[var(--theme-accent)]" {...props} />
    ),
    ol: ({node, ...props}: any) => (
        <ol className="list-decimal pl-5 mb-3 space-y-1 marker:text-[var(--theme-accent)]" {...props} />
    ),
    li: ({node, ...props}: any) => (
        <li className="pl-1" style={{ color: 'var(--theme-text-color)' }} {...props} />
    ),
    blockquote: ({node, ...props}: any) => (
        <blockquote 
            className={cn(
                "pl-4 py-2 my-4 italic text-sm opacity-90 relative",
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
    img: ({node, ...props}: any) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="rounded-lg my-4 w-full object-cover shadow-sm" {...props} alt={props.alt || ''} />
    ),
    a: ({node, ...props}: any) => (
        <a 
            className="underline underline-offset-2 decoration-2 font-medium"
            style={{ color: 'var(--theme-accent)', textDecorationColor: 'var(--theme-accent)' }}
            {...props}
        />
    ),
    hr: ({node, ...props}: any) => (
        <hr className="my-6 border-t-2 opacity-20" style={{ borderColor: 'var(--theme-text-color)' }} {...props} />
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