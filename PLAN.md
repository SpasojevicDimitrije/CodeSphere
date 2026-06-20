# CodeSphere — Phased Build Plan

Time budget: **~3–4 hours**. Each phase has a time box and a **verify** check. If a
phase runs over its box, cut the optional bits and move on — a deployed core loop beats
a perfect half-feature. Phases 0–6 are the core; Phase 7 (deploy) runs *continuously*,
not just at the end.

> Golden rule: **don't start Phase N+1 until Phase N's verify passes.**

---

## Phase 0 — Project + AWS skeleton  ⏱ ~30 min
**Goal:** Next.js app runs locally and an Amplify sandbox backend deploys.

1. `create-next-app` (App Router, TypeScript, Tailwind).
2. Init Amplify Gen 2 (`npm create amplify@latest`).
3. Start the cloud sandbox (`npx ampx sandbox`) — confirm it provisions in AWS.
4. Connect the Amplify client in the app (`Amplify.configure(outputs)`).

**Verify:** `npm run dev` serves a page; `ampx sandbox` shows a deployed backend in the
AWS console; no config errors in the browser console.

---

## Phase 1 — Auth (Cognito email/password)  ⏱ ~30 min
**Goal:** A user can sign up with a **username**, log in, and reach a protected area.

1. `defineAuth` with email login.
2. Add a **`preferredUsername`** (or custom `username`) signup attribute, required.
3. Wrap the app (or a `(app)` route group) in Amplify's `<Authenticator>`.
4. On first login, ensure a **`Profile`** record exists (username, owner). Create it
   lazily if missing.

**Verify:** Can register a new account with a username, log out, log back in, and the
feed route is gated behind auth. A `Profile` row exists for the user.

---

## Phase 2 — Data model + create post  ⏱ ~40 min
**Goal:** A logged-in user can submit a link and it persists in DynamoDB.

1. Define the schema (`Profile`, `Post`, `Like`, `Comment`) — see `DATA_MODEL.md`.
2. Deploy via sandbox; confirm tables exist.
3. Build a minimal **New Post** form: `title`, `url`, optional `tag`. Validate the URL.
4. On submit, create a `Post` owned by the current user.

**Verify:** Submitting the form creates a `Post` record (check the data/console); form
clears or redirects to the feed.

---

## Phase 3 — Feed + preview cards (THE HERO)  ⏱ ~30–40 min
**Goal:** A polished, populated, reverse-chronological feed of post cards.

1. Query posts newest-first; render a `PostCard` (author username, title, tag, domain,
   like count, comment count).
2. **Link previews (best-effort + fallback):** a server action / route handler fetches
   the URL's OpenGraph `image`/`description`. On any failure, fall back to domain +
   user-typed title. Wrap in try/catch; a bad URL must never throw.
3. **Seed the feed** with ~8–12 hand-picked dev links so it looks alive immediately.
4. Tailwind polish: clean card grid/list, spacing, hover, avatar/initial chip.

**Verify:** Feed shows seeded posts with preview images; a newly created post appears at
the top with a working (or gracefully-fallen-back) card. Looks demo-ready.

---

## Phase 4 — Likes  ⏱ ~20 min
**Goal:** Toggle a like; count updates instantly.

1. Like button on `PostCard`; create/delete a `Like` (one per user per post).
2. Optimistic UI: update the count immediately, reconcile on response.

**Verify:** Liking toggles state and the count moves without a visible delay; refresh
preserves it.

---

## Phase 5 — Comments  ⏱ ~25 min
**Goal:** Flat comments on a post.

1. Post detail view (or expandable card) showing comments + an add-comment form.
2. Create a `Comment`; render newest list; optimistic append.

**Verify:** Adding a comment shows it immediately and it persists on refresh; comment
count on the card reflects it.

---

## Phase 6 — Basic profile  ⏱ ~15 min
**Goal:** `/u/[username]` lists that user's posts.

1. Make usernames/avatars in cards link to the profile route.
2. Profile page: username header + that user's posts (reuse `PostCard`).

**Verify:** Clicking a username opens their profile and shows only their posts.

---

## Phase 7 — Deploy to AWS Amplify Hosting  ⏱ continuous, finalize ~20 min
**Goal:** The whole thing is live on a public AWS URL.

1. Push the repo to GitHub; connect it in **Amplify Hosting** for CI/CD **early**
   (ideally right after Phase 1) so deploy issues surface early.
2. Ensure the backend (auth/data) is deployed to a real branch environment, not just a
   personal sandbox.
3. Final smoke test on the live URL: full demo loop end-to-end.

**Verify:** On the public URL, a fresh user can complete the Definition of Done loop
from `CLAUDE.md`.

---

## Stretch (only if core is deployed & green)
In priority order — do not start until Phase 7 verify passes:
1. **Tags filter** — clickable tag chips filter the feed.
2. **Sort by likes** — toggle between "New" and "Top".
3. **Follows** — `Follow` model + a "Following" feed filter.
4. **Image posts** — S3 upload via Amplify Storage; render in card.
5. **Shares/reposts** — repost to your profile.

## Time-pressure fallbacks (when behind)
- OG fetch flaky → ship seed-only cards (title + tag + domain), skip live fetch.
- Comments slow → make them read-only on seed data + one live add.
- Deploy fighting you → demo from the most recent green deploy; keep one always-live.
- Anything else stuck > 10 min → stub/fake/cut and note it. Protect the loop.
