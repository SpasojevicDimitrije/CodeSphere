'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Image from 'next/image';
import ProfileProvider from './ProfileProvider';

/**
 * Gates the whole app behind Cognito email/password auth, then ensures the
 * signed-in user has a Profile (username) before rendering anything.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator
      components={{
        Header() {
          return (
            <div className="flex flex-col items-center pb-6 pt-8">
              <Image
                src="/logo.png"
                alt="CodeSphere"
                width={96}
                height={96}
                priority
                className="h-24 w-24 rounded-2xl shadow-lg shadow-violet-500/20"
              />
              <p className="mt-3 text-sm text-slate-400">Connect. Share. Code.</p>
            </div>
          );
        },
      }}
    >
      {() => <ProfileProvider>{children}</ProfileProvider>}
    </Authenticator>
  );
}
