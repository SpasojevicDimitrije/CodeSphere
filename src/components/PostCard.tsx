'use client';

import { useState } from 'react';
import Link from 'next/link';
import { domainOf, type FeedComment, type FeedPost } from '@/lib/types';
import { addComment, listComments, toggleLike } from '@/lib/posts';
import { useProfile } from './ProfileProvider';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function PostCard({ post, myId }: { post: FeedPost; myId: string }) {
  const profile = useProfile();
  const domain = domainOf(post.url);

  const [liked, setLiked] = useState(!!post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [busy, setBusy] = useState(false);

  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<FeedComment[] | null>(null);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [draft, setDraft] = useState('');

  async function onLike() {
    if (busy) return;
    // optimistic
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    setBusy(true);
    try {
      await toggleLike(post.id, myId, liked);
    } catch {
      // revert on failure
      setLiked(liked);
      setLikeCount((c) => c + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  async function onToggleComments() {
    const next = !open;
    setOpen(next);
    if (next && comments === null) {
      setComments(await listComments(post.id));
    }
  }

  async function onAddComment(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    const optimistic: FeedComment = {
      id: `tmp-${Date.now()}`,
      postId: post.id,
      body,
      authorUsername: profile.username,
      createdAt: new Date().toISOString(),
    };
    setComments((cs) => [...(cs ?? []), optimistic]);
    setCommentCount((c) => c + 1);
    try {
      const saved = await addComment(post.id, body, profile.username);
      setComments((cs) => (cs ?? []).map((c) => (c.id === optimistic.id ? saved : c)));
    } catch {
      setComments((cs) => (cs ?? []).filter((c) => c.id !== optimistic.id));
      setCommentCount((c) => c - 1);
    }
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      {post.previewImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.previewImage} alt="" className="h-40 w-full bg-slate-100 object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
          <span className="font-mono text-sm text-slate-400">{domain}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        {post.tag && (
          <span className="self-start rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            #{post.tag}
          </span>
        )}

        <a
          href={post.url}
          target="_blank"
          rel="noreferrer"
          className="line-clamp-2 font-semibold leading-snug text-slate-900 group-hover:text-indigo-700"
        >
          {post.title}
        </a>

        {post.previewDescription && (
          <p className="line-clamp-2 text-sm text-slate-500">{post.previewDescription}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 text-sm text-slate-500">
          <Link href={`/u/${post.authorUsername}`} className="flex items-center gap-2 hover:text-slate-900">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
              {post.authorUsername.charAt(0).toUpperCase()}
            </span>
            <span className="font-medium">{post.authorUsername}</span>
          </Link>
          <span className="text-xs text-slate-400">{timeAgo(post.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1 border-t border-slate-100 pt-3 text-sm">
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition hover:bg-slate-100 ${
              liked ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" /></svg>
            {likeCount}
          </button>
          <button
            onClick={onToggleComments}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
            {commentCount}
          </button>
          <span className="ml-auto font-mono text-xs text-slate-400">{domain}</span>
        </div>

        {open && (
          <div className="mt-2 border-t border-slate-100 pt-3">
            <div className="flex flex-col gap-2">
              {comments === null ? (
                <p className="text-sm text-slate-400">Loading…</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-slate-400">No comments yet. Be the first.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-medium text-slate-700">@{c.authorUsername}</span>{' '}
                    <span className="text-slate-600">{c.body}</span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={onAddComment} className="mt-3 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
              />
              <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}
