"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Monitor, Sun, Moon, Palette, Video } from "lucide-react";
import toast from "react-hot-toast";

export default function PersonalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    themeMode: "system",
    themeAccent: "#5e6ad2",
    playerResolution: "default",
    playerCc: false,
  });

  useEffect(() => {
    // Fetch initial settings
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming token is stored here for now
        const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
        
        const res = await fetch(`${apiUrl}/api/account/settings`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setSettings({
            themeMode: data.theme_mode || "system",
            themeAccent: data.theme_accent || "#5e6ad2",
            playerResolution: data.player_resolution || "default",
            playerCc: data.player_cc || false,
          });
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
      
      const res = await fetch(`${apiUrl}/api/account/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      
      if (!res.ok) throw new Error("Failed to save settings");
      
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-tertiary">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-medium tracking-tight text-primary">Personal Settings</h1>
          <p className="text-sm text-tertiary">Customize your interface and viewing experience.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Theme Settings */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-widest text-quaternary mb-4">Appearance</h2>
          
          <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
                <Monitor className="w-4 h-4 text-tertiary" />
                Theme Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['system', 'light', 'dark'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSettings({ ...settings, themeMode: mode })}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      settings.themeMode === mode 
                        ? "bg-brand/10 border-brand text-brand" 
                        : "bg-[rgba(255,255,255,0.02)] border-border text-secondary hover:border-accent"
                    }`}
                  >
                    {mode === 'system' && <Monitor className="w-4 h-4" />}
                    {mode === 'light' && <Sun className="w-4 h-4" />}
                    {mode === 'dark' && <Moon className="w-4 h-4" />}
                    <span className="capitalize">{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
                <Palette className="w-4 h-4 text-tertiary" />
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={settings.themeAccent}
                  onChange={(e) => setSettings({ ...settings, themeAccent: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <input 
                  type="text" 
                  value={settings.themeAccent}
                  onChange={(e) => setSettings({ ...settings, themeAccent: e.target.value })}
                  className="bg-transparent border border-input focus:border-brand px-3 py-2 rounded-md text-sm outline-none font-mono uppercase text-secondary w-28"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Player Settings */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-widest text-quaternary mb-4">Playback Defaults</h2>
          
          <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
                <Video className="w-4 h-4 text-tertiary" />
                Default Resolution
              </label>
              <select 
                value={settings.playerResolution}
                onChange={(e) => setSettings({ ...settings, playerResolution: e.target.value })}
                className="w-full sm:w-64 bg-[rgba(255,255,255,0.02)] text-primary border border-input focus:border-brand px-3 py-2.5 rounded-md text-sm outline-none transition-all cursor-pointer"
              >
                <option value="default">Auto (Bandwidth Dependent)</option>
                <option value="1080p">1080p (High)</option>
                <option value="720p">720p (Medium)</option>
                <option value="480p">480p (Data Saver)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-primary">Closed Captions</h3>
                <p className="text-xs text-tertiary mt-1">Automatically enable CC when available</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.playerCc}
                  onChange={(e) => setSettings({ ...settings, playerCc: e.target.checked })}
                />
                <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-brand after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-brand text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
