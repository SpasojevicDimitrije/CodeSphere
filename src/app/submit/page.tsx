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
    <div className="min-h-full bg-slate-50">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-xl font-bold text-slate-900">Share a link</h1>
        <p className="mt-1 text-sm text-slate-500">A blog, a GitHub repo, a video — anything worth a developer&apos;s time.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is it?"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Tag <span className="text-slate-400">(optional)</span></span>
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="ai, rust, frontend…"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </form>
      </main>
    </div>
  );
}
