export type CanvasPreset = 'rednote-3-4' | 'square-1-1' | 'story-9-16';

export interface AppearanceSettings {
  canvasPreset: CanvasPreset;
  showPageNumber: boolean;
  coverTitleSize: number | null;
  bodyFontSize: number | null;
  headingScale: number | null;
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  canvasPreset: 'rednote-3-4',
  showPageNumber: true,
  coverTitleSize: null,
  bodyFontSize: null,
  headingScale: null,
};

export const CANVAS_PRESETS = [
  {
    id: 'rednote-3-4',
    label: '小红书 (3:4)',
    width: 405,
    height: 540,
    exportWidth: 1080,
  },
  {
    id: 'square-1-1',
    label: '方图 (1:1)',
    width: 405,
    height: 405,
    exportWidth: 1080,
  },
  {
    id: 'story-9-16',
    label: '竖版 (9:16)',
    width: 405,
    height: 720,
    exportWidth: 1080,
  },
] as const;

export type SupportedCanvasPreset = (typeof CANVAS_PRESETS)[number]['id'];

export function isCanvasPreset(value: string | null | undefined): value is SupportedCanvasPreset {
  return CANVAS_PRESETS.some((preset) => preset.id === value);
}

export function getCanvasPresetConfig(canvasPreset: string | null | undefined) {
  if (isCanvasPreset(canvasPreset)) {
    return CANVAS_PRESETS.find((preset) => preset.id === canvasPreset) ?? CANVAS_PRESETS[0];
  }

  return CANVAS_PRESETS[0];
}

export function normalizeAppearanceSettings(
  input: Partial<AppearanceSettings> | null | undefined,
  fallbackShowPageNumber = DEFAULT_APPEARANCE_SETTINGS.showPageNumber
): AppearanceSettings {
  const canvasPreset = isCanvasPreset(input?.canvasPreset) ? input?.canvasPreset : DEFAULT_APPEARANCE_SETTINGS.canvasPreset;

  return {
    ...DEFAULT_APPEARANCE_SETTINGS,
    ...input,
    canvasPreset,
    showPageNumber: typeof input?.showPageNumber === 'boolean' ? input.showPageNumber : fallbackShowPageNumber,
    coverTitleSize: input?.coverTitleSize ?? null,
    bodyFontSize: input?.bodyFontSize ?? null,
    headingScale: input?.headingScale ?? null,
  };
}
