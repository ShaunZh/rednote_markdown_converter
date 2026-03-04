'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import { getRecentEdits, type RecentEditItem } from '../../lib/draftStorage';
import { SiteHeader } from '../../components/SiteHeader';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dateOnlyValue(iso: string): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return local.getTime();
}

export default function NotesPage() {
  const [notes, setNotes] = useState<RecentEditItem[]>([]);
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setNotes(getRecentEdits());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = startDate ? new Date(startDate).getTime() : null;
    const end = endDate ? new Date(endDate).getTime() : null;

    return notes
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .filter((item) => {
        if (q) {
          const hay = `${item.title} ${item.subtitle}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        const t = dateOnlyValue(item.updatedAt);
        if (start !== null && t < start) return false;
        if (end !== null && t > end) return false;
        return true;
      });
  }, [notes, query, startDate, endDate]);

  return (
    <main className="min-h-screen bg-[#f6f6f6] text-[#1f2329]">
      <SiteHeader />

      <div className="bg-[radial-gradient(#e7e7e7_1px,transparent_1px)] [background-size:26px_26px]">
        <div className="w-full px-6 py-6">
          <section className="rounded-3xl border border-[#e8e8e8] bg-[#efefef] p-6 md:p-7">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 mb-6">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">标题筛选</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <Search size={16} className="text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="输入标题关键词"
                    className="w-full text-sm outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">开始日期</label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <Calendar size={16} className="text-slate-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-sm outline-none text-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">结束日期</label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <Calendar size={16} className="text-slate-400" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-sm outline-none text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d8d8d8] bg-white/70 p-8 text-center">
                <p className="text-lg font-semibold mb-2">没有匹配的笔记</p>
                <p className="text-sm text-[#666] mb-4">尝试调整标题或日期筛选条件</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filtered.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-[#e6e6e6] bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-[#1a1a1a] truncate">{item.title || '未命名'}</h2>
                      {item.subtitle && (
                        <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">更新于 {formatDateTime(item.updatedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{item.pageCount}页</span>
                      <Link
                        href={`/draft?id=${encodeURIComponent(item.id)}`}
                        className="inline-flex items-center gap-2 rounded-full bg-black text-white px-3 py-2 text-xs font-semibold hover:bg-[#1d1d1d]"
                      >
                        打开编辑
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
