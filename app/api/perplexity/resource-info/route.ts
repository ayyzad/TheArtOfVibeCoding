import { fetchProductInfoFromAPI, ProductInfo } from '@/lib/actions/product-info';

// Allow longer duration for product info retrieval
export const maxDuration = 30;

/**
 * API endpoint for product information requests
 * This endpoint is a wrapper around the shared utility function.
 * It allows for client-side requests for product information if needed.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return new Response(JSON.stringify({ 
        error: 'URL is required',
        success: false 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use the shared utility function to fetch product information
    const productInfo = await fetchProductInfoFromAPI(url);
    
    if (!productInfo) {
      throw new Error('Failed to fetch product information');
    }
    
    return new Response(JSON.stringify({
      productInfo,
      success: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching product information:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve product information',
      success: false 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}