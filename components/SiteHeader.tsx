'use client';

import Link from 'next/link';
import { BookOpenText, PlusCircle } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="h-16 border-b border-[#e7e7e7] bg-white/90 backdrop-blur">
      <div className="h-full w-full px-6 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 mr-2 hover:opacity-90">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
            R
          </div>
          <span className="text-lg font-bold tracking-tight">RedNote Converter</span>
        </Link>

        <Link
          href="/draft"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2f2f2f] text-sm font-semibold hover:bg-[#f4f4f4]"
        >
          <PlusCircle size={18} />
          新建笔记
        </Link>
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2f2f2f] text-sm font-semibold hover:bg-[#f4f4f4]"
        >
          <BookOpenText size={18} />
          笔记管理
        </Link>
      </div>
    </header>
  );
}
