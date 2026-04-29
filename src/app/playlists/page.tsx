"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ListVideo, Plus, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Playlist {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  is_public: boolean;
}

export default function PlaylistsPage() {
  const { user, loading } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchPlaylists = useCallback(async () => {
    if (!user) return;
    try {
      await Promise.resolve(); // Defer to avoid cascading renders
      setIsFetching(true);
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/playlists`, {
        headers: { Authorization: `Bearer ${user.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data);
      }
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
      toast.error("Failed to load playlists");
    } finally {
      setIsFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      Promise.resolve().then(() => fetchPlaylists());
    } else if (!loading && !user) {
      Promise.resolve().then(() => setIsFetching(false));
    }
  }, [user, loading, fetchPlaylists]);

  const deletePlaylist = async (id: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/playlists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.access_token}` }
      });
      if (res.ok) {
        toast.success("Playlist deleted");
        setPlaylists(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting playlist");
    }
  };

  if (loading || isFetching) {
    return <div className="p-12 text-center text-secondary">Loading playlists...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <ListVideo className="w-16 h-16 text-tertiary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign in to view your Playlists</h2>
        <p className="text-secondary mb-6">Keep track of your favorite channels in one place.</p>
        <Link href="/account/signin" className="px-6 py-2 bg-brand text-white rounded-full font-medium hover:bg-accent transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-primary p-4 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Your Playlists</h1>
            <p className="text-secondary">Create and manage your custom channel collections.</p>
          </div>
          <button 
            onClick={() => toast.success("Creation modal coming soon!")}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-full font-medium shadow-lg shadow-brand/20 hover:bg-accent transition-all shrink-0"
          >
            <Plus className="w-5 h-5" /> Create Playlist
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-xl">
             <ListVideo className="w-12 h-12 text-tertiary mx-auto mb-3" />
             <h3 className="text-lg font-bold text-primary mb-1">No playlists yet</h3>
             <p className="text-secondary">Click the button above to create your first playlist.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map(playlist => (
              <div key={playlist.id} className="bg-surface border border-border rounded-xl overflow-hidden group hover:border-brand transition-colors">
                <Link href={`/playlists/${playlist.id}`} className="block aspect-[16/9] bg-elevated relative overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                     <ListVideo className="w-10 h-10 text-white/50 group-hover:scale-110 transition-transform" />
                   </div>
                   <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                     <ListVideo className="w-3 h-3" /> Playlist
                   </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                     <h3 className="font-bold text-lg leading-tight line-clamp-1">{playlist.name}</h3>
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => toast.success("Edit coming soon")} className="p-1.5 text-secondary hover:text-brand transition-colors"><Edit2 className="w-4 h-4" /></button>
                       <button onClick={() => deletePlaylist(playlist.id)} className="p-1.5 text-secondary hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  </div>
                  <p className="text-sm text-secondary line-clamp-2 min-h-[40px]">{playlist.description || "No description provided."}</p>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-tertiary">
                     <span>{new Date(playlist.created_at).toLocaleDateString()}</span>
                     <span className="bg-page px-2 py-1 rounded">{playlist.is_public ? 'Public' : 'Private'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
