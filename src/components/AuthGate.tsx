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
                src="/logo-v2.png"
                alt="CodeSphere"
                width={112}
                height={112}
                priority
                className="h-28 w-28"
              />
              <span className="mt-2 text-2xl font-bold tracking-tight text-slate-100">CodeSphere</span>
              <p className="mt-1 text-sm text-slate-400">Connect. Share. Code.</p>
            </div>
          );
        },
      }}
    >
      {() => <ProfileProvider>{children}</ProfileProvider>}
    </Authenticator>
  );
}
