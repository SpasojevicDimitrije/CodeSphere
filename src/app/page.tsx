import Header from '@/components/Header';
import Feed from '@/components/Feed';

export default function Home() {
  return (
    <div className="min-h-full bg-slate-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Latest
        </h1>
        <Feed />
      </main>
    </div>
  );
}
