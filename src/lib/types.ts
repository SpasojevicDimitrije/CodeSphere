// UI-facing shapes. These mirror the Amplify Data models (see DATA_MODEL.md) but are
// kept separate so presentational components don't depend on the generated client.

export type FeedPost = {
  id: string;
  title: string;
  url: string;
  tag?: string | null;
  previewImage?: string | null;
  previewDescription?: string | null;
  authorUsername: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe?: boolean;
};

export type FeedComment = {
  id: string;
  postId: string;
  body: string;
  authorUsername: string;
  createdAt: string;
};

/** Pull a clean display domain out of a URL for the card's source label. */
export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
