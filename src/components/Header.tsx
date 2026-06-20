import Image from 'next/image';
import Link from 'next/link';
import UserMenu from './UserMenu';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0B1020]/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="CodeSphere"
            width={36}
            height={36}
            priority
            className="h-9 w-9"
          />
          <span className="text-lg font-bold tracking-tight text-slate-100">CodeSphere</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/submit"
            className="rounded-lg bg-violet-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-violet-600"
          >
            + New post
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
