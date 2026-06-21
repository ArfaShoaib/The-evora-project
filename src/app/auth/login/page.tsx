'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { signInWithEmail } from '../actions';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';
import { PasswordInput } from '@/components/ui/PasswordInput';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/';
  const urlError = searchParams.get('error');

  const [shake, setShake] = useState(false);

  if (urlError === 'auth_callback_failed') {
    toast.error('Authentication failed', { description: 'Please try again.' });
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginInput) {
    const result = await signInWithEmail(data, redirectTo);
    if (result?.error) {
      setShake(true);
      toast.error('Login failed', { description: result.error });
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="flex items-center justify-center px-6 py-16 bg-[#F8F8F8]">
      <div className="w-full max-w-md">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-10">
          <Link href="/" className="font-serif text-3xl font-bold tracking-[0.2em] text-black">
            EVORA
          </Link>
        </div>

        <div className={shake ? 'animate-shake' : ''}>

        {/* Heading */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-[#B0B0B0] mb-2">Welcome Back</p>
          <h1 className="font-serif text-4xl font-bold text-black leading-tight">Sign In</h1>
          <p className="mt-3 text-sm text-[#B0B0B0]">
            New to EVORA?{' '}
            <Link
              href="/auth/register"
              className="text-black underline underline-offset-4 hover:text-[#D4AF37] transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs tracking-widest uppercase text-black/60 mb-2"
            >
              Email Address
            </label>
            <input
              id="login-email"
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
              htmlFor="login-password"
              className="block text-xs tracking-widest uppercase text-black/60 mb-2"
            >
              Password
            </label>
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-md text-sm text-black placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-[#B0B0B0] hover:text-[#D4AF37] transition-colors underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-black text-white text-sm tracking-[0.2em] uppercase font-semibold rounded-md hover:bg-[#D4AF37] hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing In…' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-[#E4E4E7]" />
          <span className="text-xs text-[#B0B0B0] tracking-widest uppercase">Or</span>
          <div className="flex-1 h-px bg-[#E4E4E7]" />
        </div>

        <p className="mt-6 text-center text-xs text-[#B0B0B0]">
          By continuing, you agree to EVORA&apos;s{' '}
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

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthBrandPanel />
      <Suspense
        fallback={
          <div className="flex items-center justify-center bg-[#F8F8F8]">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
