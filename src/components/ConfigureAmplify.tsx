'use client';

import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs, { ssr: true });

// Renders nothing — its only job is to run Amplify.configure on the client.
export default function ConfigureAmplify() {
  return null;
}
