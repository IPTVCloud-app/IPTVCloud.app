'use client';

import { useState, useEffect } from 'react';
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
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.PUBLIC_API_URL}/api/admin/users?page=${page}&limit=20&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleAction = async (userId: string, action: 'suspend' | 'mute' | 'restrict', value: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.PUBLIC_API_URL}/api/admin/users/${userId}/action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, value })
      });
      
      if (!res.ok) throw new Error('Action failed');
      
      // Update local state
      setUsers(users.map(u => {
        if (u.id === userId) {
          if (action === 'suspend') return { ...u, suspended_until: value };
          if (action === 'mute') return { ...u, is_muted: value };
          if (action === 'restrict') return { ...u, is_restricted: value };
        }
        return u;
      }));
    } catch (err) {
      alert('Failed to perform action');
    }
  };

  const handlePurge = async (userId: string) => {
    if (!confirm('Are you sure you want to purge all comments by this user from the last 24 hours?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.PUBLIC_API_URL}/api/admin/users/${userId}/purge_comments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Purge failed');
      alert('Comments purged successfully');
    } catch (err) {
      alert('Failed to purge comments');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Manage Users</h1>
          <p className="text-neutral-500 dark:text-neutral-400">View and moderate user accounts</p>
        </div>
        <Link 
          href="/account/admin"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-md px-4 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 font-medium">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 text-neutral-900 dark:text-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-neutral-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        user.role === 'moderator' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {user.suspended_until && new Date(user.suspended_until) > new Date() && (
                        <span className="block text-xs text-red-500 font-medium">Suspended until {new Date(user.suspended_until).toLocaleDateString()}</span>
                      )}
                      {user.is_muted && (
                        <span className="block text-xs text-orange-500 font-medium">Muted</span>
                      )}
                      {user.is_restricted && (
                        <span className="block text-xs text-neutral-500 font-medium">Shadow-banned</span>
                      )}
                      {!user.suspended_until && !user.is_muted && !user.is_restricted && (
                        <span className="block text-xs text-green-500 font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleAction(user.id, 'mute', !user.is_muted)}
                        className={`text-xs px-3 py-1 rounded border font-medium transition-colors ${
                          user.is_muted 
                            ? 'border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-500/10' 
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {user.is_muted ? 'Unmute' : 'Mute'}
                      </button>
                      
                      <button 
                        onClick={() => handleAction(user.id, 'restrict', !user.is_restricted)}
                        className={`text-xs px-3 py-1 rounded border font-medium transition-colors ${
                          user.is_restricted 
                            ? 'border-neutral-500 text-neutral-500 bg-neutral-100 dark:bg-neutral-800' 
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800'
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
                        className={`text-xs px-3 py-1 rounded border font-medium transition-colors ${
                          user.suspended_until && new Date(user.suspended_until) > new Date()
                            ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-500/10' 
                            : 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30'
                        }`}
                      >
                        {user.suspended_until && new Date(user.suspended_until) > new Date() ? 'Lift Suspension' : 'Suspend'}
                      </button>

                      <button 
                        onClick={() => handlePurge(user.id)}
                        className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30 font-medium transition-colors ml-2"
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
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="text-sm text-neutral-600 dark:text-neutral-400 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="text-sm text-neutral-600 dark:text-neutral-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
