'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpWithEmail } from '../actions';
import { signupSchema, type SignupInput } from '@/lib/validations/auth';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';
import { PasswordInput } from '@/components/ui/PasswordInput';

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { full_name: '', email: '', password: '', confirm_password: '' },
  });

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    setSuccess(false);
    const result = await signUpWithEmail(data);
    if (result?.error) setServerError(result.error);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left: Brand Panel ─────────────────────────────────────────────── */}
      <AuthBrandPanel />

      {/* ── Right: Form Panel ────────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-6 py-16 bg-[#F8F8F8]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="font-serif text-3xl font-bold tracking-[0.2em] text-black">
              EVORA
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-[#B0B0B0] mb-2">Join the Circle</p>
            <h1 className="font-serif text-4xl font-bold text-black leading-tight">
              Create Account
            </h1>
            <p className="mt-3 text-sm text-[#B0B0B0]">
              Already a member?{' '}
              <Link
                href="/auth/login"
                className="text-black underline underline-offset-4 hover:text-[#D4AF37] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs tracking-widest uppercase text-black/60 mb-2"
              >
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Alexandra Chen"
                {...register('full_name')}
                className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-md text-sm text-black placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
              />
              {errors.full_name && (
                <p className="mt-1.5 text-xs text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-xs tracking-widest uppercase text-black/60 mb-2"
              >
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-md text-sm text-black placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-xs tracking-widest uppercase text-black/60 mb-2"
              >
                Password
              </label>
              <PasswordInput
                id="register-password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                {...register('password')}
                className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-md text-sm text-black placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-xs tracking-widest uppercase text-black/60 mb-2"
              >
                Confirm Password
              </label>
              <PasswordInput
                id="register-confirm-password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirm_password')}
                className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-md text-sm text-black placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
              />
              {errors.confirm_password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.confirm_password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-black text-white text-sm tracking-[0.2em] uppercase font-semibold rounded-md hover:bg-[#D4AF37] hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#B0B0B0]">
            By registering, you agree to EVORA&apos;s{' '}
            <Link href="/terms" className="underline hover:text-[#D4AF37] transition-colors">
              Terms
            </Link>{' '}
            &amp;{' '}
            <Link href="/privacy" className="underline hover:text-[#D4AF37] transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
