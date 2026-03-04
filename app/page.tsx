'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, PenLine, Send, Sparkles } from 'lucide-react';
import { deleteRecentEdit, getRecentEdits, type RecentEditItem } from '../lib/draftStorage';
import { SiteHeader } from '../components/SiteHeader';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function previewLines(markdown: string): string[] {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.replace(/^#+\s*/, '').trim())
    .filter(Boolean);
  return lines.slice(0, 6);
}

function NoteCard({ item, onDelete }: { item: RecentEditItem; onDelete: (id: string) => void }) {
  const lines = previewLines(item.markdown);
  const left = lines.slice(0, 3);
  const right = lines.slice(3, 6);

  return (
    <article className="rounded-2xl bg-white border border-[#e6e6e6] p-4 shadow-sm">
      <h3 className="text-base md:text-lg font-semibold tracking-tight text-[#1a1a1a] mb-3 line-clamp-2">
        {item.title || '未命名'}
      </h3>

      <Link
        href={`/draft?id=${encodeURIComponent(item.id)}`}
        className="group relative block rounded-2xl border border-[#e3e3e3] bg-[#fafafa] p-3 mb-4 transition hover:shadow-md"
      >
        <div className="h-[220px] md:h-[240px] rounded-xl border border-[#e1e1e1] bg-[linear-gradient(#e8e8e8_1px,transparent_1px),linear-gradient(90deg,#e8e8e8_1px,transparent_1px)] [background-size:18px_18px] p-3 overflow-hidden">
          <div className="grid grid-cols-2 gap-2 h-full">
            <div className="rounded-2xl bg-white/90 border border-[#ececec] p-3">
              {left.map((line, idx) => (
                <p key={`${item.id}-l-${idx}`} className="text-[11px] text-[#303030] leading-5 truncate">
                  {line}
                </p>
              ))}
            </div>
            <div className="rounded-2xl bg-white/90 border border-[#ececec] p-3">
              {right.map((line, idx) => (
                <p key={`${item.id}-r-${idx}`} className="text-[11px] text-[#303030] leading-5 truncate">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        <span className="absolute right-4 bottom-4 rounded-lg bg-black/65 px-2 py-1 text-white text-xs/none">
          {Math.max(item.pageCount, 1)}页
        </span>
      </Link>

      <div className="flex items-center justify-between text-[#8a8a8a]">
        <p className="text-sm">更新于 {formatDateTime(item.updatedAt)}</p>
        <div className="flex items-center gap-1 rounded-full border border-[#ededed] bg-[#f7f7f7] px-2 py-1">
          <button type="button" className="rounded-md p-1.5 hover:bg-[#ebebeb]">
            <Send size={15} />
          </button>
          <span className="h-3 w-px bg-[#e3e3e3]" />
          <button type="button" className="rounded-md p-1.5 hover:bg-[#ebebeb]">
            <PenLine size={15} />
          </button>
          <span className="h-3 w-px bg-[#e3e3e3]" />
          <div className="relative group/menu">
            <button type="button" className="rounded-md p-1.5 hover:bg-[#ebebeb]">
              <MoreHorizontal size={15} />
            </button>
            <div className="absolute right-0 top-full hidden h-2 w-[88px] group-hover/menu:block group-focus-within/menu:block" />
            <div className="absolute right-0 top-[calc(100%+2px)] hidden min-w-[88px] flex-col gap-1 rounded-xl border border-[#e7e7e7] bg-white p-1.5 shadow-lg group-hover/menu:flex group-focus-within/menu:flex">
              <Link
                href={`/draft?id=${encodeURIComponent(item.id)}`}
                className="rounded-lg px-2 py-1.5 text-xs text-[#303030] hover:bg-[#f2f2f2]"
              >
                导出
              </Link>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="rounded-lg px-2 py-1.5 text-left text-xs text-[#d43838] hover:bg-[#fff0f0]"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [recent, setRecent] = useState<RecentEditItem[]>([]);

  useEffect(() => {
    setRecent(getRecentEdits());
  }, []);

  const recentCards = useMemo(() => recent.slice(0, 4), [recent]);

  const handleDelete = (id: string) => {
    if (!window.confirm('确认删除这条历史记录吗？')) return;
    deleteRecentEdit(id);
    setRecent(getRecentEdits());
  };

  return (
    <main className="h-screen bg-[#f6f6f6] text-[#1f2329] flex flex-col overflow-hidden">
      <SiteHeader />

      <div className="flex-1 min-h-0 overflow-hidden bg-[radial-gradient(#e7e7e7_1px,transparent_1px)] [background-size:26px_26px]">
        <div className="w-full h-full px-6 py-6 md:py-7 flex flex-col">
          <h1 className="text-[26px] md:text-[32px] font-black tracking-tight mb-5">🎨 开始今天的创作吧 ~</h1>

          <section className="rounded-3xl border border-[#e3e3e3] bg-[#efefef] p-5 md:p-6 max-w-[620px] relative overflow-hidden mb-6 shrink-0">
            <p className="text-[19px] md:text-[21px] font-black tracking-tight mb-3">🌟 创建笔记图片</p>
            <p className="text-[14px] md:text-[15px] leading-relaxed text-[#2f2f2f] mb-5 max-w-[88%]">
              让每一篇内容，都以更清晰、更好看的方式被呈现
            </p>
            <Link
              href="/draft"
              className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-[14px] font-semibold hover:bg-[#1d1d1d]"
            >
              开始创作
              <span className="text-[16px] leading-none">↗</span>
            </Link>

            <div className="pointer-events-none absolute right-4 bottom-3 text-[32px] leading-none opacity-40">
              ✏
            </div>
          </section>

          <section id="recent-edits" className="rounded-3xl border border-[#e8e8e8] bg-white p-6 md:p-7 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-5 shrink-0">
              <div className="flex items-center gap-3">
                <span className="h-5 w-1.5 rounded-full bg-black" />
                <h2 className="text-[20px] md:text-[22px] font-semibold tracking-tight">近期编辑</h2>
              </div>
              <Link href="/notes" className="text-sm text-[#666] hover:text-[#111] inline-flex items-center gap-1">
                全部
                <span className="text-base leading-none">›</span>
              </Link>
            </div>

            {recentCards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d8d8d8] bg-[#fafafa] p-8 text-center">
                <p className="text-lg font-semibold mb-2">还没有历史笔记</p>
                <p className="text-sm text-[#666] mb-4">在编辑器中保存后会自动出现在这里</p>
                <Link
                  href="/draft"
                  className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2.5 text-xs font-semibold"
                >
                  <Sparkles size={15} />
                  去创建第一篇
                </Link>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                  {recentCards.map((item) => (
                    <NoteCard key={item.id} item={item} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
