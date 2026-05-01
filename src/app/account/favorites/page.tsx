"use client";

import { Heart } from "lucide-react";

export default function FavoritesPage() {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center text-emerald">
          <Heart className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-medium tracking-tight text-primary">Favorites</h1>
          <p className="text-sm text-tertiary">Your saved channels and collections.</p>
        </div>
      </div>
      <div className="card">
        <p className="text-secondary">You haven&apos;t favorited any channels yet.</p>
      </div>
    </div>
  );
}
