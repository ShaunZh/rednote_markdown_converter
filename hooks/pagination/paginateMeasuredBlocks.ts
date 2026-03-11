import type { ThemeConfig } from '../../lib/themeConfig';
import { splitBlock } from './splitBlock';
import type { Block } from './types';

const FOOTER_RESERVED_HEIGHT = 8;
const IPHONE_HEADER_RESERVED_HEIGHT = 30;
const SPLIT_SAFETY_RATIO = 0.97;

interface PaginateMeasuredBlocksParams {
  blockNodes: HTMLElement[];
  blocks: Block[];
  theme: ThemeConfig;
  cardHeight: number;
  includePageNumber: boolean;
  paddingYOffset: number;
}

type PaginationResult =
  | { kind: 'pages'; pages: Block[][] }
  | { kind: 'split'; blocks: Block[] };

export function paginateMeasuredBlocks({
  blockNodes,
  blocks,
  theme,
  cardHeight,
  includePageNumber,
  paddingYOffset,
}: PaginateMeasuredBlocksParams): PaginationResult {
  const newPages: Block[][] = [];
  let currentPage: Block[] = [];

  const paddingVal = parseInt(theme.container.padding, 10) || 24;
  const paddingY = Math.max(0, paddingVal * 2 + paddingYOffset);
  let availableHeight = cardHeight - paddingY - (includePageNumber ? FOOTER_RESERVED_HEIGHT : 0);

  if (theme.container.headerStyle === 'iphone') {
    availableHeight -= IPHONE_HEADER_RESERVED_HEIGHT;
  }

  const maxContentHeight = availableHeight;
  let pageStartOffset = blockNodes[0].offsetTop;

  for (let i = 0; i < blockNodes.length; i += 1) {
    const node = blockNodes[i];
    const block = blocks[i];

    if (block.type === 'pagebreak') {
      if (currentPage.length > 0) {
        newPages.push(currentPage);
        currentPage = [];
      }
      pageStartOffset = i + 1 < blockNodes.length ? blockNodes[i + 1].offsetTop : pageStartOffset;
      continue;
    }

    const nodeBottom = node.offsetTop + node.offsetHeight;
    const heightOnPage = nodeBottom - pageStartOffset;
    const singleBlockHeight = node.offsetHeight;

    if (singleBlockHeight > maxContentHeight) {
      if (block.type === 'image') {
        if (currentPage.length > 0) {
          newPages.push(currentPage);
        }
        newPages.push([block]);
        currentPage = [];
        pageStartOffset = i + 1 < blockNodes.length ? blockNodes[i + 1].offsetTop : pageStartOffset;
        continue;
      }

      const ratio = (maxContentHeight / singleBlockHeight) * SPLIT_SAFETY_RATIO;
      const newBlocks = splitBlock(block, ratio);
      if (newBlocks) {
        return {
          kind: 'split',
          blocks: [...blocks.slice(0, i), ...newBlocks, ...blocks.slice(i + 1)],
        };
      }
    }

    if (block.type === 'image' && currentPage.length > 0) {
      const usedHeight = node.offsetTop - pageStartOffset;
      const remainingHeight = maxContentHeight - usedHeight;
      if (singleBlockHeight > remainingHeight) {
        newPages.push(currentPage);
        currentPage = [block];
        pageStartOffset = node.offsetTop;
        continue;
      }
    }

    if (currentPage.length > 0 && heightOnPage > maxContentHeight) {
      if (block.type !== 'image') {
        const usedHeight = node.offsetTop - pageStartOffset;
        const remainingHeight = maxContentHeight - usedHeight;
        if (remainingHeight > 48 && singleBlockHeight > 0) {
          const ratio = Math.max(0.1, Math.min(0.9, (remainingHeight / singleBlockHeight) * SPLIT_SAFETY_RATIO));
          const newBlocks = splitBlock(block, ratio);
          if (newBlocks) {
            return {
              kind: 'split',
              blocks: [...blocks.slice(0, i), ...newBlocks, ...blocks.slice(i + 1)],
            };
          }
        }
      }

      newPages.push(currentPage);
      currentPage = [block];
      pageStartOffset = node.offsetTop;
    } else {
      currentPage.push(block);
    }
  }

  if (currentPage.length > 0) {
    newPages.push(currentPage);
  }

  return {
    kind: 'pages',
    pages: newPages.length === 0 ? [[]] : newPages,
  };
}
