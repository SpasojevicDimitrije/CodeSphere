import Link from 'next/link';
import UserMenu from './UserMenu';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-black text-white">
            CS
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">CodeSphere</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/submit"
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + New post
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
