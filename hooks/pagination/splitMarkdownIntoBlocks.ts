import type { Block } from './types';

const IMAGE_LINE_RE = /^!\[.*?\]\(.*?\)\s*$/;
const PAGE_BREAK_RE = /^<!--\s*pagebreak\s*-->$/i;

export function splitMarkdownIntoBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.split('\n');
  let currentBlockContent: string[] = [];
  let inCodeBlock = false;
  let blockIdCounter = 0;

  const flush = (type: 'code' | 'standard' | 'image') => {
    if (currentBlockContent.length > 0) {
      blocks.push({
        id: `block-${blockIdCounter++}`,
        content: currentBlockContent.join('\n'),
        type,
      });
      currentBlockContent = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        flush('standard');
        inCodeBlock = true;
        currentBlockContent.push(line);
      } else {
        currentBlockContent.push(line);
        flush('code');
        inCodeBlock = false;
      }
    } else if (!inCodeBlock && PAGE_BREAK_RE.test(line.trim())) {
      flush('standard');
      blocks.push({
        id: `block-${blockIdCounter++}`,
        content: '',
        type: 'pagebreak',
      });
    } else if (!inCodeBlock && IMAGE_LINE_RE.test(line.trim())) {
      flush('standard');
      currentBlockContent.push(line);
      flush('image');
    } else if (inCodeBlock) {
      currentBlockContent.push(line);
    } else if (line.trim() === '' && currentBlockContent.length > 0) {
      currentBlockContent.push(line);
      flush('standard');
    } else {
      currentBlockContent.push(line);
    }
  }

  flush(inCodeBlock ? 'code' : 'standard');
  return blocks;
}
