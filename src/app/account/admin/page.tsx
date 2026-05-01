'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalComments: number;
  chartData: Array<{ date: string; views: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch dashboard stats');
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-tertiary">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8" style={{color: '#e5484d'}}>Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-primary">Admin Dashboard</h1>
          <p className="text-body-small text-tertiary">System overview and analytics</p>
        </div>
        <Link 
          href="/account/admin/manage_users"
          className="btn-primary"
        >
          Manage Users
        </Link>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-label text-tertiary mb-2">Total Users</h3>
              <p className="text-display text-primary">{stats.totalUsers.toLocaleString()}</p>
            </div>
            
            <div className="card">
              <h3 className="text-label text-tertiary mb-2">Total Comments</h3>
              <p className="text-display text-primary">{stats.totalComments.toLocaleString()}</p>
            </div>
            
            <div className="card flex flex-col justify-center">
              <h3 className="text-label text-tertiary mb-2">System Health</h3>
              <p className="text-body text-success flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></span>
                Operational
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-heading-3 text-primary mb-6">Activity Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="var(--border-subtle)" 
                    vertical={false} 
                  />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-quaternary)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--text-quaternary)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      border: '1px solid var(--border-primary)', 
                      borderRadius: '8px', 
                      color: 'var(--text-primary)',
                      boxShadow: 'var(--shadow-elevated)'
                    }} 
                    itemStyle={{ color: 'var(--brand)' }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="var(--brand)" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: 'var(--brand)' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

