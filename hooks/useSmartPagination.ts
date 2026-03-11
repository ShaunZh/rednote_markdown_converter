import { useEffect, useRef, useState } from 'react';
import type { ThemeConfig } from '../lib/themeConfig';
import { paginateMeasuredBlocks } from './pagination/paginateMeasuredBlocks';
import { splitMarkdownIntoBlocks } from './pagination/splitMarkdownIntoBlocks';
import type { Block } from './pagination/types';

export type { Block } from './pagination/types';

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

            const paginationResult = paginateMeasuredBlocks({
                blockNodes,
                blocks,
                theme,
                cardHeight,
                includePageNumber,
                paddingYOffset,
            });

            if (paginationResult.kind === 'split') {
                setBlocks(paginationResult.blocks);
            } else {
                setPages(paginationResult.pages);
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
