"use client";

import { FileText } from "lucide-react";

export default function PostsPage() {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-medium tracking-tight text-primary">Manage Posts</h1>
          <p className="text-sm text-tertiary">View and manage your community posts.</p>
        </div>
      </div>
      <div className="card">
        <p className="text-secondary">You haven&apos;t published any posts yet.</p>
      </div>
    </div>
  );
}
