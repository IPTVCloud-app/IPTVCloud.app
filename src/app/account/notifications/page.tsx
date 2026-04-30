"use client";

import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-medium tracking-tight text-primary">Notifications</h1>
          <p className="text-sm text-tertiary">Updates and alerts for your account.</p>
        </div>
      </div>
      <div className="text-center p-12 bg-surface border border-border rounded-xl">
        <p className="text-secondary">You're all caught up! No new notifications.</p>
      </div>
    </div>
  );
}
