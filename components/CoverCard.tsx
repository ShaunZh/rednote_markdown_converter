import React from 'react';

import type { AppearanceSettings } from '../lib/appearanceSettings';
import { getProxyImageSrc } from '../lib/proxyImage';
import { type ThemeConfig, getThemeStyles } from '../lib/themeConfig';
import { cn } from '../lib/utils';

export type CoverVariant = 'simple' | 'modern' | 'outline';

export interface CoverSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  date: string;
  author: string;
  coverImage: string;
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

export const CoverCard: React.FC<CoverCardProps> = ({
  settings,
  theme,
  width,
  height,
  appearanceSettings,
}) => {
  if (!settings.enabled) return null;

  const { title, subtitle, date, author, coverImage, variant } = settings;
  const styles = getThemeStyles(theme);
  const titleText = title.trim();
  const hasCjk = /[\u3400-\u9fff]/.test(titleText);
  const titleLength = titleText.length;
  const coverTitleSize = appearanceSettings?.coverTitleSize;
  const coverImageSrc = getProxyImageSrc(coverImage);
  const metaItems = [date.trim(), author.trim()].filter(Boolean);

  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    ...styles,
  } as React.CSSProperties;

  const Wrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div
      className={cn(
        'preview-card relative shrink-0 origin-center overflow-hidden shadow-2xl transition-transform duration-300 ease-out hover:scale-[1.02]',
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

  const CoverImage = ({ className }: { className: string }) => {
    if (!coverImageSrc) {
      return null;
    }

    return (
      <div
        className={cn(
          'overflow-hidden border border-black/10 bg-white/60 shadow-sm',
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImageSrc}
          alt={title || '封面图'}
          className="h-full w-full object-cover"
          crossOrigin={coverImageSrc.startsWith('data:image/') ? undefined : 'anonymous'}
        />
      </div>
    );
  };

  const MetaLine = ({ className }: { className?: string }) => {
    if (metaItems.length === 0) {
      return null;
    }

    return (
      <div className={cn('flex items-center gap-2 opacity-55', className)}>
        {metaItems.map((item, index) => (
          <React.Fragment key={`${item}-${index}`}>
            {index > 0 && <span className="text-[10px] opacity-60">•</span>}
            <span>{item}</span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (variant === 'simple') {
    const simpleTitleSize = titleLength > 30
      ? Math.max(24, (coverTitleSize ?? (hasCjk ? 34 : 36)) - 4)
      : (coverTitleSize ?? (hasCjk ? 34 : 36));
    const simpleTitleClass = cn(
      'mb-5 break-words font-semibold tracking-[-0.01em] [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical]',
      '[-webkit-line-clamp:4]'
    );

    return (
      <Wrapper>
        <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
          <CoverImage className="mb-6 h-40 w-full max-w-[300px] rounded-[24px]" />
          <div className="mb-7 h-1 w-10 rounded-full opacity-20" style={{ backgroundColor: 'var(--theme-text-color)' }} />
          <h1
            className={simpleTitleClass}
            style={{
              color: 'var(--theme-title-color)',
              fontSize: `${simpleTitleSize}px`,
              lineHeight: titleLength > 30 ? (hasCjk ? 1.28 : 1.2) : (hasCjk ? 1.24 : 1.16),
            }}
          >
            {title || '在这里填写标题'}
          </h1>
          <p className="mb-12 max-w-[85%] text-base leading-relaxed opacity-72 [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {subtitle || '写一句吸引读者的副标题'}
          </p>
          <MetaLine className="mt-auto flex-wrap justify-center text-xs font-medium uppercase tracking-[0.18em]" />
        </div>
      </Wrapper>
    );
  }

  if (variant === 'modern') {
    const modernTitleSize = titleLength > 34
      ? Math.max(24, (coverTitleSize ?? (hasCjk ? 32 : 38)) - 4)
      : (coverTitleSize ?? (hasCjk ? 32 : 38));
    const modernTitleClass = cn(
      'mb-5 break-words font-semibold tracking-[-0.015em] [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical]',
      '[-webkit-line-clamp:5]'
    );

    return (
      <Wrapper>
        <div className="relative flex h-full w-full flex-col p-9">
          <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-bl-[100px] opacity-[0.04]" style={{ backgroundColor: 'var(--theme-title-color)' }} />
          <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-tr-[100px] opacity-[0.04]" style={{ backgroundColor: 'var(--theme-title-color)' }} />

          <CoverImage className="relative z-10 mb-6 h-40 w-full rounded-[28px]" />

          <div className="relative z-10 mt-auto mb-6">
            {metaItems.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em]">
                {metaItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border px-3 py-1 opacity-70"
                    style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
            <h1
              className={modernTitleClass}
              style={{
                color: 'var(--theme-title-color)',
                fontSize: `${modernTitleSize}px`,
                lineHeight: titleLength > 34 ? (hasCjk ? 1.27 : 1.16) : (hasCjk ? 1.22 : 1.12),
              }}
            >
              {title || '现代风标题'}
            </h1>
            <div className="mb-5 h-1 w-12 rounded-full" style={{ backgroundColor: 'var(--theme-accent)' }} />
            <p className="text-[15px] leading-relaxed opacity-75 [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
              {subtitle}
            </p>
          </div>
        </div>
      </Wrapper>
    );
  }

  const outlineTitleSize = coverTitleSize ?? 34;
  return (
    <Wrapper>
      <div className="h-full w-full p-5">
        <div
          className="relative flex h-full w-full flex-col items-center justify-between border-2 p-8 text-center"
          style={{ borderColor: 'var(--theme-accent)' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3" style={{ background: 'var(--theme-bg)' }}>
            <span className="text-2xl opacity-50">✦</span>
          </div>

          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">呈现</p>
          </div>

          <div className="my-auto">
            <CoverImage className="mx-auto mb-6 h-36 w-full max-w-[240px] rounded-[18px]" />
            <h1
              className="mb-5 break-words font-serif italic [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:4]"
              style={{ color: 'var(--theme-title-color)', fontSize: `${outlineTitleSize}px`, lineHeight: 1.2 }}
            >
              {title || '封面标题'}
            </h1>
            {subtitle && (
              <p className="mt-2 inline-block max-w-full border-t px-8 pt-4 text-sm opacity-70" style={{ borderColor: 'var(--theme-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>

          <MetaLine className="mb-2 flex-wrap justify-center font-mono text-[10px] uppercase tracking-widest" />

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-3" style={{ background: 'var(--theme-bg)' }}>
            <span className="text-2xl opacity-50">✦</span>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};
