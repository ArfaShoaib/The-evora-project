'use client';

import * as React from 'react';

interface AdminUser {
  id: string;
  email: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
}

const AdminAuthContext = React.createContext<AdminAuthContextType>({
  user: null,
  loading: false,
});

export function useAdminAuth() {
  return React.useContext(AdminAuthContext);
}

function getAdminUserFromCookie(): AdminUser | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/admin_session=([^;]+)/);
  if (!match) return null;

  try {
    const session = JSON.parse(decodeURIComponent(match[1]));

    // Get email: prefer _admin_email stored in session, fallback to JWT, fallback to admin_email cookie
    let email = session?._admin_email || '';
    if (!email && session?.access_token) {
      const payload = JSON.parse(
        atob(session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      email = payload.email ?? '';
    }
    if (!email) {
      const emailMatch = document.cookie.match(/admin_email=([^;]+)/);
      email = emailMatch ? decodeURIComponent(emailMatch[1]) : '';
    }

    const id = session?.access_token
      ? JSON.parse(atob(session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub
      : '';

    return { id, email };
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const user = getAdminUserFromCookie();

  return (
    <AdminAuthContext.Provider value={{ user, loading: false }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
