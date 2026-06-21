import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback route — handles the OAuth / email-confirmation redirect
 * from Supabase. Exchanges the `code` param for a valid session then
 * redirects the user to their intended destination (or home).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to error page if exchange fails
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
