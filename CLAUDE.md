# CodeSphere — CLAUDE.md

A developer social network in the spirit of **daily.dev**: a feed where developers
share links (blogs, GitHub repos, videos), and others like and comment.

> **This is a 3–4 hour hackathon build.** Speed and a working *deployed* demo beat
> completeness. Every decision below exists to protect the demo. Do not add scope.

> **📍 PROGRESS / CURRENT STATE:** The core app is built and verified end-to-end against
> the live AWS backend. See the **"Progress Log"** section at the bottom of this file for
> exactly what was done, the current state, environment details, and the remaining step
> (deploy frontend to Amplify Hosting). Read it first if you are picking this up fresh.

---

## The One Rule

**Protect the hero: a polished, populated feed + the post flow.**
`sign up → post a link → it appears at the top of the feed → like it → comment.`

If a task does not move that loop forward (or make it look good), it is out of scope
until the core loop is fully working and deployed.

---

## Stack (locked — do NOT change or "improve")

| Concern   | Choice                                                        |
|-----------|---------------------------------------------------------------|
| Framework | **Next.js (App Router) + TypeScript**                         |
| Styling   | **Tailwind CSS**                                               |
| Backend   | **AWS Amplify Gen 2** (everything is AWS)                      |
| Auth      | **Cognito email/password** via Amplify `<Authenticator>`      |
| Data      | **Amplify Data** (AppSync + DynamoDB), schema in TS           |
| Storage   | **S3** via Amplify Storage (stretch only — image uploads)     |
| Hosting   | **AWS Amplify Hosting** (Git-connected CI/CD) — must be live  |

**No Supabase. No Firebase. No raw CloudFormation/CDK hand-wiring.** Use Amplify's
managed primitives. If something isn't trivially expressible in Amplify Gen 2, cut it.

Verify exact Amplify Gen 2 commands/APIs against current docs (use context7 / the
`supabase`-style up-to-date docs flow) before relying on memory — Amplify's API moves.

---

## Scope

### In (core build — must work and be deployed)
- Email/password auth (Cognito). **Username chosen at signup**, stored on a `Profile`.
- Create a **post** = `title + url + optional tag`. One post type ("link") represents
  blogs, GitHub repos, and videos alike.
- **Feed**: reverse-chronological cards, **pre-seeded** so it's never empty on stage.
- **Link preview cards**: best-effort OG image/description fetch, **with fallback** to
  domain + user-typed title. A failed fetch must never break a card.
- **Likes**: toggle + count, optimistic UI.
- **Comments**: flat (non-threaded) list + add form on a post.
- **Basic profile**: `/u/[username]` read-only page listing that user's posts.

### Stretch (only after core is deployed and working, in this order)
1. Tags/topics filter on the feed.
2. Sort feed by likes.
3. Follows (+ "Following" feed filter).
4. Image upload posts to S3.
5. Shares / reposts.

### Explicitly cut (do not build)
- GitHub/Google/social login (Cognito email/password only).
- Threaded/nested comments, notifications, search, DMs, moderation, infinite scroll,
  pagination, dark/light toggle, settings pages, edit/delete flows beyond the minimum.

---

## Working Guidelines (hackathon mode)

- **Ship the vertical slice first**, then widen. Get one post end-to-end (create →
  feed → like → comment) before polishing any single screen.
- **Deploy early, deploy often.** A broken deploy discovered at hour 3 loses the demo.
  Get *something* live in Phase 0–1, not at the end.
- **Seed data is a feature.** The feed must look alive in the demo. Maintain a seed
  script / seed records from the start.
- Optimistic UI for likes/comments — never make the demo wait on a round-trip.
- Keep components dumb and colocated. No premature abstraction, no shared "design
  system", no state-management library. Local state + Amplify client is enough.
- Match existing style; make surgical changes. Don't refactor working code.
- When blocked > ~10 min on infra, **fall back**: stub it, fake it for the demo, or
  cut it. Note the cut; move on. The clock is the enemy.

## Definition of Done (core)
A judge can, on the **deployed AWS URL**: sign up with a username, see a rich seeded
feed, submit a link that appears at the top with a preview card, like it (count moves),
and add a comment that shows up. Clicking a username shows that user's posts.

See `PLAN.md` for the phase-by-phase build order and `DATA_MODEL.md` for the schema.

---

# Progress Log (READ THIS IF PICKING UP FRESH)

_Last updated after the initial build session. The core app is **done and verified
end-to-end in a real browser** against the live AWS backend. The only remaining core
item is deploying the frontend to Amplify Hosting (interactive console step)._

## Current status by phase
- Phase 0 — Next.js + Amplify scaffold ........ ✅ done
- Phase 1 — Cognito auth + username onboarding . ✅ done (+ auto-confirm trigger)
- Phase 2 — Data model + create post .......... ✅ done
- Phase 3 — Feed + OG previews + seed .......... ✅ done
- Phase 4 — Likes (optimistic, persists) ...... ✅ done
- Phase 5 — Comments ........................... ✅ done
- Phase 6 — Basic profiles (/u/[username]) ..... ✅ done
- Phase 7 — Deploy frontend to Amplify Hosting . ⏳ NOT DONE (see "Remaining" below)

## Environment / AWS facts (needed to continue)
- AWS account: **186219258031**, region: **eu-north-1**.
- AWS CLI profile: **`hackathon`** (static keys in `~/.aws`, has **AdministratorAccess**).
  The `aws` CLI binary is NOT installed in the shell; Amplify reads creds from `~/.aws`.
