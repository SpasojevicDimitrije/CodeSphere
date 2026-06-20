# CodeSphere — CLAUDE.md

A developer social network in the spirit of **daily.dev**: a feed where developers
share links (blogs, GitHub repos, videos), and others like and comment.

> **This is a 3–4 hour hackathon build.** Speed and a working *deployed* demo beat
> completeness. Every decision below exists to protect the demo. Do not add scope.

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
