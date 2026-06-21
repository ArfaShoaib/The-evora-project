import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

function getStorageKey() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = url.split('//')[1].split('.')[0];
  return `sb-${projectRef}-auth-token`;
}

/**
 * Creates a Supabase client for admin server-side operations.
 * Reads session from `admin_session` cookie — completely isolated
 * from the regular user Supabase session.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();
  const storageKey = getStorageKey();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const raw = cookieStore.get('admin_session')?.value;
          if (!raw) return [];
          try {
            const session = JSON.parse(raw);
            return [{ name: storageKey, value: JSON.stringify(session) }];
          } catch {
            return [];
          }
        },
        setAll(cookiesToSet) {
          try {
            const authCookie = cookiesToSet.find((c) => c.name === storageKey);
            if (authCookie) {
              if (!authCookie.value || authCookie.options?.maxAge === 0) {
                cookieStore.delete('admin_session');
              } else {
                cookieStore.set('admin_session', authCookie.value, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax' as const,
                  path: '/',
                  maxAge: 60 * 60 * 24 * 7,
                });
              }
            }
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  );
}
