'use client';

import { getCurrentUser } from 'aws-amplify/auth';
import { client } from './client';
import { SEED_POSTS } from './seed';
import type { FeedComment, FeedPost } from './types';

/** Current user's Cognito sub — used to detect which likes are mine. */
export async function getMyId(): Promise<string> {
  const u = await getCurrentUser();
  return u.userId;
}

/** Load the feed with like/comment counts assembled client-side (fine at demo scale). */
export async function listFeed(myId: string): Promise<FeedPost[]> {
  const [posts, likes, comments] = await Promise.all([
    client.models.Post.list(),
    client.models.Like.list(),
    client.models.Comment.list(),
  ]);

  const likeByPost = new Map<string, { count: number; mine: boolean }>();
  for (const l of likes.data) {
    const e = likeByPost.get(l.postId) ?? { count: 0, mine: false };
    e.count++;
    if ((l.owner ?? '').includes(myId)) e.mine = true;
    likeByPost.set(l.postId, e);
  }

  const commentCount = new Map<string, number>();
  for (const c of comments.data) {
    commentCount.set(c.postId, (commentCount.get(c.postId) ?? 0) + 1);
  }

  return posts.data
    .map((p) => ({
      id: p.id,
      title: p.title,
      url: p.url,
      tag: p.tag,
      previewImage: p.previewImage,
      previewDescription: p.previewDescription,
      authorUsername: p.authorUsername,
      createdAt: p.createdAt,
      likeCount: likeByPost.get(p.id)?.count ?? 0,
      commentCount: commentCount.get(p.id) ?? 0,
      likedByMe: likeByPost.get(p.id)?.mine ?? false,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Toggle the current user's like on a post. Returns the new liked state. */
export async function toggleLike(postId: string, myId: string, currentlyLiked: boolean): Promise<boolean> {
  if (currentlyLiked) {
    const { data } = await client.models.Like.list({ filter: { postId: { eq: postId } } });
    const mine = data.find((l) => (l.owner ?? '').includes(myId));
    if (mine) await client.models.Like.delete({ id: mine.id });
    return false;
  }
  await client.models.Like.create({ postId });
  return true;
}

export async function listComments(postId: string): Promise<FeedComment[]> {
  const { data } = await client.models.Comment.list({ filter: { postId: { eq: postId } } });
  return data
    .map((c) => ({
      id: c.id,
      postId: c.postId,
      body: c.body,
      authorUsername: c.authorUsername,
      createdAt: c.createdAt,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function addComment(postId: string, body: string, authorUsername: string): Promise<FeedComment> {
  const { data, errors } = await client.models.Comment.create({ postId, body, authorUsername });
  if (errors || !data) {
    console.error('Comment.create failed:', JSON.stringify(errors));
    throw new Error('Failed to add comment');
  }
  return { id: data.id, postId: data.postId, body: data.body, authorUsername: data.authorUsername, createdAt: data.createdAt };
}

type NewPost = { title: string; url: string; tag?: string; authorUsername: string };

export async function createPost(input: NewPost): Promise<void> {
  let previewImage: string | undefined;
  let previewDescription: string | undefined;
  try {
    const res = await fetch(`/api/og?url=${encodeURIComponent(input.url)}`);
    if (res.ok) {
      const og = await res.json();
      previewImage = og.image ?? undefined;
      previewDescription = og.description ?? undefined;
    }
  } catch {
    // best-effort only — a failed OG fetch must never block posting
  }

  const { errors } = await client.models.Post.create({
    title: input.title,
    url: input.url,
    tag: input.tag || undefined,
    previewImage,
    previewDescription,
    authorUsername: input.authorUsername,
  });
  if (errors) throw new Error('Failed to create post');
}

/** One-click sample data so the feed is never empty for the demo. */
export async function seedSamplePosts(): Promise<void> {
  for (const s of SEED_POSTS) {
    await client.models.Post.create({
      title: s.title,
      url: s.url,
      tag: s.tag || undefined,
      previewImage: s.previewImage || undefined,
      previewDescription: s.previewDescription || undefined,
      authorUsername: s.authorUsername,
    });
  }
}