- Always run backend commands with: `AWS_PROFILE=hackathon AWS_REGION=eu-north-1 …`
- **CDK is already bootstrapped** in eu-north-1 (one-time, done).
- Backend is deployed via **sandbox** (identifier `dimitrijespasojevic`). Redeploy/run with:
  `AWS_PROFILE=hackathon AWS_REGION=eu-north-1 npx ampx sandbox` (add `--once` to deploy and exit).
- `amplify_outputs.json` is generated by the sandbox deploy and is **gitignored**. It must
  exist locally for `npm run dev` to work. If missing, run the sandbox command above.

## Step-by-step of what was done (chronological)
1. Wrote planning docs: `CLAUDE.md`, `PLAN.md`, `DATA_MODEL.md` (via a requirements grill).
2. Scaffolded Next.js 16 (App Router, TS, Tailwind v4, `src/` dir) at repo root.
3. Initialized Amplify Gen 2 (`npm create amplify@latest`) → `amplify/` folder.
4. Defined backend: `amplify/auth/resource.ts` (email login) and `amplify/data/resource.ts`
   (Profile, Post, Like, Comment; `userPool` default auth; `allow.owner()` +
   `allow.authenticated().to(['read'])`).
5. First sandbox deploy FAILED: the IAM user lacked permissions. User attached
   **AdministratorAccess**. Then region needed **CDK bootstrap** — ran
   `npx cdk bootstrap aws://186219258031/eu-north-1`. Re-deployed → SUCCESS.
6. Built the frontend (all client-side data via the Amplify Data client):
   - `src/components/ConfigureAmplify.tsx` — runs `Amplify.configure(outputs)`.
   - `src/lib/client.ts` — `generateClient<Schema>()`.
   - `src/components/AuthGate.tsx` — `<Authenticator>` gates the whole app.
   - `src/components/ProfileProvider.tsx` — loads the current user's Profile by id;
     if none, shows a username **onboarding** form (creates the Profile).
   - `src/components/Header.tsx` + `UserMenu.tsx` — brand, "+ New post", username, sign out.
   - `src/components/Feed.tsx` — loads live posts; empty-state "Add sample posts" seeder.
   - `src/components/PostCard.tsx` — card with like toggle (optimistic) + inline comments.
   - `src/app/page.tsx` (feed), `src/app/submit/page.tsx` (create post),
     `src/app/u/[username]/page.tsx` (profile).
   - `src/lib/posts.ts` — data access: listFeed, toggleLike, listComments, addComment,
     createPost (calls OG route), seedSamplePosts.
   - `src/app/api/og/route.ts` — best-effort OpenGraph fetch (4s timeout, never throws).
   - `src/lib/seed.ts` / `src/lib/types.ts` — seed content + UI types.
7. Added a **pre-sign-up trigger** (`amplify/auth/pre-sign-up/`) that auto-confirms users
   so signup is instant (no email code). Redeployed sandbox.
8. **Verified end-to-end with Playwright** (headless Chromium against `localhost:3000`):
   signup → onboarding → feed → "Add sample posts" (8 posts) → like (count moves &
   persists on reload) → comment (renders) → profile page. All pass, no console errors.
9. **Bug found & fixed during testing:** `ProfileProvider` used `Profile.list()[0]`, but
   `authenticated`-read makes `list()` return ALL profiles, so every new user inherited
   the first profile and skipped onboarding. Fixed by keying Profile `id` to the Cognito
   `sub` and using `Profile.get({ id: userId })` (create also passes `id: userId`).
10. Committed + pushed to GitHub: `SpasojevicDimitrije/CodeSphere`, branch `main`
    (commit `083bc3d`). Added `amplify.yml` (Gen 2 Hosting build spec).

## Deviations from the original plan (intentional)
- Username is collected via an **onboarding form** (ProfileProvider), NOT a Cognito signup
  attribute — simpler and avoids fragile attribute config.
- Added an **auto-confirm pre-sign-up trigger** — removes the email-verification step for a
  frictionless demo. (Tradeoff: anyone can sign up without verifying email. Fine for a demo.)
- The **entire app is gated behind auth** (no public feed) — simplest and matches the plan's
  "feed gated behind auth" verify.

## Known loose ends / notes
- `src/lib/posts.ts` `addComment` has a `console.error(...)` debug line on failure — harmless,
  can be removed.
- Seed posts are created as **real records owned by the current user** but display a varied
  `authorUsername` (denormalized). The "Add sample posts" button appears only when the feed
  is empty. The deployed `main` backend starts with EMPTY tables (separate from the sandbox),
  so on the live site click "Add sample posts" once (or pre-seed) so the feed isn't empty.

## Remaining: deploy frontend to AWS Amplify Hosting (Phase 7)
Interactive console step (GitHub OAuth can't be automated from the shell):
1. AWS Console → **Amplify**, region **eu-north-1**.
2. **Create new app → Deploy with GitHub** → authorize → pick `SpasojevicDimitrije/CodeSphere`,
   branch `main`.
3. It detects Next.js + `amplify.yml`. When asked, let it **create the default Amplify service
   role** (admin account allows this) — this role runs `ampx pipeline-deploy`.
4. Save and deploy. First build ~8 min; deploys a fresh `main` backend (CDK already
   bootstrapped) + the Next.js frontend → public `https://main.<id>.amplifyapp.com`.
5. On the live URL: sign up (instant) → pick username → "Add sample posts" → like/comment.
   If the build fails it's usually the service role or build spec — read the Amplify build log.

## How to run locally (for the next agent)
1. Ensure backend outputs exist: if `amplify_outputs.json` is missing, run
   `AWS_PROFILE=hackathon AWS_REGION=eu-north-1 npx ampx sandbox --once`.
2. `npm run dev` → http://localhost:3000.
3. To re-verify, drive it with Playwright (headless Chromium is installed) — sign up a NEW
   email each run (auto-confirm means no email step), then exercise the loop.
