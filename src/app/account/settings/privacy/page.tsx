"use client";

import { useState, useEffect } from "react";
import { Shield, Eye, Users, Clock, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface PrivacyState {
  showFollowers: boolean;
  showFollowing: boolean;
  showWatchHistory: boolean;
  showComments: boolean;
}

interface ToggleItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (val: boolean) => void;
}

const ToggleItem = ({ title, description, icon, checked, onChange }: ToggleItemProps) => (
  <div className="flex items-start justify-between p-5 border-b border-border last:border-0 hover:bg-[rgba(255,255,255,0.01)] transition-colors">
    <div className="flex gap-3 pr-6">
      <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-tertiary mt-1">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-primary mb-1">{title}</h3>
        <p className="text-xs text-tertiary leading-relaxed">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-brand after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
    </label>
  </div>
);

export default function PrivacySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [privacy, setPrivacy] = useState<PrivacyState>({
    showFollowers: true,
    showFollowing: true,
    showWatchHistory: true,
    showComments: true,
  });

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        
        const res = await fetch(`${apiUrl}/api/account/privacy`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setPrivacy({
            showFollowers: data.show_followers ?? true,
            showFollowing: data.show_following ?? true,
            showWatchHistory: data.show_watch_history ?? true,
            showComments: data.show_comments ?? true,
          });
        }
      } catch (error) {
        console.error("Failed to load privacy settings", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrivacy();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      
      const res = await fetch(`${apiUrl}/api/account/privacy`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(privacy)
      });
      
      if (!res.ok) throw new Error("Failed to save privacy settings");
      
      toast.success("Privacy settings updated");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-tertiary">Loading privacy settings...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center text-emerald">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-medium tracking-tight text-primary">Privacy Settings</h1>
          <p className="text-sm text-tertiary">Control what information is visible on your public profile.</p>
        </div>
      </div>

      <div className="card">
        <ToggleItem 
          title="Show Followers" 
          description="Allow others to see the list of people who follow your profile."
          icon={<Users className="w-4 h-4" />}
          checked={privacy.showFollowers}
          onChange={(val: boolean) => setPrivacy({ ...privacy, showFollowers: val })}
        />
        <ToggleItem 
          title="Show Following" 
          description="Allow others to see the channels and users you are following."
          icon={<Eye className="w-4 h-4" />}
          checked={privacy.showFollowing}
          onChange={(val: boolean) => setPrivacy({ ...privacy, showFollowing: val })}
        />
        <ToggleItem 
          title="Public Watch History" 
          description="Display recently watched channels and activities on your public profile."
          icon={<Clock className="w-4 h-4" />}
          checked={privacy.showWatchHistory}
          onChange={(val: boolean) => setPrivacy({ ...privacy, showWatchHistory: val })}
        />
        <ToggleItem 
          title="Show Public Comments" 
          description="Allow others to view a timeline of your public comments across channels."
          icon={<MessageSquare className="w-4 h-4" />}
          checked={privacy.showComments}
          onChange={(val: boolean) => setPrivacy({ ...privacy, showComments: val })}
        />
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-brand"
        >
          {saving ? "Saving..." : "Save Privacy Rules"}
        </button>
      </div>
    </div>
  );
}
