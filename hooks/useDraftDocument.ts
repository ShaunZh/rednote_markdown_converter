import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { CoverSettings } from '../components/CoverCard';
import {
  DEFAULT_APPEARANCE_SETTINGS,
  normalizeAppearanceSettings,
  type AppearanceSettings,
} from '../lib/appearanceSettings';
import {
  generateDocId,
  getDocumentById,
  saveRecentEdit,
  subtitleFromMarkdown,
  titleFromMarkdown,
  type CoverSettingsStored,
} from '../lib/draftStorage';
import { THEMES, type ThemeConfig } from '../lib/themeConfig';

interface UseDraftDocumentProps {
  defaultCoverSettings: CoverSettings;
  defaultAppearanceSettings?: AppearanceSettings;
  pageCount: number;
}

const normalizeCoverSettings = (
  input: Partial<CoverSettingsStored> | Partial<CoverSettings> | null | undefined,
  defaultCoverSettings: CoverSettings
): CoverSettings => ({
  ...defaultCoverSettings,
  ...input,
  date: typeof input?.date === 'string' ? input.date : defaultCoverSettings.date,
  coverImage: typeof input?.coverImage === 'string' ? input.coverImage : defaultCoverSettings.coverImage,
  variant: (input?.variant as CoverSettings['variant']) ?? defaultCoverSettings.variant,
});

export function useDraftDocument({
  defaultCoverSettings,
  defaultAppearanceSettings = DEFAULT_APPEARANCE_SETTINGS,
  pageCount,
}: UseDraftDocumentProps) {
  const [markdown, setMarkdown] = useState('');
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES[0]);
  const [coverSettings, setCoverSettings] = useState<CoverSettings>(defaultCoverSettings);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(defaultAppearanceSettings);
  const [documentRevision, setDocumentRevision] = useState(0);

  const currentDocumentIdRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestStateRef = useRef({
    markdown: '',
    coverSettings: {
      enabled: defaultCoverSettings.enabled,
      title: defaultCoverSettings.title,
      subtitle: defaultCoverSettings.subtitle,
      date: defaultCoverSettings.date,
      author: defaultCoverSettings.author,
      coverImage: defaultCoverSettings.coverImage,
      variant: defaultCoverSettings.variant as CoverSettingsStored['variant'],
      showPageNumber: defaultCoverSettings.showPageNumber,
    },
    appearanceSettings: defaultAppearanceSettings,
    themeId: THEMES[0].id,
    pageCount: 1,
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const documentId = searchParams.get('id');

  const resetDocumentState = useCallback(() => {
    currentDocumentIdRef.current = null;
    setMarkdown('');
    setCurrentTheme(THEMES[0]);
    setCoverSettings(defaultCoverSettings);
    setAppearanceSettings(defaultAppearanceSettings);
    setDocumentRevision((prev) => prev + 1);
  }, [defaultAppearanceSettings, defaultCoverSettings]);

  useEffect(() => {
    if (documentId) {
      const document = getDocumentById(documentId);
      if (document) {
        setMarkdown(document.markdown);
        setCoverSettings(normalizeCoverSettings(document.coverSettings, defaultCoverSettings));
        setAppearanceSettings(
          normalizeAppearanceSettings(document.appearanceSettings, document.coverSettings?.showPageNumber ?? defaultAppearanceSettings.showPageNumber)
        );
        const theme = THEMES.find((candidate) => candidate.id === document.themeId);
        if (theme) {
          setCurrentTheme(theme);
        }
        currentDocumentIdRef.current = document.id;
        setDocumentRevision((prev) => prev + 1);
        return;
      }
    }

    resetDocumentState();
  }, [defaultAppearanceSettings.showPageNumber, defaultCoverSettings, documentId, resetDocumentState]);

  const handleCreateNewDocument = useCallback(() => {
    resetDocumentState();
    if (documentId) {
      router.push('/draft');
    }
  }, [documentId, resetDocumentState, router]);

  const flushRecentEdit = useCallback(() => {
    const {
      markdown: nextMarkdown,
      coverSettings: nextCoverSettings,
      appearanceSettings: nextAppearanceSettings,
      themeId,
      pageCount: nextPageCount,
    } = latestStateRef.current;
    if (nextMarkdown.trim().length === 0) {
      return;
    }

    const id = currentDocumentIdRef.current ?? generateDocId();
    if (!currentDocumentIdRef.current) {
      currentDocumentIdRef.current = id;
    }

    saveRecentEdit({
      id,
      title: titleFromMarkdown(nextMarkdown),
      subtitle: subtitleFromMarkdown(nextMarkdown),
      markdown: nextMarkdown,
      coverSettings: nextCoverSettings,
      appearanceSettings: nextAppearanceSettings,
      themeId,
      pageCount: nextPageCount,
    });
  }, []);

  useEffect(() => {
    latestStateRef.current = {
      markdown,
      coverSettings: {
        enabled: coverSettings.enabled,
        title: coverSettings.title,
        subtitle: coverSettings.subtitle,
        date: coverSettings.date,
        author: coverSettings.author,
        coverImage: coverSettings.coverImage,
        variant: coverSettings.variant,
        showPageNumber: coverSettings.showPageNumber,
      },
      appearanceSettings,
      themeId: currentTheme.id,
      pageCount,
    };

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(flushRecentEdit, 800);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = null;
    };
  }, [appearanceSettings, coverSettings, currentTheme.id, flushRecentEdit, markdown, pageCount]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      flushRecentEdit();
    };
  }, [flushRecentEdit]);

  return {
    markdown,
    setMarkdown,
    currentTheme,
    setCurrentTheme,
    coverSettings,
    setCoverSettings,
    appearanceSettings,
    setAppearanceSettings,
    handleCreateNewDocument,
    documentRevision,
  };
}
