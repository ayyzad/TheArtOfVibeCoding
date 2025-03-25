"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { toggleUpvoteAction } from "@/lib/actions/upvote";
import { useRouter } from "next/navigation";

interface ProductsGridProps {
  products: {
    id: string;
    title: string;
    short_description: string;
    url: string | null;
    upvotes: number;
    tags: string[];
  }[];
  userUpvotes?: string[];
}

export function ProductsGrid({ products, userUpvotes = [] }: ProductsGridProps) {
  const router = useRouter();
  const [localProducts, setLocalProducts] = useState(products);
  const [localUserUpvotes, setLocalUserUpvotes] = useState(userUpvotes);
  const [isUpvoting, setIsUpvoting] = useState<Record<string, boolean>>({});
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-semibold">No products found</h3>
        <p className="mt-2 text-muted-foreground">
          Be the first to add a product to this collection!
        </p>
      </div>
    );
  }

  const handleUpvote = async (productId: string) => {
    // Prevent double-clicks
    if (isUpvoting[productId]) return;
    
    try {
      setIsUpvoting(prev => ({ ...prev, [productId]: true }));
      
      // Call server action to update database
      const result = await toggleUpvoteAction(productId);
      
      if (result.status === 401) {
        // User is not authenticated, redirect to sign-up page
        router.push('/sign-up');
        return;
      }
      
      if (result.status !== 200) {
        throw new Error(result.error || 'Failed to update upvote');
      }
      
      // Update UI after successful server action
      const isCurrentlyUpvoted = localUserUpvotes.includes(productId);
      let newUserUpvotes;
      
      if (isCurrentlyUpvoted) {
        // Remove upvote
        newUserUpvotes = localUserUpvotes.filter(id => id !== productId);
        setLocalProducts(prev => 
          prev.map(p => p.id === productId ? { ...p, upvotes: p.upvotes - 1 } : p)
        );
      } else {
        // Add upvote
        newUserUpvotes = [...localUserUpvotes, productId];
        setLocalProducts(prev => 
          prev.map(p => p.id === productId ? { ...p, upvotes: p.upvotes + 1 } : p)
        );
      }
      
      setLocalUserUpvotes(newUserUpvotes);
    } catch (error) {
      console.error('Failed to update upvote:', error);
    } finally {
      setIsUpvoting(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {localProducts.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          shortDescription={product.short_description}
          url={product.url}
          upvotes={product.upvotes}
          tags={product.tags}
          hasUpvoted={localUserUpvotes.includes(product.id)}
          onUpvote={handleUpvote}
        />
      ))}
    </div>
  );
}
