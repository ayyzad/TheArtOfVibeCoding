import Hero from "@/components/hero";
import { ProductsGrid } from "@/components/products-grid";
import { createClient } from "@/utils/supabase/server";
import { AddProductDialog } from "@/components/add-product";

export const revalidate = 3600; // Revalidate at most every hour

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch products from Supabase
  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, short_description, url, upvotes, tags")
    .order("upvotes", { ascending: false });
    
  // Get the current authenticated user (more secure than getSession)
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // Fetch user upvotes if user is logged in
  let userUpvotes: string[] = [];
  
  if (user && !userError) {
    const { data: upvotes } = await supabase
      .from("upvotes")
      .select("product_id")
      .eq("user_id", user.id);
      
    userUpvotes = upvotes?.map(upvote => upvote.product_id) || [];
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full">
        <Hero />
      </div>

      <div className="container max-w-6xl py-12">
        <div className="mb-8 flex flex-col gap-2">
          <h2 className="text-3xl font-bold">Discover Vibe Coding Resources</h2>
          <p className="text-muted-foreground">
            Explore the best tools, libraries, and resources for vibe coding
          </p>
          <AddProductDialog />
        </div>

        {error ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <h3 className="text-xl font-semibold">Error loading products</h3>
            <p className="mt-2 text-muted-foreground">
              There was an error loading the products. Please try again later.
            </p>
          </div>
        ) : (
          <ProductsGrid 
            products={products || []} 
            userUpvotes={userUpvotes} 
          />
        )}
      </div>
    </div>
  );
}
