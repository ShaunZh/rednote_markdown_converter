'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  MoreHorizontal,
  PenLine,
  PenTool,
  PlusCircle,
  Send,
  Sparkles,
} from 'lucide-react';
import { getRecentEdits, type RecentEditItem } from '../lib/draftStorage';

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

function NoteCard({ item }: { item: RecentEditItem }) {
  const lines = previewLines(item.markdown);
  const left = lines.slice(0, 3);
  const right = lines.slice(3, 6);

  return (
    <article className="rounded-2xl bg-[#f3f3f3] border border-[#e6e6e6] p-3.5 md:p-4">
      <h3 className="text-lg md:text-xl font-semibold tracking-tight text-[#1a1a1a] mb-2.5 line-clamp-2">
        {item.title || '未命名'}
      </h3>

      <Link
        href={`/draft?id=${encodeURIComponent(item.id)}`}
        className="group relative block rounded-2xl border border-[#d9d9d9] bg-[#fafafa] p-2.5 mb-3.5 transition hover:shadow-md"
      >
        <div className="h-[170px] md:h-[190px] rounded-xl border border-[#e1e1e1] bg-[radial-gradient(#e3e3e3_0.8px,transparent_0.8px)] [background-size:14px_14px] p-2.5 overflow-hidden">
          <div className="grid grid-cols-2 gap-1.5 h-full">
            <div className="rounded-2xl bg-white/90 border border-[#ececec] p-2.5">
              {left.map((line, idx) => (
                <p key={`${item.id}-l-${idx}`} className="text-[10px] text-[#303030] leading-4 truncate">
                  {line}
                </p>
              ))}
            </div>
            <div className="rounded-2xl bg-white/90 border border-[#ececec] p-2.5">
              {right.map((line, idx) => (
                <p key={`${item.id}-r-${idx}`} className="text-[10px] text-[#303030] leading-4 truncate">
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
        <p className="text-xs">更新于 {formatDateTime(item.updatedAt)}</p>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-md p-2 hover:bg-[#ebebeb]">
            <Send size={15} />
          </button>
          <button type="button" className="rounded-md p-2 hover:bg-[#ebebeb]">
            <PenLine size={15} />
          </button>
          <button type="button" className="rounded-md p-2 hover:bg-[#ebebeb]">
            <MoreHorizontal size={15} />
          </button>
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

  const recentCards = useMemo(() => recent.slice(0, 6), [recent]);

  return (
    <main className="min-h-screen bg-[#f6f6f6] text-[#1f2329]">
      <header className="h-16 border-b border-[#e7e7e7] bg-white/90 backdrop-blur">
        <div className="h-full max-w-[1200px] mx-auto px-6 flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <div className="h-7 w-7 rounded-md bg-[#111] text-white grid place-items-center">
              <PenTool size={15} />
            </div>
            <span className="text-lg font-bold tracking-tight">UPlog</span>
          </div>

          <Link
            href="/draft"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2f2f2f] text-sm font-semibold hover:bg-[#f4f4f4]"
          >
            <PlusCircle size={18} />
            新建笔记
          </Link>
          <a
            href="#recent-edits"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2f2f2f] text-sm font-semibold hover:bg-[#f4f4f4]"
          >
            <BookOpenText size={18} />
            笔记管理
          </a>
        </div>
      </header>

      <div className="bg-[radial-gradient(#e7e7e7_1px,transparent_1px)] [background-size:26px_26px]">
        <div className="max-w-[1200px] mx-auto px-6 py-6 md:py-7">
          <h1 className="text-[26px] md:text-[32px] font-black tracking-tight mb-5">🎨 开始今天的创作吧 ~</h1>

          <section className="rounded-3xl border border-[#e3e3e3] bg-[#efefef] p-5 md:p-6 max-w-[620px] relative overflow-hidden mb-7">
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

          <section id="recent-edits" className="rounded-3xl border border-[#e8e8e8] bg-[#efefef] p-6 md:p-7">
            <h2 className="text-[30px] md:text-[34px] font-black tracking-tight mb-4">▍近期编辑</h2>

            {recentCards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d8d8d8] bg-white/70 p-8 text-center">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
                {recentCards.map((item) => (
                  <NoteCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
