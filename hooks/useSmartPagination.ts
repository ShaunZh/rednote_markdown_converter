import { useState, useEffect, useRef, useMemo } from 'react';
import { ThemeConfig } from '../lib/themeConfig';

export interface Block {
    id: string;
    content: string;
    type: 'code' | 'standard' | 'image' | 'pagebreak';
}

const FOOTER_RESERVED_HEIGHT = 8;
const IPHONE_HEADER_RESERVED_HEIGHT = 30;
const SPLIT_SAFETY_RATIO = 0.97;

// --- Helper: Split Markdown into Blocks ---
const IMAGE_LINE_RE = /^!\[.*?\]\(.*?\)\s*$/;
const PAGE_BREAK_RE = /^<!--\s*pagebreak\s*-->$/i;

const splitMarkdownIntoBlocks = (markdown: string): Block[] => {
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
                type
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
            // Flush any preceding standard content, then flush image as its own block
            flush('standard');
            currentBlockContent.push(line);
            flush('image');
        } else {
            if (inCodeBlock) {
                currentBlockContent.push(line);
            } else {
                if (line.trim() === '' && currentBlockContent.length > 0) {
                    currentBlockContent.push(line);
                    flush('standard');
                } else {
                    currentBlockContent.push(line);
                }
            }
        }
    }
    flush(inCodeBlock ? 'code' : 'standard');
    return blocks;
};

interface UseSmartPaginationProps {
    markdown: string;
    theme: ThemeConfig;
    cardHeight: number;
    includePageNumber: boolean;
    paddingYOffset?: number;
}

