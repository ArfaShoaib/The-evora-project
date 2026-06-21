'use client';

import Link from 'next/link';

/**
 * Shown after a successful sign-up — asks the user to check their inbox
 * for the Supabase email confirmation link.
 */
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F8F8F8]">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-12">
          <Link href="/" className="font-serif text-3xl font-bold tracking-[0.2em] text-black">
            EVORA
          </Link>
        </div>

        {/* Gold envelope icon */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
          <svg
            className="w-9 h-9 text-[#D4AF37]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 7.5-9.75-7.5"
            />
          </svg>
        </div>

        <h1 className="font-serif text-4xl font-bold text-black mb-4">Verify Your Email</h1>
        <p className="text-sm text-[#B0B0B0] leading-relaxed mb-2">
          We&apos;ve sent a confirmation link to your email address. Please click the link to
          activate your account.
        </p>
        <p className="text-xs text-[#B0B0B0] mb-10">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <Link
            href="/auth/register"
            className="text-black underline underline-offset-4 hover:text-[#D4AF37] transition-colors"
          >
            try again
          </Link>
          .
        </p>

        {/* Thin gold divider */}
        <div className="w-16 h-px bg-[#D4AF37] mx-auto mb-8" />

        <Link
          href="/auth/login"
          className="inline-block px-8 py-3 bg-black text-white text-sm tracking-[0.2em] uppercase font-semibold rounded-md hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
        >
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
