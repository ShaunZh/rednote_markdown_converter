import Link from 'next/link';

export function DraftTopBar() {
  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
      <Link href="/" className="flex items-center gap-2 hover:opacity-90">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
          R
        </div>
        <h1 className="font-bold text-xl tracking-tight hidden sm:block">小红书 Markdown 转图器</h1>
      </Link>

      <div className="hidden sm:flex items-center gap-3 text-sm text-slate-500">
        <span>编辑区</span>
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <span>预览区</span>
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <span>参数设置</span>
      </div>
    </header>
  );
}
