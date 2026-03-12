import { useEffect, useRef, useState } from 'react';
import type { ThemeConfig } from '../lib/themeConfig';
import { paginateMeasuredBlocks } from './pagination/paginateMeasuredBlocks';
import { splitMarkdownIntoBlocks } from './pagination/splitMarkdownIntoBlocks';
import type { Block } from './pagination/types';

export type { Block } from './pagination/types';

const getBlocksSignature = (items: Block[]) =>
    items.map((block) => `${block.id}:${block.type}:${block.content}`).join('\u0001');

const getPagesSignature = (items: Block[][]) =>
    items.map((page) => page.map((block) => block.id).join('\u0002')).join('\u0003');

interface UseSmartPaginationProps {
    markdown: string;
    theme: ThemeConfig;
    cardHeight: number;
    includePageNumber: boolean;
    contentStyleSignature?: string;
    paddingYOffset?: number;
}

export const useSmartPagination = ({
    markdown,
    theme,
    cardHeight,
    includePageNumber,
    contentStyleSignature = '',
    paddingYOffset = 0,
}: UseSmartPaginationProps) => {
    const measureRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<Block[][]>([[]]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [measurementVersion, setMeasurementVersion] = useState(0);

    // Initial Parse: Reset blocks when markdown input changes
    // We strictly depend on markdown string here.
    useEffect(() => {
        setBlocks(splitMarkdownIntoBlocks(markdown));
    }, [markdown]);

    useEffect(() => {
        if (!measureRef.current) return;

        const measureContainer = measureRef.current;
        let frameId = 0;
        let disposed = false;
        const scheduleMeasurement = () => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
            frameId = requestAnimationFrame(() => {
                if (!disposed) {
                    setMeasurementVersion((prev) => prev + 1);
                }
            });
        };

        scheduleMeasurement();

        const fontSet = typeof document !== 'undefined' ? document.fonts : null;
        const handleFontsSettled = () => {
            scheduleMeasurement();
        };
        if (fontSet) {
            void fontSet.ready.then(() => {
                if (!disposed) {
                    scheduleMeasurement();
                }
            });
            fontSet.addEventListener('loadingdone', handleFontsSettled);
            fontSet.addEventListener('loadingerror', handleFontsSettled);
        }

        const resizeObserver = new ResizeObserver(() => {
            scheduleMeasurement();
        });
        resizeObserver.observe(measureContainer);

        const images = Array.from(measureContainer.querySelectorAll('img'));
        const handleImageEvent = () => {
            scheduleMeasurement();
        };
        images.forEach((image) => {
            image.addEventListener('load', handleImageEvent);
            image.addEventListener('error', handleImageEvent);
        });

        return () => {
            disposed = true;
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
            resizeObserver.disconnect();
            if (fontSet) {
                fontSet.removeEventListener('loadingdone', handleFontsSettled);
                fontSet.removeEventListener('loadingerror', handleFontsSettled);
            }
            images.forEach((image) => {
                image.removeEventListener('load', handleImageEvent);
                image.removeEventListener('error', handleImageEvent);
            });
        };
    }, [blocks, theme, cardHeight, includePageNumber, contentStyleSignature, paddingYOffset]);

    // Measurement & Pagination Effect
    // This effect runs whenever 'blocks' changes (including after a split), creating a recursive loop until stable.
    useEffect(() => {
        if (!measureRef.current) return;

        const measureContainer = measureRef.current;
        const blockNodes = Array.from(measureContainer.children) as HTMLElement[];
        if (blockNodes.length === 0) return;

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
            const currentSignature = getBlocksSignature(blocks);
            const nextSignature = getBlocksSignature(paginationResult.blocks);
            if (currentSignature !== nextSignature) {
                setBlocks(paginationResult.blocks);
            }
        } else {
            const currentSignature = getPagesSignature(pages);
            const nextSignature = getPagesSignature(paginationResult.pages);
            if (currentSignature !== nextSignature) {
                setPages(paginationResult.pages);
            }
        }
    }, [blocks, cardHeight, includePageNumber, contentStyleSignature, measurementVersion, paddingYOffset, pages, theme]);

    return {
        pages,
        measureRef,
        blocks // Export blocks so we can map them in the hidden measure container
    };
};
