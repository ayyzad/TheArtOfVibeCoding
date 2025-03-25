/**
 * Product information interface for Perplexity API responses
 */
export interface ProductInfo {
  title: string;
  description: string;
  short_description: string;
  tags: string[];
}

/**
 * Fetches product information from a URL using the Perplexity API
 * @param url - The URL of the product/resource to analyze
 * @returns Promise with product information or null if the request fails
 */
export async function fetchProductInfoFromAPI(url: string): Promise<ProductInfo | null> {
  if (!process.env.PERPLEXITY_API_KEY) {
    console.error('PERPLEXITY_API_KEY is not defined in environment variables');
    return null;
  }

  try {
    console.log(`Fetching product information for URL: ${url}`);
    
    // Build user prompt for product information extraction
    const userPrompt = `Visit this URL: ${url} and extract information about this resource.
      Please respond with ONLY a valid JSON object containing these fields:
      - title: A concise, descriptive title for the resource (string, max 100 chars)
      - description: A detailed description of what the resource is and what it does (string, 200-300 chars)
      - short_description: A one-sentence summary of the resource (string, max 100 chars)
      - tags: An array of 3-5 relevant tags that categorize this resource (e.g., "AI", "Design", "Productivity")
      
      Focus on understanding what the tool/resource does and its primary features.
      Return ONLY the JSON object with no other text.`;
    
    // Make API request to Perplexity
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that analyzes websites and extracts structured information. Return only valid JSON.' 
          },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                short_description: { type: "string" },
                tags: { 
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["title", "description", "short_description", "tags"]
            }
          }
        }
      })
    });
    
    console.log('Perplexity API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error response:', response.status, errorText);
      return null;
    }
    
    const result = await response.json();
    console.log('Perplexity API response received:', JSON.stringify(result).substring(0, 200) + '...');
    
    // Extract and parse the product information
    if (result.choices && result.choices[0]?.message?.content) {
      try {
        // Handle both object and string content formats
        let productInfo: ProductInfo;
        
        if (typeof result.choices[0].message.content === 'object') {
          productInfo = result.choices[0].message.content;
        } else {
          productInfo = JSON.parse(result.choices[0].message.content);
        }
        
        console.log('Parsed product information:', productInfo);
        return productInfo;
      } catch (parseError) {
        console.error('Error parsing Perplexity response:', parseError);
        console.error('Response content:', result.choices[0]?.message?.content);
      }
    } else {
      console.error('Unexpected response format. No choices or message content found:', 
        JSON.stringify(result).substring(0, 200));
    }
  } catch (error) {
    console.error('Error fetching product information from Perplexity:', error);
  }
  
  return null;
}

/**
 * Fetches product information from a URL using the Perplexity API
 * @param url The URL of the product to analyze
 * @returns ProductInfo object with title, description, short_description, and tags
 */
export async function fetchProductInfo(url: string): Promise<ProductInfo | null> {
  if (!process.env.PERPLEXITY_API_KEY) {
    console.error('PERPLEXITY_API_KEY is not defined in environment variables');
    return null;
  }

  try {
    // Use the local API endpoint to avoid exposing the API key in client-side code
    const response = await fetch('/api/perplexity/resource-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching product info:', response.status, errorText);
      return null;
    }

    const productInfo = await response.json();
    console.log('Product info received:', productInfo);
    return productInfo;
  } catch (error) {
    console.error('Error fetching product info:', error);
    return null;
  }
}