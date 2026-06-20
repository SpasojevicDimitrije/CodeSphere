'use client';

import { use } from 'react';
import Header from '@/components/Header';
import Feed from '@/components/Feed';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  return (
    <div className="min-h-full bg-slate-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-indigo-600 text-lg font-bold text-white">
            {username.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">@{username}</h1>
            <p className="text-sm text-slate-500">Posts by this developer</p>
          </div>
        </div>
        <Feed filterUsername={username} />
      </main>
    </div>
  );
}
