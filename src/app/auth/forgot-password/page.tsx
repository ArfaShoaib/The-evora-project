'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';
import { resetPassword } from '../actions';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setError(null);
    const formData = new FormData();
    formData.append('email', data.email);

    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result?.error) {
        setError(result.error);
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
          /* ── Success State ───────────────────────────────────────────── */
          <div className="text-center" id="forgot-password-success">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl font-bold text-black mb-3">Check Your Inbox</h1>
            <p className="text-sm text-[#B0B0B0] leading-relaxed mb-8">
              We&apos;ve sent a password reset link to your email address. The link will expire in 24 hours.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-8 py-3 bg-black text-white text-sm tracking-[0.2em] uppercase font-semibold rounded-md hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          /* ── Form State ──────────────────────────────────────────────── */
          <>
            <div className="mb-10">
              <p className="text-xs tracking-[0.3em] uppercase text-[#B0B0B0] mb-2">
                Account Recovery
              </p>
              <h1 className="font-serif text-4xl font-bold text-black leading-tight">
                Reset Password
              </h1>
              <p className="mt-3 text-sm text-[#B0B0B0]">
                Enter your email and we&apos;ll send you a secure link to reset your password.
              </p>
            </div>

            {error && (
              <div
                id="forgot-password-error"
                className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs tracking-widest uppercase text-black/60 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-md text-sm text-black placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <button
                id="forgot-password-submit"
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-black text-white text-sm tracking-[0.2em] uppercase font-semibold rounded-md hover:bg-[#D4AF37] hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#B0B0B0]">
              Remembered your password?{' '}
              <Link
                href="/auth/login"
                className="text-black underline underline-offset-4 hover:text-[#D4AF37] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
