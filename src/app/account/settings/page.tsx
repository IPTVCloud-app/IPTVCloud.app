"use client";

import { Settings as SettingsIcon, User, Shield, Bell, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const sections = [
    { title: "Profile", icon: <User className="w-4 h-4" />, description: "Manage your personal information and avatar." },
    { title: "Account Security", icon: <Shield className="w-4 h-4" />, description: "Update your password and security settings." },
    { title: "Notifications", icon: <Bell className="w-4 h-4" />, description: "Choose what alerts you want to receive." },
    { title: "Billing & Plans", icon: <CreditCard className="w-4 h-4" />, description: "Manage your subscription and payment methods." },
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-medium tracking-[-0.288px] text-primary">Settings</h1>
          <p className="text-sm text-tertiary">Manage your account preferences and configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((s) => (
          <div key={s.title} className="p-6 bg-surface border border-border rounded-xl hover:border-accent transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-secondary group-hover:text-brand transition-colors">
                {s.icon}
              </div>
              <h3 className="font-medium text-primary">{s.title}</h3>
            </div>
            <p className="text-sm text-tertiary leading-relaxed">{s.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 border border-dashed border-border rounded-xl flex flex-col items-center text-center">
        <h3 className="text-lg font-medium text-primary mb-2">Delete Account</h3>
        <p className="text-sm text-tertiary max-w-md mb-6">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button className="px-4 py-2 bg-[rgba(229,72,77,0.1)] text-[#e5484d] border border-[rgba(229,72,77,0.2)] rounded-md text-sm font-medium hover:bg-[rgba(229,72,77,0.15)] transition-colors">
          Request Deletion
        </button>
      </div>
    </div>
  );
}