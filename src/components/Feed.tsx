'use client';

import { useCallback, useEffect, useState } from 'react';
import PostCard from './PostCard';
import { getMyId, listFeed, seedSamplePosts } from '@/lib/posts';
import type { FeedPost } from '@/lib/types';

export default function Feed({ filterUsername }: { filterUsername?: string }) {
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [myId, setMyId] = useState('');
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    const id = await getMyId();
    setMyId(id);
    const all = await listFeed(id);
    setPosts(filterUsername ? all.filter((p) => p.authorUsername === filterUsername) : all);
  }, [filterUsername]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSeed() {
    setSeeding(true);
    await seedSamplePosts();
    await load();
    setSeeding(false);
  }

  if (posts === null) {
    return <p className="py-12 text-center text-slate-400">Loading feed…</p>;
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
        <p className="text-slate-500">
          {filterUsername ? 'No posts here yet.' : 'The feed is empty.'}
        </p>
        {!filterUsername && (
          <button
            onClick={onSeed}
            disabled={seeding}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {seeding ? 'Adding…' : 'Add sample posts'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} myId={myId} />
      ))}
    </div>
  );
}
