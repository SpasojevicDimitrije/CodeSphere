'use client';

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

// Single Data client for all CRUDL requests, signed with the user's Cognito token.
export const client = generateClient<Schema>();
