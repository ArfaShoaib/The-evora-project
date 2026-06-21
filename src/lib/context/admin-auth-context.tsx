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
    if (!session?.access_token) return null;

    // Decode JWT payload (base64url) to get user id + email
    const payload = JSON.parse(
      atob(session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    return {
      id: payload.sub,
      email: payload.email ?? '',
    };
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
