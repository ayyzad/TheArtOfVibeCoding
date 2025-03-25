"use server";

import { createClient } from "@/utils/supabase/server";
import { fetchProductInfoFromAPI } from "./product-info";

export interface AddProductData {
  url: string;
  title?: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  tags?: string[];
}

export const addProductAction = async (productData: AddProductData) => {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: "Authentication required", status: 401 };
    }
    
    // Try to fetch product information from the Perplexity API
    console.log("Fetching product information for URL:", productData.url);
    let productInfo = null;
    
    try {
      // Call the fetchProductInfoFromAPI function directly since we're already on the server
      // This avoids making an HTTP request and directly uses the function
      productInfo = await fetchProductInfoFromAPI(productData.url);
      
      if (productInfo) {
        console.log("Product info fetched successfully:", productInfo);
      } else {
        console.error("Failed to fetch product info");
      }
    } catch (apiError) {
      console.error("Error calling product info API:", apiError);
    }
    
    // Use fetched product info or fallback to defaults
    let title = productData.title;
    let description = productData.description;
    let short_description = productData.short_description;
    let tags = productData.tags;
    
    // If we have product info from the API, use it
    if (productInfo) {
      title = title || productInfo.title;
      description = description || productInfo.description;
      short_description = short_description || productInfo.short_description;
      tags = tags || productInfo.tags;
    } else {
      // Fallback to basic extraction if API call failed
      if (!title) {
        try {
          const url = new URL(productData.url);
          title = url.hostname.replace('www.', '');
        } catch (e) {
          title = "New Resource";
        }
      }
      
      description = description || `Resource from ${title}`;
      short_description = short_description || `Check out this resource: ${title}`;
    }
    
    // Insert the product with the authenticated user as created_by and tags as an array
    const { data, error } = await supabase.from("products").insert({
      url: productData.url,
      title: title,
      description: description,
      short_description: short_description,
      created_by: user.id,
      upvotes: 0, // Start with 0 upvotes
      tags: tags // Store tags directly as an array in the products table
    }).select();
    
    // If product was created successfully and we have tags, also update the tags table and products_tags junction
    if (!error && data && data.length > 0 && tags && tags.length > 0) {
      const productId = data[0].id;
      
      // Process each tag
      for (const tagName of tags) {
        // Check if tag exists in the tags table
        const { data: existingTags } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName);
          
        let tagId;
        
        if (existingTags && existingTags.length > 0) {
          // Tag exists, use its ID
          tagId = existingTags[0].id;
        } else {
          // Tag doesn't exist, create it in the tags table
          const { data: newTag, error: tagError } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select('id');
            
          if (tagError || !newTag) {
            console.error(`Error creating tag ${tagName}:`, tagError);
            continue; // Skip this tag and continue with others
          }
          
          tagId = newTag[0].id;
        }
        
        // Add relationship to products_tags junction table
        const { error: junctionError } = await supabase
          .from('products_tags')
          .insert({ product_id: productId, tag_id: tagId });
          
        if (junctionError) {
          console.error(`Error adding tag ${tagName} to product:`, junctionError);
        }
      }
    }
    
    if (error) {
      console.error("Error adding product:", error);
      return { error: error.message, status: 500 };
    }
    
    return { 
      product: data?.[0], 
      status: 200 
    };
  } catch (error) {
    console.error("Error adding product:", error);
    return { error: "Failed to add product", status: 500 };
  }
};
