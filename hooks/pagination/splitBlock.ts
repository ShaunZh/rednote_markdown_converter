import type { Block } from './types';

export function splitBlock(block: Block, ratio: number): [Block, Block] | null {
  if (block.content.length < 10) return null;
  if (block.type === 'pagebreak' || block.type === 'image') return null;

  if (block.type === 'code') {
    const lines = block.content.split('\n');
    const firstLine = lines[0];
    const langMatch = firstLine.match(/^```(\S+)?/);
    const lang = langMatch ? (langMatch[1] || '') : '';

    const contentLines = lines.slice(1, -1);
    const splitIndex = Math.floor(contentLines.length * ratio) + 1;
    if (splitIndex <= 1 || splitIndex >= lines.length - 1) return null;

    const part1Lines = lines.slice(0, splitIndex);
    part1Lines.push('```');

    const part2Content = lines.slice(splitIndex, -1);
    const part2Lines = [`\`\`\`${lang}:no-header`, ...part2Content, '```'];

    return [
      { ...block, id: `${block.id}-part1`, content: part1Lines.join('\n') },
      { ...block, id: `${block.id}-part2`, content: part2Lines.join('\n') },
    ];
  }

  const text = block.content;
  const splitPos = Math.floor(text.length * ratio);
  const isListBlock = /(^|\n)\s*([-*+]|\d+\.)\s+/.test(text);

  const naturalSearch = Math.min(140, Math.floor(text.length * 0.2));
  const naturalStart = Math.max(1, splitPos - naturalSearch);
  const naturalEnd = Math.min(text.length - 1, splitPos + naturalSearch);
  const candidates: number[] = [];

  for (let i = naturalStart; i < naturalEnd; i += 1) {
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
        { ...block, id: `${block.id}-p2`, content: part2 },
      ];
    }
  }

  if (isListBlock) {
    return null;
  }

  const searchRange = Math.min(50, text.length * 0.1);
  const startSearch = Math.max(0, splitPos - searchRange);
  const endSearch = Math.min(text.length, splitPos + searchRange);
  const fragment = text.substring(startSearch, endSearch);

  let bestSplit = -1;
  const sentenceRegex = /(?<!\d)\.(?!\d)|[!?;。！？；]/g;
  let match: RegExpExecArray | null;
  while ((match = sentenceRegex.exec(fragment)) !== null) {
    const absolutePos = startSearch + match.index + 1;
    if (Math.abs(absolutePos - splitPos) < Math.abs(bestSplit - splitPos)) {
      bestSplit = absolutePos;
    }
  }

  if (bestSplit === -1) {
    const newlineIndex = fragment.lastIndexOf('\n');
    if (newlineIndex !== -1) {
      bestSplit = startSearch + newlineIndex + 1;
    }
  }

  if (bestSplit === -1) {
    const spaceIndex = fragment.lastIndexOf(' ');
    if (spaceIndex !== -1) {
      bestSplit = startSearch + spaceIndex + 1;
    }
  }

  if (bestSplit === -1) {
    bestSplit = splitPos;
  }

  if (bestSplit <= 0 || bestSplit >= text.length) return null;

  const part1Text = text.substring(0, bestSplit);
  const part2Text = text.substring(bestSplit);
  if (part1Text.trim().length < 40 || part2Text.trim().length < 40) return null;

  return [
    { ...block, id: `${block.id}-p1`, content: part1Text },
    { ...block, id: `${block.id}-p2`, content: part2Text },
  ];
}

export function forceSplitBlock(block: Block, ratio: number): [Block, Block] | null {
  if (block.content.length < 4) return null;
  if (block.type === 'pagebreak' || block.type === 'image') return null;

  if (block.type === 'code') {
    const lines = block.content.split('\n');
    if (lines.length < 4) return null;

    const firstLine = lines[0];
    const langMatch = firstLine.match(/^```(\S+)?/);
    const lang = langMatch ? (langMatch[1] || '') : '';
    const contentLines = lines.slice(1, -1);
    if (contentLines.length < 2) return null;

    const splitIndex = Math.max(2, Math.min(lines.length - 2, Math.floor(contentLines.length * ratio) + 1));
    const part1Lines = lines.slice(0, splitIndex);
    part1Lines.push('```');

    const part2Content = lines.slice(splitIndex, -1);
    if (part2Content.length === 0) return null;

    return [
      { ...block, id: `${block.id}-force1`, content: part1Lines.join('\n') },
      { ...block, id: `${block.id}-force2`, content: [`\`\`\`${lang}:no-header`, ...part2Content, '```'].join('\n') },
    ];
  }

  const text = block.content;
  const splitPos = Math.max(1, Math.min(text.length - 1, Math.floor(text.length * ratio)));
  const searchStart = Math.max(1, splitPos - 120);
  const searchEnd = Math.min(text.length - 1, splitPos + 120);

  let bestSplit = -1;
  for (let i = splitPos; i >= searchStart; i -= 1) {
    if (text[i] === '\n') {
      bestSplit = i + 1;
      break;
    }
  }

  if (bestSplit === -1) {
    for (let i = splitPos; i < searchEnd; i += 1) {
      if (text[i] === '\n') {
        bestSplit = i + 1;
        break;
      }
    }
  }

  if (bestSplit === -1) {
    for (let i = splitPos; i >= searchStart; i -= 1) {
      if (text[i] === ' ') {
        bestSplit = i + 1;
        break;
      }
    }
  }

  if (bestSplit === -1) {
    bestSplit = splitPos;
  }

  const part1Text = text.substring(0, bestSplit);
  const part2Text = text.substring(bestSplit);
  if (part1Text.trim().length < 12 || part2Text.trim().length < 12) return null;

  return [
    { ...block, id: `${block.id}-force1`, content: part1Text },
    { ...block, id: `${block.id}-force2`, content: part2Text },
  ];
}
