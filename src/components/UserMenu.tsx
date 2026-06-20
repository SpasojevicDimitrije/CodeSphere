'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';
import Link from 'next/link';
import { useProfile } from './ProfileProvider';

export default function UserMenu() {
  const { signOut } = useAuthenticator((c) => [c.signOut]);
  const profile = useProfile();

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/u/${profile.username}`}
        className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-500 text-xs font-bold text-white">
          {profile.username.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline">@{profile.username}</span>
      </Link>
      <button
        onClick={signOut}
        className="text-sm text-slate-400 hover:text-white"
      >
        Sign out
      </button>
    </div>
  );
}
