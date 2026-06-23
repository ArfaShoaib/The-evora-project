'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginSchema, type AdminLoginInput } from '@/lib/validations';
import { adminSignIn } from '@/app/auth/actions';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
  });

  async function onSubmit(data: AdminLoginInput) {
    setLoading(true);

    const result = await adminSignIn(data.email, data.password);

    if (result?.error) {
      setShake(true);
      toast.error('Login failed', {
        description: 'Invalid email or password. Please try again.',
      });
      setTimeout(() => setShake(false), 500);
      setLoading(false);
      return;
    }

    window.location.replace('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className={`bg-white rounded-xl shadow-xl p-6 sm:p-8 ${shake ? 'animate-shake' : ''}`}>
          <div className="text-center mb-8">
            <Link href="/" className="font-serif text-3xl font-bold tracking-[0.2em] text-[#C9A84C]">EVORA</Link>
            <p className="text-sm text-gray-500 mt-2 tracking-widest uppercase">Admin Panel</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0A0A0A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">Password</label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0A0A0A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-[#C9A84C] text-white text-sm font-semibold tracking-wider uppercase rounded-lg hover:bg-[#C9A84C]/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
