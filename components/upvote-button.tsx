"use client";

import { ArrowUpIcon } from "lucide-react";

interface UpvoteButtonProps {
  id: string;
  upvotes: number;
  hasUpvoted: boolean;
  onUpvote: (id: string) => void;
}

export function UpvoteButton({
  id,
  upvotes,
  hasUpvoted,
  onUpvote,
}: UpvoteButtonProps) {
  return (
    <button
      onClick={() => onUpvote(id)}
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm transition-colors ${
        hasUpvoted
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      }`}
      aria-label={hasUpvoted ? "Remove upvote" : "Upvote"}
    >
      <ArrowUpIcon className="h-3.5 w-3.5" />
      <span>{upvotes}</span>
    </button>
  );
}
