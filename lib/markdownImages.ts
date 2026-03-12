export type ImageAlign = 'left' | 'center' | 'right';

export interface MarkdownImageLayout {
  widthPercent: number;
  align: ImageAlign;
}

export interface MarkdownImageEntry {
  index: number;
  alt: string;
  src: string;
  srcToken: string;
  title: string | null;
  layout: MarkdownImageLayout;
  hasCustomLayout: boolean;
  start: number;
  end: number;
}

const IMAGE_TOKEN_RE = /!\[([^\]]*)\]\((<[^>]+>|[^)\s]+)(?:\s+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))?\)/g;
const REDNOTE_IMAGE_PREFIX = 'rednote:';

export const DEFAULT_MARKDOWN_IMAGE_LAYOUT: MarkdownImageLayout = {
  widthPercent: 100,
  align: 'center',
};

function clampWidthPercent(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return DEFAULT_MARKDOWN_IMAGE_LAYOUT.widthPercent;
  }

  return Math.max(25, Math.min(100, Math.round(value)));
}

function normalizeAlign(value: string | null | undefined): ImageAlign {
  if (value === 'left' || value === 'right') {
    return value;
  }

  return 'center';
}

function parseQuotedTitle(titleToken: string | null | undefined): string | null {
  if (!titleToken) {
    return null;
  }

  if (titleToken.length >= 2) {
    return titleToken.slice(1, -1);
  }

  return titleToken;
}

function serializeLayoutTitle(layout: MarkdownImageLayout): string | null {
  const normalizedLayout = normalizeMarkdownImageLayout(layout);
  if (
    normalizedLayout.widthPercent === DEFAULT_MARKDOWN_IMAGE_LAYOUT.widthPercent
    && normalizedLayout.align === DEFAULT_MARKDOWN_IMAGE_LAYOUT.align
  ) {
    return null;
  }

  return `${REDNOTE_IMAGE_PREFIX}w=${normalizedLayout.widthPercent},a=${normalizedLayout.align}`;
}

export function normalizeMarkdownImageLayout(
  layout: Partial<MarkdownImageLayout> | null | undefined
): MarkdownImageLayout {
  return {
    widthPercent: clampWidthPercent(layout?.widthPercent),
    align: normalizeAlign(layout?.align),
  };
}

export function parseMarkdownImageLayout(title: string | null | undefined) {
  if (!title || !title.startsWith(REDNOTE_IMAGE_PREFIX)) {
    return {
      layout: DEFAULT_MARKDOWN_IMAGE_LAYOUT,
      hasCustomLayout: false,
    };
  }

  const tokens = title.slice(REDNOTE_IMAGE_PREFIX.length).split(',');
  const partialLayout: Partial<MarkdownImageLayout> = {};

  tokens.forEach((token) => {
    const [rawKey, rawValue] = token.split('=');
    const key = rawKey?.trim();
    const value = rawValue?.trim();

    if (key === 'w') {
      partialLayout.widthPercent = Number.parseInt(value || '', 10);
    }

    if (key === 'a') {
      partialLayout.align = normalizeAlign(value);
    }
  });

  return {
    layout: normalizeMarkdownImageLayout(partialLayout),
    hasCustomLayout: true,
  };
}

function normalizeMarkdownImageSrcToken(srcToken: string) {
  return srcToken.startsWith('<') && srcToken.endsWith('>')
    ? srcToken.slice(1, -1)
    : srcToken;
}

export function parseMarkdownImages(markdown: string): MarkdownImageEntry[] {
  const entries: MarkdownImageEntry[] = [];
  const lines = markdown.split('\n');
  let inCodeBlock = false;
  let offset = 0;
  let imageIndex = 0;

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      offset += line.length + (lineIndex < lines.length - 1 ? 1 : 0);
      return;
    }

    if (!inCodeBlock) {
      let match: RegExpExecArray | null;
      IMAGE_TOKEN_RE.lastIndex = 0;

      while ((match = IMAGE_TOKEN_RE.exec(line)) !== null) {
        const alt = match[1] ?? '';
        const srcToken = match[2] ?? '';
        const title = parseQuotedTitle(match[3]);
        const { layout, hasCustomLayout } = parseMarkdownImageLayout(title);

        entries.push({
          index: imageIndex,
          alt,
          src: normalizeMarkdownImageSrcToken(srcToken),
          srcToken,
          title,
          layout,
          hasCustomLayout,
          start: offset + match.index,
          end: offset + match.index + match[0].length,
        });

        imageIndex += 1;
      }
    }

    offset += line.length + (lineIndex < lines.length - 1 ? 1 : 0);
  });

  return entries;
}

export function updateMarkdownImageLayout(
  markdown: string,
  imageIndex: number,
  layout: Partial<MarkdownImageLayout>
): string {
  const entries = parseMarkdownImages(markdown);
  const entry = entries[imageIndex];
  if (!entry) {
    return markdown;
  }

  const nextLayout = normalizeMarkdownImageLayout({
    ...entry.layout,
    ...layout,
  });
  const nextTitle = serializeLayoutTitle(nextLayout);
  const replacement = `![${entry.alt}](${entry.srcToken}${nextTitle ? ` "${nextTitle}"` : ''})`;

  return `${markdown.slice(0, entry.start)}${replacement}${markdown.slice(entry.end)}`;
}
