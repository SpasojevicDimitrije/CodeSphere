# CodeSphere — Data Model (Amplify Gen 2 / DynamoDB)

Defined in `amplify/data/resource.ts` via Amplify Data (`a.schema`). Keep it minimal —
four models. Authorization uses Amplify's `owner` + `authenticated`/`guest` rules.

> Verify exact `a.*` API and auth-rule syntax against current Amplify Gen 2 docs before
> coding — the API evolves.

## Models

### Profile
One per user; created lazily on first login. Holds the chosen username.
- `username: string` (required, unique-ish — enforced in app, not DDB)
- `owner` — Cognito user (set automatically by owner auth)
- Auth: `owner` can create/update; **any authenticated user can read** (needed for feed
  author names + profile pages).

### Post  (a "link" — covers blogs, repos, videos)
- `title: string` (required)
- `url: string` (required)
- `tag: string` (optional)
- `previewImage: string` (optional — OG image URL, best-effort)
- `previewDescription: string` (optional — OG description)
- `authorUsername: string` (denormalized for cheap feed rendering)
- `owner`
- Auth: `owner` create/update/delete; **authenticated read** (public feed).

### Like
One per (user, post). Liking = create; unliking = delete.
- `postId: string` (required)
- `owner`
- Auth: `owner` create/delete; **authenticated read** (for counts).
- App enforces one like per user per post.

### Comment  (flat — no threading)
- `postId: string` (required)
- `body: string` (required)
- `authorUsername: string` (denormalized)
- `owner`
- Auth: `owner` create/delete; **authenticated read**.

## Notes & shortcuts (hackathon)
- **Denormalize `authorUsername`** onto Post/Comment so the feed doesn't need joins or
  N+1 Profile lookups. Cheap, fast, demo-friendly.
- **Counts:** compute like/comment counts client-side from queried records for the MVP.
  If lists get large (they won't at demo scale), revisit — don't pre-optimize now.
- **Feed ordering:** newest-first. Sort client-side on `createdAt` for the MVP; a real
  GSI/secondary index is a stretch concern, not a 3-hour concern.
- **Uniqueness** (username, one-like-per-post) is enforced in app logic, not the DB.
  Acceptable for a demo.
- **Seed data:** insert ~8–12 `Post` records (with `previewImage`) + a couple seed
  Profiles via a small script or the Amplify data console so the feed is never empty.

## Stretch additions (only if core is done)
- `Follow { followerUsername, followeeUsername, owner }` for the social graph.
- `Post.imageKey: string` for S3-hosted image posts.
- GSI on `tag` / `createdAt` if filtering or sorting needs server-side support.
