/**
 * LocalStorage schema for draft + recent edits.
 * Keys: rednote-draft-*, rednote-recent-edits
 */

export const STORAGE_KEYS = {
  draftMarkdown: 'rednote-draft-markdown',
  draftCover: 'rednote-draft-cover',
  draftTheme: 'rednote-draft-theme',
  recentEdits: 'rednote-recent-edits',
  loadDocId: 'rednote-load-doc-id',
} as const;

export interface CoverSettingsStored {
  enabled: boolean;
  title: string;
  subtitle: string;
  author: string;
  variant: 'simple' | 'modern' | 'outline';
  showPageNumber: boolean;
}

export interface RecentEditItem {
  id: string;
  title: string;
  subtitle: string;
  markdown: string;
  coverSettings: CoverSettingsStored;
  themeId: string;
  updatedAt: string; // ISO
  pageCount: number;
}

const RECENT_MAX = 20;

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

/** Title from first non-empty line of markdown; fallback "未命名". */
export function titleFromMarkdown(markdown: string): string {
  const line = markdown.split(/\r?\n/).find((l) => l.trim().length > 0);
  const t = line?.trim().replace(/^#+\s*/, '') ?? '';
  return t.slice(0, 80) || '未命名';
}

/** Subtitle from second meaningful line (optional). */
export function subtitleFromMarkdown(markdown: string): string {
  const lines = markdown.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const second = lines[1];
  if (!second || second.startsWith('#')) return '';
  return second.slice(0, 120);
}

export interface DraftData {
  markdown: string | null;
  coverSettings: CoverSettingsStored | null;
  themeId: string | null;
}

export function getDraft(): DraftData {
  const markdown = safeGet(STORAGE_KEYS.draftMarkdown, (s) => s);
  const cover = safeGet(STORAGE_KEYS.draftCover, (s) => s);
  const themeId = safeGet(STORAGE_KEYS.draftTheme, (s) => s);
  let coverSettings: CoverSettingsStored | null = null;
  if (cover) {
    try {
      const parsed = JSON.parse(cover) as unknown;
      if (parsed && typeof parsed === 'object' && 'enabled' in parsed) {
        coverSettings = parsed as CoverSettingsStored;
      }
    } catch {
      // ignore
    }
  }
  return { markdown, coverSettings, themeId };
}

export function setDraft(markdown: string, coverSettings: CoverSettingsStored, themeId: string): void {
  safeSet(STORAGE_KEYS.draftMarkdown, markdown);
  safeSet(STORAGE_KEYS.draftCover, JSON.stringify(coverSettings));
  safeSet(STORAGE_KEYS.draftTheme, themeId);
}
