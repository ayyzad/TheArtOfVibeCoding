import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { UpvoteButton } from "./upvote-button";

interface ProductCardProps {
  id: string;
  title: string;
  shortDescription: string;
  url: string | null;
  upvotes: number;
  tags: string[];
  hasUpvoted?: boolean;
  onUpvote?: (id: string) => void;
}

export function ProductCard({
  id,
  title,
  shortDescription,
  url,
  upvotes,
  tags,
  hasUpvoted = false,
  onUpvote,
}: ProductCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">

      {/* Product Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link href={`/products/${id}`} className="group-hover:underline">
            <h3 className="font-semibold text-xl text-card-foreground line-clamp-1">
              {title}
            </h3>
          </Link>
          
          {url && (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
              aria-label="Visit website"
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          )}
        </div>

        <p className="mb-4 text-muted-foreground line-clamp-2">
          {shortDescription}
        </p>

        {/* Tags */}
        <div className="mt-auto flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              +{tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-card/50 px-4 py-2">
        <Link
          href={`/products/${id}`}
          className="text-sm text-muted-foreground hover:text-card-foreground"
        >
          View details
        </Link>
        
        <UpvoteButton
          id={id}
          upvotes={upvotes}
          hasUpvoted={hasUpvoted}
          onUpvote={onUpvote || (() => {})}
        />
      </div>
    </div>
  );
}
