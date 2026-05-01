'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_verified: boolean;
  suspended_until: string | null;
  is_muted: boolean;
  is_restricted: boolean;
  created_at: string;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?page=${page}&limit=20&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    // Defer to avoid sync setState in effect
    Promise.resolve().then(() => fetchUsers());
  }, [fetchUsers]);

const handleAction = async (userId: string, action: 'suspend' | 'mute' | 'restrict', value: string | boolean | number | null) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/action`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, value })
    });

    if (!res.ok) throw new Error('Action failed');
    await fetchUsers();
  } catch (err: unknown) {
    if (err instanceof Error) {
      alert(err.message);
    }
  }
};
  const handlePurge = async (userId: string) => {
    if (!confirm('Are you sure you want to purge all comments by this user from the last 24 hours?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/purge_comments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Purge failed');
      alert('Comments purged successfully');
    } catch (err: unknown) {
      console.error('Purge error:', err);
      alert('Failed to purge comments');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-primary">Manage Users</h1>
          <p className="text-body-small text-tertiary">View and moderate user accounts</p>
        </div>
        <Link 
          href="/account/admin"
          className="btn-ghost text-body"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-primary">
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="form-input"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-meta whitespace-nowrap">
            <thead className="bg-panel text-tertiary font-medium">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary text-primary">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-tertiary">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-tertiary">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-panel transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-caption text-tertiary">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                        user.role === 'admin' ? 'badge-brand' :
                        user.role === 'moderator' ? 'badge-accent' :
                        'badge-subtle'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {user.suspended_until && new Date(user.suspended_until) > new Date() && (
                        <span className="block text-caption font-medium" style={{color: 'var(--brand)'}}>Suspended until {new Date(user.suspended_until).toLocaleDateString()}</span>
                      )}
                      {user.is_muted && (
                        <span className="block text-caption font-medium text-brand">Muted</span>
                      )}
                      {user.is_restricted && (
                        <span className="block text-caption text-tertiary font-medium">Shadow-banned</span>
                      )}
                      {!user.suspended_until && !user.is_muted && !user.is_restricted && (
                        <span className="block text-caption text-success font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleAction(user.id, 'mute', !user.is_muted)}
                        className={`text-caption px-3 py-1 rounded border font-medium transition-colors ${
                          user.is_muted 
                            ? 'border-brand text-brand bg-surface' 
                            : 'border-primary text-secondary hover:bg-panel'
                        }`}
                      >
                        {user.is_muted ? 'Unmute' : 'Mute'}
                      </button>
                      
                      <button 
                        onClick={() => handleAction(user.id, 'restrict', !user.is_restricted)}
                        className={`text-caption px-3 py-1 rounded border font-medium transition-colors ${
                          user.is_restricted 
                            ? 'border-secondary text-secondary bg-panel' 
                            : 'border-primary text-secondary hover:bg-panel'
                        }`}
                        title="Shadow ban"
                      >
                        {user.is_restricted ? 'Unrestrict' : 'Restrict'}
                      </button>

                      <button 
                        onClick={() => {
                          if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
                            handleAction(user.id, 'suspend', null);
                          } else {
                            const days = prompt('Suspend for how many days?', '7');
                            if (days && !isNaN(Number(days))) {
                              const expires = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000).toISOString();
                              handleAction(user.id, 'suspend', expires);
                            }
                          }
                        }}
                        className={`text-caption px-3 py-1 rounded border font-medium transition-colors ${
                          user.suspended_until && new Date(user.suspended_until) > new Date()
                            ? 'border-brand text-brand bg-surface' 
                            : 'border-primary text-secondary hover:bg-panel'
                        }`}
                      >
                        {user.suspended_until && new Date(user.suspended_until) > new Date() ? 'Lift Suspension' : 'Suspend'}
                      </button>

                      <button 
                        onClick={() => handlePurge(user.id)}
                        className="text-caption px-3 py-1 rounded border border-primary text-secondary hover:bg-panel font-medium transition-colors ml-2"
                        title="Delete comments from last 24h"
                      >
                        Purge 24h
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-primary flex items-center justify-between">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="text-meta text-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-meta text-tertiary">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="text-meta text-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

