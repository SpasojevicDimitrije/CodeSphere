import Header from '@/components/Header';
import Feed from '@/components/Feed';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Latest
        </h1>
        <Feed />
      </main>
    </div>
  );
}
