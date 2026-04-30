'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VerifiedBadge from '@/components/VerifiedBadge';

interface UserProfile {
  user: {
    username: string;
    is_verified: boolean;
    avatar_url: string | null;
    created_at: string;
  };
  stats: {
    followers: number | null;
    following: number | null;
  };
  privacy: {
    show_followers: boolean;
    show_following: boolean;
    show_watch_history: boolean;
  };
  watchHistory: Array<{
    channel_short_id: string;
    last_watched_at: string;
  }>;
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const rawUsername = searchParams.get('username') || '';
  
  // Strip '@' if it's there
  const username = rawUsername.startsWith('%40') 
    ? decodeURIComponent(rawUsername).substring(1)
    : rawUsername.startsWith('@') 
      ? rawUsername.substring(1) 
      : rawUsername;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!username) {
      Promise.resolve().then(() => {
        setError('User not found');
        setLoading(false);
      });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social/profile/${username}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('User not found');
          throw new Error('Failed to load profile');
        }
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token || !profile || !username) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social/follow/status/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (err) {
        console.error('Failed to check follow status', err);
      }
    };

    checkFollowStatus();
  }, [username, profile]);

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to follow users');
      return;
    }

    setFollowLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social/follow/toggle/${username}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to toggle follow');
      const data = await res.json();
      setIsFollowing(data.isFollowing);
      
      // Update local follower count if public
      if (profile && profile.privacy.show_followers && profile.stats.followers !== null) {
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            followers: data.isFollowing ? profile.stats.followers + 1 : profile.stats.followers - 1
          }
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500 min-h-[50vh]">
        Loading profile...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500 min-h-[50vh]">
        {error || 'User not found'}
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200 dark:border-neutral-700 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 overflow-hidden">
          {profile.user.avatar_url ? (
            <img src={profile.user.avatar_url} alt={profile.user.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-neutral-400">
              {profile.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
              {profile.user.username}
            </h1>
            {profile.user.is_verified && <VerifiedBadge />}
          </div>
          
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            Joined {new Date(profile.user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
          
          <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
            {profile.privacy.show_followers ? (
              <div className="text-center md:text-left">
                <span className="block font-bold text-lg text-neutral-900 dark:text-white">{profile.stats.followers}</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Followers</span>
              </div>
            ) : null}
            
            {profile.privacy.show_following ? (
              <div className="text-center md:text-left">
                <span className="block font-bold text-lg text-neutral-900 dark:text-white">{profile.stats.following}</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Following</span>
              </div>
            ) : null}
          </div>

          <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              isFollowing
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {followLoading ? 'Updating...' : isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {/* Activity Feeds */}
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Activity</h2>
          
          {!profile.privacy.show_watch_history && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 text-center text-neutral-500 border border-neutral-200 dark:border-neutral-700">
              This user&apos;s activity is private.
            </div>
          )}

          {profile.privacy.show_watch_history && profile.watchHistory.length === 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 text-center text-neutral-500 border border-neutral-200 dark:border-neutral-700">
              No recent activity.
            </div>
          )}

          {profile.privacy.show_watch_history && profile.watchHistory.length > 0 && (
            <div className="space-y-4">
              {profile.watchHistory.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700 flex items-center gap-4">
                  <div className="w-16 h-10 bg-neutral-200 dark:bg-neutral-700 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}/api/channels/thumbnail?id=${item.channel_short_id}`} 
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-neutral-900 dark:text-white font-medium">
                      Watched <span className="text-blue-500">{item.channel_short_id}</span>
                    </p>
                    <p className="text-sm text-neutral-500">
                      {new Date(item.last_watched_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col font-sans w-full">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center text-neutral-500 min-h-[50vh]">
          Loading profile...
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
