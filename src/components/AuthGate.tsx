'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import ProfileProvider from './ProfileProvider';

/**
 * Gates the whole app behind Cognito email/password auth, then ensures the
 * signed-in user has a Profile (username) before rendering anything.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator>
      {() => <ProfileProvider>{children}</ProfileProvider>}
    </Authenticator>
  );
}
