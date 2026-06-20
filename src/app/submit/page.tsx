'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useProfile } from '@/components/ProfileProvider';
import { createPost } from '@/lib/posts';

export default function SubmitPage() {
  const profile = useProfile();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tag, setTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      new URL(url);
    } catch {
      setError('Enter a valid URL (including https://).');
      return;
    }
    if (title.trim().length < 3) {
      setError('Give it a title.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createPost({
        title: title.trim(),
        url: url.trim(),
        tag: tag.trim().replace(/^#/, '') || undefined,
        authorUsername: profile.username,
      });
      router.push('/');
    } catch {
      setError('Something went wrong. Try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <h1 className="text-xl font-bold text-slate-100">Share a link</h1>
        <p className="mt-1 text-sm text-slate-400">A blog, a GitHub repo, a video — anything worth a developer&apos;s time.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-300">URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-300">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is it?"
              className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-300">Tag <span className="text-slate-500">(optional)</span></span>
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="ai, rust, frontend…"
              className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-violet-500 py-2.5 font-semibold text-white transition hover:bg-violet-600 disabled:opacity-50"
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </form>
      </main>
    </div>
  );
}
