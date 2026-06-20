'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PostCard from './PostCard';
import { getMyId, listFeed, seedSamplePosts } from '@/lib/posts';
import type { FeedPost } from '@/lib/types';

export default function Feed({ filterUsername }: { filterUsername?: string }) {
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [myId, setMyId] = useState('');
  const [seeding, setSeeding] = useState(false);
  const seededRef = useRef(false);

  const load = useCallback(async () => {
    const id = await getMyId();
    setMyId(id);
    const all = await listFeed(id);
    setPosts(filterUsername ? all.filter((p) => p.authorUsername === filterUsername) : all);
  }, [filterUsername]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-seed the global feed the first time it's found empty, so every visitor
  // lands on a populated feed without anyone clicking a button. Never auto-seeds
  // a profile view (filterUsername), and only attempts once per mount.
  useEffect(() => {
    if (filterUsername || seededRef.current) return;
    if (posts && posts.length === 0) {
      seededRef.current = true;
      (async () => {
        setSeeding(true);
        try {
          await seedSamplePosts();
          await load();
        } finally {
          setSeeding(false);
        }
      })();
    }
  }, [posts, filterUsername, load]);

  if (posts === null || (seeding && !filterUsername)) {
    return <p className="py-12 text-center text-slate-500">Loading feed…</p>;
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 py-16 text-center">
        <p className="text-slate-400">
          {filterUsername ? 'No posts here yet.' : 'The feed is empty.'}
        </p>
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
