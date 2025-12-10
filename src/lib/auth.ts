import { lucia } from 'lucia';
import { pg } from '@lucia-auth/adapter-postgresql';
import { db } from '@/lib/db';
import { sessions, users } from '@/lib/db/schema';

// Initialize Lucia with PostgreSQL adapter
export const auth = lucia({
  adapter: pg(db, {
    user: users,
    session: sessions,
  }),
  env: process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV',
  getUserAttributes: (userData) => {
    return {
      nama: userData.nama,
      email: userData.email,
      role: userData.role,
      posyanduId: userData.posyanduId,
    };
  },
});

// Define the type for user attributes
export type Auth = typeof auth;