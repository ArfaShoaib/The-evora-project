import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminAuthProvider } from '@/lib/context/admin-auth-context';

export const metadata: Metadata = {
  title: 'Admin | EVORA',
  description: 'EVORA admin dashboard',
};

/**
 * Admin layout — auth is handled entirely by middleware via admin_session cookie.
 * AdminAuthProvider reads user info from the cookie (no useEffect).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