export const useSmartPagination = ({
    markdown,
    theme,
    cardHeight,
    includePageNumber,
    paddingYOffset = 0,
}: UseSmartPaginationProps) => {
    const measureRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<Block[][]>([[]]);
    const [blocks, setBlocks] = useState<Block[]>([]);

    // Initial Parse: Reset blocks when markdown input changes
    // We strictly depend on markdown string here.
    useEffect(() => {
        setBlocks(splitMarkdownIntoBlocks(markdown));
    }, [markdown]);

    // Measurement & Pagination Effect
    // This effect runs whenever 'blocks' changes (including after a split), creating a recursive loop until stable.
    useEffect(() => {
        if (!measureRef.current) return;

        const measureContainer = measureRef.current;

        // We need to wait for DOM to update with new content/styles
        const timeout = setTimeout(() => {
            const blockNodes = Array.from(measureContainer.children) as HTMLElement[];
            if (blockNodes.length === 0) return;

            // Synchronization check: Ensure DOM nodes match blocks state
            // If they don't match, it means a render is pending or mismatched, skip this cycle.
            if (blockNodes.length !== blocks.length) return;

            const newPages: Block[][] = [];
            let currentPage: Block[] = [];

            // Parse padding from theme config (e.g., '24px' -> 24)
            const paddingVal = parseInt(theme.container.padding) || 24;
            const paddingY = Math.max(0, paddingVal * 2 + paddingYOffset);
            let availableHeight = cardHeight - paddingY - (includePageNumber ? FOOTER_RESERVED_HEIGHT : 0);

            // Account for Header Height
            if (theme.container.headerStyle === 'iphone') {
                availableHeight -= IPHONE_HEADER_RESERVED_HEIGHT;
            }

            const MAX_CONTENT_HEIGHT = availableHeight;

            // We track the start offset of the current page's content
            let pageStartOffset = blockNodes[0].offsetTop;
            let splitOccurred = false;

            for (let i = 0; i < blockNodes.length; i++) {
                const node = blockNodes[i];
                const block = blocks[i];

                // Manual pagebreak has highest priority: force start a new page.
                if (block.type === 'pagebreak') {
                    if (currentPage.length > 0) {
                        newPages.push(currentPage);
                        currentPage = [];
                    }
                    pageStartOffset = i + 1 < blockNodes.length ? blockNodes[i + 1].offsetTop : pageStartOffset;
                    continue;
                }

                // Calculate the bottom position of this node relative to the container
                const nodeBottom = node.offsetTop + node.offsetHeight;

                // Height consumed on the current page including this node
                // This accounts for all intermediate margins/gaps automatically
                const heightOnPage = nodeBottom - pageStartOffset;
                const singleBlockHeight = node.offsetHeight;

                // Check 1: Is the SINGLE block taller than the entire allowed area?
                // - For image blocks: push to next page (never split an image)
                // - For other blocks: force-split at ratio
                if (singleBlockHeight > MAX_CONTENT_HEIGHT) {
                    if (block.type === 'image') {
                        // Image can't be split — push current page and start fresh with this image
                        if (currentPage.length > 0) {
                            newPages.push(currentPage);
                        }
                        // Put the image alone on its own page
                        newPages.push([block]);
                        currentPage = [];
                        pageStartOffset = i + 1 < blockNodes.length ? blockNodes[i + 1].offsetTop : pageStartOffset;
                        continue;
                    }

                    // Keep a small safety margin to reduce oversized split fragments.
                    const ratio = MAX_CONTENT_HEIGHT / singleBlockHeight * SPLIT_SAFETY_RATIO;
                    const newBlocks = splitBlock(block, ratio);

                    if (newBlocks) {
                        // Insert new blocks at current index
                        const updatedBlocks = [
                            ...blocks.slice(0, i),
                            ...newBlocks,
                            ...blocks.slice(i + 1)
                        ];
                        setBlocks(updatedBlocks);
                        splitOccurred = true;
                        break; // Stop processing, wait for re-render with new blocks
                    }
                }

                // Check 2a: Image-specific — if image doesn't fit remaining space, push to next page
                if (block.type === 'image' && currentPage.length > 0) {
                    const usedHeight = node.offsetTop - pageStartOffset;
                    const remainingHeight = MAX_CONTENT_HEIGHT - usedHeight;
                    if (singleBlockHeight > remainingHeight) {
                        newPages.push(currentPage);
                        currentPage = [block];
                        pageStartOffset = node.offsetTop;
                        continue;
                    }
                }

                // Check 2b: Normal Pagination — block doesn't fit on current page
                if (currentPage.length > 0 && heightOnPage > MAX_CONTENT_HEIGHT) {
                    // Try splitting text/code blocks by remaining space to avoid large blank area.
                    if (block.type !== 'image') {
                        const usedHeight = node.offsetTop - pageStartOffset;
                        const remainingHeight = MAX_CONTENT_HEIGHT - usedHeight;
                        if (remainingHeight > 48 && singleBlockHeight > 0) {
                            const ratio = Math.max(0.1, Math.min(0.9, (remainingHeight / singleBlockHeight) * SPLIT_SAFETY_RATIO));
                            const newBlocks = splitBlock(block, ratio);
                            if (newBlocks) {
                                const updatedBlocks = [
                                    ...blocks.slice(0, i),
                                    ...newBlocks,
                                    ...blocks.slice(i + 1)
                                ];
                                setBlocks(updatedBlocks);
                                splitOccurred = true;
                                break;
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

            if (!splitOccurred) {
                if (currentPage.length > 0) {
                    newPages.push(currentPage);
                }

                // Ensure at least one page exists
                if (newPages.length === 0) {
                    setPages([[]]);
                } else {
                    setPages(newPages);
                }
            }

        }, 150); // Delay to allow rendering

        return () => clearTimeout(timeout);
    }, [blocks, theme, cardHeight, includePageNumber, paddingYOffset]);

    return {
        pages,
        measureRef,
        blocks // Export blocks so we can map them in the hidden measure container
    };
};

// --- Helper: Split Logic ---
const splitBlock = (block: Block, ratio: number): [Block, Block] | null => {
    // Safety check: Don't split if too small or already split too much (prevent infinite recursion)
    if (block.content.length < 10) return null;
    if (block.type === 'pagebreak' || block.type === 'image') return null;

    if (block.type === 'code') {
        const lines = block.content.split('\n');
        // Extract language from first line (e.g., ```js)
        const firstLine = lines[0];
        const langMatch = firstLine.match(/^```(\S+)?/);
        const lang = langMatch ? (langMatch[1] || '') : '';

        // Find split line index
        // We exclude first and last lines (fences) from content count
        const contentLines = lines.slice(1, -1);
        const splitIndex = Math.floor(contentLines.length * ratio) + 1; // +1 to account for first fence header

        if (splitIndex <= 1 || splitIndex >= lines.length - 1) return null; // Can't split effectively

        const part1Lines = lines.slice(0, splitIndex);
        part1Lines.push('```'); // Close part 1

        const part2Content = lines.slice(splitIndex, -1); // Middle content
        const part2Lines = [
            `\`\`\`${lang}:no-header`, // Start part 2 with hidden header
            ...part2Content,
            '```'
        ];

        return [
            { ...block, id: `${block.id}-part1`, content: part1Lines.join('\n') },
            { ...block, id: `${block.id}-part2`, content: part2Lines.join('\n') }
        ];
    }
    else {
        // Text Split (Standard)
        const text = block.content;
        const splitPos = Math.floor(text.length * ratio);
        const isListBlock = /(^|\n)\s*([-*+]|\d+\.)\s+/.test(text);

        // Priority 0: Prefer natural boundaries around ratio (paragraph/list boundaries).
        const naturalSearch = Math.min(140, Math.floor(text.length * 0.2));
        const naturalStart = Math.max(1, splitPos - naturalSearch);
        const naturalEnd = Math.min(text.length - 1, splitPos + naturalSearch);
        const candidates: number[] = [];

        for (let i = naturalStart; i < naturalEnd; i++) {
            if (text[i] !== '\n') continue;

            const prevChar = text[i - 1] || '';
            const nextChar = text[i + 1] || '';
            const nextLineStart = i + 1;
            const nextLineEnd = text.indexOf('\n', nextLineStart);
            const nextLine = text
                .slice(nextLineStart, nextLineEnd === -1 ? text.length : nextLineEnd)
                .trimStart();
            const isListStart = /^([-*+]|\d+\.)\s+/.test(nextLine);
            const isParagraphBoundary = prevChar === '\n' || nextChar === '\n';

            if (isParagraphBoundary || isListStart) {
                candidates.push(i + 1);
            }
        }

        if (candidates.length > 0) {
            let nearest = candidates[0];
            for (const point of candidates) {
                if (Math.abs(point - splitPos) < Math.abs(nearest - splitPos)) {
                    nearest = point;
                }
            }

            const part1 = text.substring(0, nearest);
            const part2 = text.substring(nearest);
            if (part1.trim().length >= 12 && part2.trim().length >= 12) {
                return [
                    { ...block, id: `${block.id}-p1`, content: part1 },
                    { ...block, id: `${block.id}-p2`, content: part2 }
                ];
            }
        }

        // For list blocks, only split at natural boundaries to avoid breaking list semantics.
        if (isListBlock) {
            return null;
        }

        // Analyze neighbors to find best split point (Sentence > Space > Force)
        const searchRange = Math.min(50, text.length * 0.1); // Search 10% or 50 chars around
        const startSearch = Math.max(0, splitPos - searchRange);
        const endSearch = Math.min(text.length, splitPos + searchRange);

        const fragment = text.substring(startSearch, endSearch);

        // Priority 1: Sentence End (. ! ? 。 ！)
        let bestSplit = -1;
        // Treat "." as sentence end only when it's not a decimal point (e.g. keep "1.2" intact).
        const sentenceRegex = /(?<!\d)\.(?!\d)|[!?;。！？；]/g;
        let match;
        while ((match = sentenceRegex.exec(fragment)) !== null) {
            // We want to split AFTER the punctuation
            const absolutePos = startSearch + match.index + 1;
            if (Math.abs(absolutePos - splitPos) < Math.abs(bestSplit - splitPos)) {
                bestSplit = absolutePos;
            }
        }

        // Priority 2: Newline
        if (bestSplit === -1) {
            const newlineIndex = fragment.lastIndexOf('\n');
            if (newlineIndex !== -1) {
                bestSplit = startSearch + newlineIndex + 1;
            }
        }

        // Priority 3: Space (Word boundary)
        if (bestSplit === -1) {
            const spaceIndex = fragment.lastIndexOf(' ');
            if (spaceIndex !== -1) {
                bestSplit = startSearch + spaceIndex + 1;
            }
        }

        // Priority 4: Force Split (if no better point found)
        if (bestSplit === -1) {
            bestSplit = splitPos;
        }

        if (bestSplit <= 0 || bestSplit >= text.length) return null;

        const part1Text = text.substring(0, bestSplit);
        const part2Text = text.substring(bestSplit); // Trim leading space? Maybe not to preserve formatting

        // Guard against over-fragmented tiny blocks that hurt readability/layout.
        if (part1Text.trim().length < 40 || part2Text.trim().length < 40) return null;

        return [
            { ...block, id: `${block.id}-p1`, content: part1Text },
            { ...block, id: `${block.id}-p2`, content: part2Text }
        ];
    }
};
