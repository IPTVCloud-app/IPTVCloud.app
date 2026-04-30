"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  is_verified: boolean;
  loggedIn: boolean;
  access_token?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
          const res = await fetch(`${apiUrl}/api/account/settings/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser({ 
                loggedIn: true, 
                access_token: token,
                id: data.id,
                username: data.username,
                email: data.email,
                role: data.role,
                is_verified: data.is_verified
            });
          } else {
             localStorage.removeItem('token');
             setUser(null);
          }
        } catch {
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
    window.dispatchEvent(new Event('storage'));
  };

  return { user, loading, logout };
}
