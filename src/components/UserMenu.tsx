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
        className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">
          {profile.username.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline">@{profile.username}</span>
      </Link>
      <button
        onClick={signOut}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        Sign out
      </button>
    </div>
  );
}
