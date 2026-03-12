/**
 * LocalStorage schema for recent edits.
 */

import type { AppearanceSettings } from './appearanceSettings';

export const STORAGE_KEYS = {
  recentEdits: 'rednote-recent-edits',
} as const;

export interface CoverSettingsStored {
  enabled: boolean;
  title: string;
  subtitle: string;
  date?: string;
  author: string;
  coverImage?: string;
  variant: 'simple' | 'modern' | 'outline';
  showPageNumber: boolean;
}

export interface RecentEditItem {
  id: string;
  title: string;
  subtitle: string;
  markdown: string;
  coverSettings: CoverSettingsStored;
  appearanceSettings?: AppearanceSettings;
  themeId: string;
  updatedAt: string; // ISO
  pageCount: number;
}

const RECENT_MAX = 20;
const DEFAULT_COVER_TITLES = new Set([
  '',
  '小红书创作指南',
  '在这里填写标题',
  '现代风标题',
  '封面标题',
]);

function safeGet<T>(key: string, parse: (s: string) => T): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = window.localStorage.getItem(key);
    if (s == null || s === '') return null;
    return parse(s);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // quota or disabled
  }
}

export function getRecentEdits(): RecentEditItem[] {
  const raw = safeGet(STORAGE_KEYS.recentEdits, (s) => s);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x): x is RecentEditItem => x != null && typeof x === 'object' && typeof (x as RecentEditItem).id === 'string')
      .map((item) => ({
        ...item,
        title: titleFromMarkdown(item.markdown, item.coverSettings?.title),
      }))
      .slice(0, RECENT_MAX);
  } catch {
    return [];
  }
}

export function getDocumentById(id: string): RecentEditItem | null {
  const list = getRecentEdits();
  return list.find((x) => x.id === id) ?? null;
}

export function saveRecentEdit(item: Omit<RecentEditItem, 'updatedAt'> & { updatedAt?: string }): void {
  const list = getRecentEdits();
  const updatedAt = item.updatedAt ?? new Date().toISOString();
  const entry: RecentEditItem = { ...item, updatedAt };
  const rest = list.filter((x) => x.id !== entry.id);
  const next = [entry, ...rest].slice(0, RECENT_MAX);
  safeSet(STORAGE_KEYS.recentEdits, JSON.stringify(next));
}

export function deleteRecentEdit(id: string): void {
  const next = getRecentEdits().filter((x) => x.id !== id);
  safeSet(STORAGE_KEYS.recentEdits, JSON.stringify(next));
}

export function generateDocId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function cleanMarkdownLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed || /^<!--\s*pagebreak\s*-->$/i.test(trimmed)) {
    return '';
  }

  return trimmed
    .replace(/^#{1,6}\s+/, '')
    .replace(/^\s*>\s?/, '')
    .replace(/^\s*[-*+]\s+/, '')
    .replace(/^\s*\d+\.\s+/, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .trim();
}

function normalizeCoverTitle(title?: string): string {
  const normalized = typeof title === 'string' ? title.trim() : '';
  if (!normalized || DEFAULT_COVER_TITLES.has(normalized)) {
    return '';
  }
  return normalized;
}

/** Prefer a real document title, otherwise fallback to the first body line. */
export function titleFromMarkdown(markdown: string, coverTitle?: string): string {
  const lines = markdown.split(/\r?\n/);

  for (const line of lines) {
    const match = line.trim().match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    if (match) {
      const headingTitle = cleanMarkdownLine(match[1] ?? '');
      if (headingTitle) {
        return headingTitle.slice(0, 80);
      }
    }
  }

  const normalizedCoverTitle = normalizeCoverTitle(coverTitle);
  if (normalizedCoverTitle) {
    return normalizedCoverTitle.slice(0, 80);
  }

  const line = lines.map(cleanMarkdownLine).find(Boolean) ?? '';
  return line.slice(0, 80) || '未命名';
}

/** Subtitle from second meaningful line (optional). */
export function subtitleFromMarkdown(markdown: string): string {
  const lines = markdown.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const second = lines[1];
  if (!second || second.startsWith('#')) return '';
  return second.slice(0, 120);
}
