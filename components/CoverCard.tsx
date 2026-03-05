import React from 'react';
import { ThemeConfig, getThemeStyles } from '../lib/themeConfig';
import { cn } from '../lib/utils';

export type CoverVariant = 'simple' | 'modern' | 'outline';

export interface CoverSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  author: string;
  variant: CoverVariant;
  showPageNumber: boolean;
}

interface CoverCardProps {
  settings: CoverSettings;
  theme: ThemeConfig;
  width: number;
  height: number;
}

export const CoverCard: React.FC<CoverCardProps> = ({ settings, theme, width, height }) => {
  if (!settings.enabled) return null;

  const { title, subtitle, author, variant } = settings;
  const styles = getThemeStyles(theme);

  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    ...styles // Inject all CSS variables
  } as React.CSSProperties;

  // Common wrapper ensuring custom fonts are applied
  const Wrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div
      className={cn(
        "preview-card shrink-0 relative shadow-2xl transition-transform hover:scale-[1.02] duration-300 ease-out origin-center overflow-hidden",
        className
      )}
      style={{
        ...containerStyle,
        background: 'var(--theme-bg)',
        fontFamily: 'var(--theme-font)',
        color: 'var(--theme-text-color)',
        border: 'var(--theme-border)',
        borderRadius: 'var(--theme-radius)',
      }}
    >
      {children}
    </div>
  );

  if (variant === 'simple') {
    return (
      <Wrapper>
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-8 w-12 h-1 opacity-20 rounded-full" style={{ backgroundColor: 'var(--theme-text-color)' }} />
          <h1 className="text-4xl font-bold mb-6 leading-tight" style={{ color: 'var(--theme-title-color)' }}>
            {title || "在这里填写标题"}
          </h1>
          <p className="text-lg opacity-75 mb-12 max-w-[85%] leading-relaxed">
            {subtitle || "写一句吸引读者的副标题"}
          </p>
          <div className="mt-auto opacity-50 font-medium text-xs tracking-widest uppercase flex items-center gap-2">
            {author && <><span>—</span> <span>{author}</span> <span>—</span></>}
          </div>
        </div>
      </Wrapper>
    );
  }

  if (variant === 'modern') {
    return (
      <Wrapper>
        <div className="w-full h-full flex flex-col p-10 relative">
          {/* Decorative shapes using accent/text color */}
          <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.05] rounded-bl-[100px] pointer-events-none" style={{ backgroundColor: 'var(--theme-title-color)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 opacity-[0.05] rounded-tr-[100px] pointer-events-none" style={{ backgroundColor: 'var(--theme-title-color)' }} />

          <div className="mt-auto mb-8 relative z-10">
            {author && (
              <span 
                className="inline-block px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-widest border rounded-full opacity-60"
                style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}
              >
                {author}
              </span>
            )}
            <h1 className="text-5xl font-black leading-[1.1] mb-6 tracking-tight" style={{ color: 'var(--theme-title-color)' }}>
              {title || "现代风标题"}
            </h1>
            <div className="w-16 h-1.5 mb-6" style={{ backgroundColor: 'var(--theme-accent)' }} />
            <p className="text-xl opacity-80 font-light leading-snug">
              {subtitle}
            </p>
          </div>
        </div>
      </Wrapper>
    );
  }

  // Outline Variant
  return (
    <Wrapper>
      <div className="w-full h-full p-5">
        <div 
            className="w-full h-full border-2 flex flex-col items-center justify-between p-8 text-center relative" 
            style={{ borderColor: 'var(--theme-accent)' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3" style={{ background: 'var(--theme-bg)' }}>
            <span className="text-2xl opacity-50">✦</span>
          </div>

          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">呈现</p>
          </div>

          <div className="my-auto">
            <h1 className="text-4xl font-serif italic mb-6" style={{ color: 'var(--theme-title-color)' }}>
              {title || "封面标题"}
            </h1>
            {subtitle && (
               <p className="text-sm opacity-70 border-t pt-4 mt-2 inline-block px-8 max-w-full" style={{ borderColor: 'var(--theme-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="mb-2 text-[10px] font-mono opacity-50 uppercase tracking-widest">
            {author}
          </div>
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-3" style={{ background: 'var(--theme-bg)' }}>
            <span className="text-2xl opacity-50">✦</span>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};
