"use client";

import { PlaySquare } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
          <PlaySquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-medium tracking-tight text-primary">Watch History</h1>
          <p className="text-sm text-tertiary">Pick up right where you left off.</p>
        </div>
      </div>
      <div className="text-center p-12 bg-surface border border-border rounded-xl">
        <p className="text-secondary">Your watch history is currently empty.</p>
      </div>
    </div>
  );
}
