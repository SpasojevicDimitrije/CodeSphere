import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * CodeSphere data model — see DATA_MODEL.md.
 * Four models: Profile, Post (a "link"), Like, Comment.
 *
 * Auth: owner gets full CRUD on their own records; any authenticated user can
 * read (needed for the public feed + profile pages). `allow.owner()` adds an
 * implicit `owner` field automatically.
 */
const schema = a.schema({
  // One per user; created on first login (onboarding) with a chosen username.
  Profile: a
    .model({
      username: a.string().required(),
      bio: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  // A "link" post — represents blogs, GitHub repos, videos alike.
  Post: a
    .model({
      title: a.string().required(),
      url: a.string().required(),
      tag: a.string(),
      previewImage: a.string(), // best-effort OG image
      previewDescription: a.string(), // best-effort OG description
      authorUsername: a.string().required(), // denormalized for cheap feed render
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  // One per (user, post). Like = create; unlike = delete.
  Like: a
    .model({
      postId: a.id().required(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  // Flat comments (no threading).
  Comment: a
    .model({
      postId: a.id().required(),
      body: a.string().required(),
      authorUsername: a.string().required(), // denormalized
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
