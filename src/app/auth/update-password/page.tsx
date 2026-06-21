'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePasswordSchema, type UpdatePasswordInput } from '@/lib/validations';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';
import { PasswordInput } from '@/components/ui/PasswordInput';

function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
  });

  async function onSubmit(data: UpdatePasswordInput) {
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: data.password });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F8F8F8]">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="font-serif text-3xl font-bold tracking-[0.2em] text-black">
            EVORA
          </Link>
        </div>

        {success ? (
          <div className="text-center" id="update-password-success">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl font-bold text-black mb-3">Password Updated</h1>
            <p className="text-sm text-[#B0B0B0] leading-relaxed mb-8">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-8 py-3 bg-black text-white text-sm tracking-[0.2em] uppercase font-semibold rounded-md hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <p className="text-xs tracking-[0.3em] uppercase text-[#B0B0B0] mb-2">
                New Password
              </p>
              <h1 className="font-serif text-4xl font-bold text-black leading-tight">
                Set Password
              </h1>
              <p className="mt-3 text-sm text-[#B0B0B0]">
                Enter your new password below.
              </p>
            </div>

            {error && (
              <div
                id="update-password-error"
                className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs tracking-widest uppercase text-black/60 mb-2"
                >
                  New Password
                </label>
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  {...register('password')}
                  className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-md text-sm text-black placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirm-new-password"
                  className="block text-xs tracking-widest uppercase text-black/60 mb-2"
                >
                  Confirm Password
                </label>
                <PasswordInput
                  id="confirm-new-password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-md text-sm text-black placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                id="update-password-submit"
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-black text-white text-sm tracking-[0.2em] uppercase font-semibold rounded-md hover:bg-[#D4AF37] hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Updating…' : 'Update Password'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#B0B0B0]">
              <Link
                href="/auth/login"
                className="text-black underline underline-offset-4 hover:text-[#D4AF37] transition-colors"
              >
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <UpdatePasswordForm />
    </Suspense>
  );
}
