import React from 'react';
import { Check, Download, Lock } from 'lucide-react';

import type { CoverSettings } from '../CoverCard';
import { CANVAS_PRESETS, type AppearanceSettings } from '../../lib/appearanceSettings';
import { THEMES, type ThemeConfig } from '../../lib/themeConfig';
import { cn } from '../../lib/utils';

interface DraftSettingsSidebarProps {
  currentTheme: ThemeConfig;
  onThemeSelect: (theme: ThemeConfig) => void;
  coverSettings: CoverSettings;
  setCoverSettings: React.Dispatch<React.SetStateAction<CoverSettings>>;
  appearanceSettings: AppearanceSettings;
  onCanvasPresetChange: (canvasPreset: AppearanceSettings['canvasPreset']) => void;
  onShowPageNumberChange: (checked: boolean) => void;
  isExporting: boolean;
  exportProgress: { done: number; total: number } | null;
  isExportModalOpen: boolean;
  exportTargetCount: number;
  selectedExportCount: number;
  onSelectAll: () => void;
  onClearAll: () => void;
  onOpenExportModal: () => void;
  onExport: () => void;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function SettingSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <div className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-slate-900 peer-checked:after:translate-x-full after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white/10 after:bg-white after:transition-transform" />
      </label>
    </div>
  );
}

export function DraftSettingsSidebar({
  currentTheme,
  onThemeSelect,
  coverSettings,
  setCoverSettings,
  appearanceSettings,
  onCanvasPresetChange,
  onShowPageNumberChange,
  isExporting,
  exportProgress,
  isExportModalOpen,
  exportTargetCount,
  selectedExportCount,
  onSelectAll,
  onClearAll,
  onOpenExportModal,
  onExport,
}: DraftSettingsSidebarProps) {
  return (
    <aside className="w-[340px] border-l border-neutral-200 bg-[#f5f5f4] shrink-0 h-full flex flex-col">
      <div className="border-b border-neutral-200 bg-white px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">参数设置</h2>
            <p className="mt-1 text-xs text-slate-500">主题、封面和页面显示都统一放在这里调整。</p>
          </div>
          <button
            type="button"
            onClick={isExporting && !isExportModalOpen ? onOpenExportModal : onExport}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isExporting && isExportModalOpen}
          >
            <Download size={16} />
            <span>
              {isExporting
                ? exportProgress
                  ? `导出中 ${exportProgress.done}/${exportProgress.total}`
                  : '导出中'
                : '导出图片'}
            </span>
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {exportProgress && (
            <div className="space-y-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-150"
                  style={{ width: `${(exportProgress.done / exportProgress.total) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="tabular-nums">{exportProgress.done} / {exportProgress.total}</span>
                {isExporting && !isExportModalOpen && (
                  <button
                    type="button"
                    onClick={onOpenExportModal}
                    className="rounded-lg border border-neutral-300 px-2 py-1 text-slate-600 hover:bg-neutral-100"
                  >
                    查看进度
                  </button>
                )}
              </div>
            </div>
          )}

          {!isExporting && exportTargetCount > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-slate-600">
              <span className="tabular-nums">已选 {selectedExportCount}/{exportTargetCount}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="rounded-lg border border-neutral-300 bg-white px-2 py-1 hover:bg-neutral-100"
                >
                  全选
                </button>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="rounded-lg border border-neutral-300 bg-white px-2 py-1 hover:bg-neutral-100"
                >
                  清空
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Section title="风格主题" description="先决定这篇内容的整体视觉方向。">
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((theme) => {
              const isActive = currentTheme.id === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onThemeSelect(theme)}
                  className={cn(
                    'relative rounded-2xl border px-3 py-3 text-left transition-colors',
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-slate-700 hover:border-slate-300'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-2.5 w-2.5 rounded-full border border-black/10',
                        isActive && 'border-white/20'
                      )}
                      style={{ backgroundColor: theme.palette.accent }}
                    />
                    <span className="text-sm font-medium">{theme.name}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] opacity-75">
                    <span>{theme.type === 'pro' ? '进阶主题' : '免费主题'}</span>
                    {isActive ? <Check size={14} /> : theme.type === 'pro' ? <Lock size={14} /> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="封面信息" description="封面相关内容统一在这里配置。">
          <div className="space-y-3">
            <SettingSwitch
              label="启用封面页"
              checked={coverSettings.enabled}
              onChange={(checked) => setCoverSettings((prev) => ({ ...prev, enabled: checked }))}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                封面标题
              </label>
              <input
                type="text"
                value={coverSettings.title}
                onChange={(event) => setCoverSettings((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-900"
                placeholder="输入封面主标题"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                封面简介
              </label>
              <textarea
                rows={3}
                value={coverSettings.subtitle}
                onChange={(event) => setCoverSettings((prev) => ({ ...prev, subtitle: event.target.value }))}
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition-colors focus:border-slate-900"
                placeholder="输入封面副标题或说明"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                作者
              </label>
              <input
                type="text"
                value={coverSettings.author}
                onChange={(event) => setCoverSettings((prev) => ({ ...prev, author: event.target.value }))}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-900"
                placeholder="@你的昵称"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                封面版式
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['simple', '简约'],
                  ['modern', '现代'],
                  ['outline', '描边'],
                ] as const).map(([variant, label]) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setCoverSettings((prev) => ({ ...prev, variant }))}
                    className={cn(
                      'rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors',
                      coverSettings.variant === variant
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-neutral-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="外观参数" description="先保留当前已有的页面显示控制，后续再扩展尺寸和字号。">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              画布尺寸
            </label>
            <div className="grid grid-cols-1 gap-2">
              {CANVAS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onCanvasPresetChange(preset.id)}
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-3 py-3 text-sm transition-colors',
                    appearanceSettings.canvasPreset === preset.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-neutral-200 bg-white text-slate-700 hover:border-slate-300'
                  )}
                >
                  <span className="font-medium">{preset.label}</span>
                  <span className={cn('text-xs opacity-70', appearanceSettings.canvasPreset === preset.id && 'opacity-90')}>
                    {preset.width} x {preset.height}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <SettingSwitch
            label="显示页码"
            checked={appearanceSettings.showPageNumber}
            onChange={onShowPageNumberChange}
          />
          <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span className="font-medium">画布尺寸</span>
              <span className="text-slate-500">
                {CANVAS_PRESETS.find((preset) => preset.id === appearanceSettings.canvasPreset)?.label ?? appearanceSettings.canvasPreset}
              </span>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              下一步会把画布尺寸、字号滑块和标题缩放正式接进这个区域。
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-xs leading-5 text-slate-500">
            预留给后续参数：
            <span className="ml-1">画布尺寸、封面字号、正文字号、标题缩放。</span>
          </div>
        </Section>
      </div>
    </aside>
  );
}
