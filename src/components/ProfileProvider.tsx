'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { client } from '@/lib/client';

type Profile = { id: string; username: string };

const ProfileContext = createContext<Profile | null>(null);

/** Current user's profile. Safe to use anywhere inside the authenticated app. */
export function useProfile(): Profile {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}

export default function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch THIS user's profile by id (= their Cognito sub). We can't use list()
    // because Profile has authenticated-read, so list() returns everyone's.
    (async () => {
      try {
        const { userId } = await getCurrentUser();
        const { data } = await client.models.Profile.get({ id: userId });
        if (data) setProfile({ id: data.id, username: data.username });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <CenteredMessage>Loading…</CenteredMessage>;
  }

  if (!profile) {
    return <OnboardingForm onDone={setProfile} />;
  }

  return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
}

function OnboardingForm({ onDone }: { onDone: (p: Profile) => void }) {
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (clean.length < 3) {
      setError('Username must be at least 3 characters (a–z, 0–9, _).');
      return;
    }
    setSaving(true);
    setError(null);
    const { userId } = await getCurrentUser();
    const { data, errors } = await client.models.Profile.create({ id: userId, username: clean });
    if (errors || !data) {
      setError('Could not save username. Try another.');
      setSaving(false);
      return;
    }
    onDone({ id: data.id, username: data.username });
  }

  return (
    <CenteredMessage>
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <h2 className="text-lg font-bold text-slate-100">Pick a username</h2>
        <p className="mt-1 text-sm text-slate-400">This is how other developers will see you.</p>
        <div className="mt-4 flex items-center rounded-lg border border-white/10 bg-slate-950/40 px-3 focus-within:border-violet-500">
          <span className="text-slate-500">@</span>
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ada_lovelace"
            className="w-full bg-transparent px-2 py-2 text-slate-100 placeholder:text-slate-500 outline-none"
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full rounded-lg bg-violet-500 py-2 font-semibold text-white transition hover:bg-violet-600 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </CenteredMessage>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-slate-500">{children}</div>
  );
}
