'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from '@/lib/validations/auth';

// ─── Sign In ────────────────────────────────────────────────────────────────

export async function signInWithEmail(input: LoginInput, redirectTo?: string) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors)[0]?.[0];
    return { error: firstError || 'Invalid input' };
  }

  const supabase = await createClient();
  const { email, password } = parsed.data;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password' };
    }
    return { error: 'Invalid email or password' };
  }

  // Block admin accounts from storefront login
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'admin') {
      await supabase.auth.signOut();
      return { error: 'This account has admin privileges. Please use the admin login panel.' };
    }
  }

  revalidatePath('/', 'layout');
  redirect(redirectTo || '/');
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export async function signUpWithEmail(data: SignupInput) {
  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors)[0]?.[0];
    return { error: firstError || 'Invalid input' };
  }

  const supabase = await createClient();
  const { full_name, email, password } = parsed.data;

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (existingProfile) {
    return { error: 'An account with this email already exists' };
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: full_name },
    },
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      return { error: 'An account with this email already exists' };
    }
    return { error: signUpError.message };
  }

  if (authData.user) {
    await supabase.from('profiles').insert({
      id: authData.user.id,
      name: full_name,
      email,
      role: 'customer',
    });
  }

  revalidatePath('/', 'layout');
  redirect('/auth/verify-email');
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const origin =
    typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
      : window.location.origin;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

// ─── Update Password ─────────────────────────────────────────────────────────

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// ─── Delete Account ──────────────────────────────────────────────────────────

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Delete user data from related tables (cascade handles orders + order_items)
  await supabase.from('reviews').delete().eq('user_id', user.id);
  await supabase.from('wishlists').delete().eq('user_id', user.id);
  await supabase.from('profiles').delete().eq('id', user.id);

  // Delete the auth user via SECURITY DEFINER function (no service role key needed)
  const { error } = await supabase.rpc('delete_user');
  if (error) throw new Error('Failed to delete account: ' + error.message);

  // Sign out
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

// ─── Admin Sign In ───────────────────────────────────────────────────────────

export async function adminSignIn(email: string, password: string) {
  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Access denied. This account does not have admin privileges.' };
  }

  // Set isolated admin_session cookie with full session + email
  const sessionData = { ...data.session, _admin_email: email };
  const cookieStore = await cookies();
  cookieStore.set(
    'admin_session',
    JSON.stringify(sessionData),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  // Store admin email separately for settings page display
  cookieStore.set(
    'admin_email',
    email,
    {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  // Sign out the regular Supabase session — admin uses isolated cookie only.
  // Without this, the browser Supabase client picks up the sb-*-auth-token
  // cookies set by signInWithPassword and fails with "unexpected response".
  try {
    await supabase.auth.signOut();
  } catch {
    // signOut network call may fail — cookies are still cleared locally
  }

  return { success: true };
}

// ─── Admin Sign Out ─────────────────────────────────────────────────────────

export async function adminSignOut() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  cookieStore.delete('admin_email');
  return { success: true };
}

// ─── Update admin email in session cookie ────────────────────────────────────

export async function updateAdminSessionEmail(newEmail: string) {
  const cookieStore = await cookies();
  const raw = cookieStore.get('admin_session')?.value;
  if (!raw) return { error: 'No admin session found' };

  try {
    const session = JSON.parse(raw);
    session._admin_email = newEmail;
    cookieStore.set(
      'admin_session',
      JSON.stringify(session),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      }
    );
    cookieStore.set('admin_email', newEmail, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return { success: true };
  } catch {
    return { error: 'Failed to update session' };
  }
}
