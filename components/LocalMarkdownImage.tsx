import React, { useEffect, useState } from 'react';

import {
  isLocalImageMarkdownSrc,
  resolveLocalImageRenderSrc,
  type LocalImageRenderMode,
} from '../lib/localImageStore';

interface LocalMarkdownImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  renderMode?: LocalImageRenderMode;
}

type ImageStatus = 'loading' | 'ready' | 'missing';

export const LocalMarkdownImage = React.memo(function LocalMarkdownImage({
  src,
  alt,
  className,
  renderMode = 'blob-url',
  ...imgProps
}: LocalMarkdownImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(() => (
    src && !isLocalImageMarkdownSrc(src) ? src : null
  ));
  const [status, setStatus] = useState<ImageStatus>(() => {
    if (!src) return 'missing';
    return isLocalImageMarkdownSrc(src) ? 'loading' : 'ready';
  });

  useEffect(() => {
    let cancelled = false;

    if (!src) {
      setResolvedSrc(null);
      setStatus('missing');
      return () => {
        cancelled = true;
      };
    }

    if (!isLocalImageMarkdownSrc(src)) {
      setResolvedSrc(src);
      setStatus('ready');
      return () => {
        cancelled = true;
      };
    }

    setResolvedSrc(null);
    setStatus('loading');

    void resolveLocalImageRenderSrc(src, renderMode).then((nextSrc) => {
      if (cancelled) {
        return;
      }

      if (nextSrc) {
        setResolvedSrc(nextSrc);
        setStatus('ready');
        return;
      }

      setResolvedSrc(null);
      setStatus('missing');
    });

    return () => {
      cancelled = true;
    };
  }, [renderMode, src]);

  if (!resolvedSrc || status !== 'ready') {
    return (
      <div
        data-local-image-status={status}
        className="my-2.5 flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-xs text-slate-500"
      >
        {status === 'loading' ? '正在加载本地图片...' : '本地图片不存在或已被清理'}
      </div>
    );
  }

  return (
    <div data-local-image-status="ready">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt={alt || ''}
        className={className}
        crossOrigin={
          resolvedSrc.startsWith('blob:') || resolvedSrc.startsWith('data:image/')
            ? undefined
            : 'anonymous'
        }
        {...imgProps}
      />
    </div>
  );
});
