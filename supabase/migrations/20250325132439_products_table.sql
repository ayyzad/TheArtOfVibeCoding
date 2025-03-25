-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  image_url TEXT,
  url TEXT,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}'
);

-- Create products_tags table for better tag management
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products_tags junction table
CREATE TABLE IF NOT EXISTS products_tags (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE
);

-- Create upvotes table to track user upvotes
CREATE TABLE IF NOT EXISTS upvotes (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (product_id, user_id)
);

-- No sample data in migration file - schema only

-- Create RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Everyone can view products
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT USING (true);

-- Only authenticated users can insert products and must set created_by to their own ID
CREATE POLICY "Authenticated users can insert products" 
ON products FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

-- Users can update their own products
CREATE POLICY "Users can update their own products" 
ON products FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- Users can delete their own products
CREATE POLICY "Users can delete their own products" 
ON products FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Everyone can view upvotes
CREATE POLICY "Upvotes are viewable by everyone" 
ON upvotes FOR SELECT USING (true);

-- Authenticated users can insert their own upvotes
CREATE POLICY "Authenticated users can insert upvotes" 
ON upvotes FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Authenticated users can delete their own upvotes
CREATE POLICY "Authenticated users can delete upvotes" 
ON upvotes FOR DELETE TO authenticated 
USING (user_id = auth.uid());

-- Create function to update upvote count
CREATE OR REPLACE FUNCTION update_product_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products SET upvotes = upvotes + 1 WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products SET upvotes = upvotes - 1 WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for upvotes
CREATE TRIGGER update_product_upvotes_trigger
AFTER INSERT OR DELETE ON upvotes
FOR EACH ROW
EXECUTE FUNCTION update_product_upvotes();
