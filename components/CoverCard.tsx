import React from 'react';
import type { AppearanceSettings } from '../lib/appearanceSettings';
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
  appearanceSettings?: AppearanceSettings;
}

export const CoverCard: React.FC<CoverCardProps> = ({ settings, theme, width, height, appearanceSettings }) => {
  if (!settings.enabled) return null;

  const { title, subtitle, author, variant } = settings;
  const styles = getThemeStyles(theme);
  const titleText = title.trim();
  const hasCjk = /[\u3400-\u9fff]/.test(titleText);
  const titleLength = titleText.length;
  const coverTitleSize = appearanceSettings?.coverTitleSize;

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
        backgroundImage: 'var(--theme-bg-image)',
        backgroundSize: '20px 20px, 100% 100%',
        backgroundRepeat: 'repeat, no-repeat',
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
    const simpleTitleSize = titleLength > 30
      ? Math.max(24, (coverTitleSize ?? (hasCjk ? 34 : 36)) - 4)
      : (coverTitleSize ?? (hasCjk ? 34 : 36));
    const simpleTitleClass = cn(
      "mb-5 font-semibold tracking-[-0.01em] break-words [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden",
      "[-webkit-line-clamp:4]"
    );

    return (
      <Wrapper>
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-7 w-10 h-1 opacity-20 rounded-full" style={{ backgroundColor: 'var(--theme-text-color)' }} />
          <h1
            className={simpleTitleClass}
            style={{
              color: 'var(--theme-title-color)',
              fontSize: `${simpleTitleSize}px`,
              lineHeight: titleLength > 30 ? (hasCjk ? 1.28 : 1.2) : (hasCjk ? 1.24 : 1.16),
            }}
          >
            {title || "在这里填写标题"}
          </h1>
          <p className="text-base opacity-72 mb-12 max-w-[85%] leading-relaxed [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
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
    const modernTitleSize = titleLength > 34
      ? Math.max(24, (coverTitleSize ?? (hasCjk ? 32 : 38)) - 4)
      : (coverTitleSize ?? (hasCjk ? 32 : 38));
    const modernTitleClass = cn(
      "mb-5 font-semibold tracking-[-0.015em] break-words [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden",
      "[-webkit-line-clamp:5]"
    );

    return (
      <Wrapper>
        <div className="w-full h-full flex flex-col p-9 relative">
          {/* Decorative shapes using accent/text color */}
          <div className="absolute top-0 right-0 w-36 h-36 opacity-[0.04] rounded-bl-[100px] pointer-events-none" style={{ backgroundColor: 'var(--theme-title-color)' }} />
          <div className="absolute bottom-0 left-0 w-28 h-28 opacity-[0.04] rounded-tr-[100px] pointer-events-none" style={{ backgroundColor: 'var(--theme-title-color)' }} />

          <div className="mt-auto mb-6 relative z-10">
            {author && (
              <span 
                className="inline-block px-3 py-1 mb-5 text-[11px] font-medium tracking-[0.12em] border rounded-full opacity-65"
                style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}
              >
                {author}
              </span>
            )}
            <h1
              className={modernTitleClass}
              style={{
                color: 'var(--theme-title-color)',
                fontSize: `${modernTitleSize}px`,
                lineHeight: titleLength > 34 ? (hasCjk ? 1.27 : 1.16) : (hasCjk ? 1.22 : 1.12),
              }}
            >
              {title || "现代风标题"}
            </h1>
            <div className="w-12 h-1 mb-5 rounded-full" style={{ backgroundColor: 'var(--theme-accent)' }} />
            <p className="text-[15px] opacity-75 leading-relaxed [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
              {subtitle}
            </p>
          </div>
        </div>
      </Wrapper>
    );
  }

  // Outline Variant
  const outlineTitleSize = coverTitleSize ?? 34;
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
            <h1
              className="font-serif italic mb-5 break-words [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical] overflow-hidden"
              style={{ color: 'var(--theme-title-color)', fontSize: `${outlineTitleSize}px`, lineHeight: 1.2 }}
            >
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
