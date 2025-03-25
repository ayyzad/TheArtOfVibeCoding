"use server";

import { createClient } from "@/utils/supabase/server";

export const toggleUpvoteAction = async (productId: string) => {
  try {
    const supabase = await createClient();
    
    // Use getUser() for security instead of getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: "Authentication required", status: 401 };
    }
    
    const userId = user.id;
    
    // Check if user has already upvoted this product
    const { data: existingUpvote } = await supabase
      .from("upvotes")
      .select()
      .eq("product_id", productId)
      .eq("user_id", userId)
      .single();
    
    if (existingUpvote) {
      // User has already upvoted, so remove the upvote
      const { error } = await supabase
        .from("upvotes")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", userId);
      
      if (error) {
        return { error: error.message, status: 500 };
      }
      
      return { action: "removed", status: 200 };
    } else {
      // User hasn't upvoted yet, so add an upvote
      const { error } = await supabase.from("upvotes").insert({
        product_id: productId,
        user_id: userId,
      });
      
      if (error) {
        return { error: error.message, status: 500 };
      }
      
      return { action: "added", status: 200 };
    }
  } catch (error) {
    console.error("Error processing upvote:", error);
    return { error: "Failed to process upvote", status: 500 };
  }
};
