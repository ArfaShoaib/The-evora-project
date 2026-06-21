import type { Metadata } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'EVORA | Account',
  description: 'Sign in or create your EVORA account.',
};

/**
 * Auth layout — intentionally excludes the global Header and Footer
 * to provide a focused, distraction-free authentication experience.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
      <Toaster position="top-right" richColors />
    </div>
  );
}
