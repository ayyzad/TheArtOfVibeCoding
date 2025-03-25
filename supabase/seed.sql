-- Seed file for Vibe Coding Platform
-- This file contains sample data for development and testing

-- Create test users
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, recovery_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) (
  SELECT
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'user' || (ROW_NUMBER() OVER ()) || '@example.com',
    crypt('password123', gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
  FROM generate_series(1, 10)
);

-- Create test user email identities
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) (
  SELECT
    uuid_generate_v4(),
    id,
    format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
    'email',
    id,
    current_timestamp,
    current_timestamp,
    current_timestamp
  FROM auth.users
);

-- Insert sample tags
INSERT INTO tags (name) VALUES 
  ('AI Tools'),
  ('Developer Tools'),
  ('Design Tools'),
  ('Productivity'),
  ('Learning Resources'),
  ('Frameworks'),
  ('Libraries'),
  ('VSCode Extensions');

-- Use the first test user for sample data
DO $$
DECLARE
  user_id UUID := (SELECT id FROM auth.users LIMIT 1); -- Use the first test user
BEGIN
  
  -- Insert sample products
  INSERT INTO products (title, description, short_description, image_url, url, upvotes, tags, created_by) VALUES
  (
    'CodeVibe IDE',
    'CodeVibe IDE is a revolutionary code editor designed specifically for vibe coders. It features a distraction-free interface, built-in pomodoro timer, ambient sound mixer, and theme generator that matches your coding style. The IDE also includes AI-powered code suggestions that adapt to your personal coding patterns.',
    'A code editor designed for maximum vibes while coding',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    'https://example.com/codevibe-ide',
    125,
    '{AI Tools, Developer Tools}',
    user_id
  ),
  (
    'FlowState.js',
    'FlowState.js is a JavaScript library that helps developers achieve flow state faster. It provides a set of utilities and components that reduce cognitive load, simplify complex tasks, and create a more enjoyable development experience. The library includes smart auto-formatting, context-aware code completion, and a visual debugging tool that makes troubleshooting almost fun.',
    'JavaScript library designed to help developers achieve flow state',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713',
    'https://example.com/flowstate-js',
    87,
    '{Libraries, Developer Tools}',
    user_id
  ),
  (
    'Zen Coding Course',
    'The Zen Coding Course teaches developers how to write clean, maintainable code while maintaining a calm, focused mindset. This comprehensive course covers coding principles, mindfulness techniques, workspace optimization, and productivity habits that transform coding from a stressful activity into a fulfilling creative practice.',
    'Learn to code with a calm, focused mindset',
    'https://images.unsplash.com/photo-1544256718-3bcf237f3974',
    'https://example.com/zen-coding-course',
    210,
    '{Learning Resources, Productivity}',
    user_id
  ),
  (
    'Aesthetic UI',
    'Aesthetic UI is a design system and component library focused on creating visually pleasing, highly usable interfaces. It provides a collection of customizable components with carefully selected color palettes, typography, and animations that create a cohesive, beautiful user experience without sacrificing performance or accessibility.',
    'Design system for creating beautiful, usable interfaces',
    'https://images.unsplash.com/photo-1545235617-9465d2a55698',
    'https://example.com/aesthetic-ui',
    156,
    '{Design Tools, Libraries}',
    user_id
  ),
  (
    'Mood Palette Generator',
    'Mood Palette Generator is a tool that creates color schemes based on emotions and atmospheres. Perfect for designers and developers who want their applications to evoke specific feelings. The tool uses color psychology principles and can generate accessible color combinations that maintain the desired emotional impact.',
    'Generate color palettes based on emotions and moods',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
    'https://example.com/mood-palette',
    92,
    '{Design Tools}',
    user_id
  ),
  (
    'CodeTunes',
    'CodeTunes is a curated collection of music playlists specifically designed to enhance coding productivity. Each playlist is crafted for different types of development work, from deep problem-solving to routine tasks. The platform also features an algorithm that learns your preferences and suggests music based on your current coding activity.',
    'Curated music playlists optimized for coding sessions',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    'https://example.com/codetunes',
    178,
    '{Productivity}',
    user_id
  );
END
$$;

-- Connect products with tags
WITH product_tags AS (
  SELECT id, unnest(tags) AS tag_name FROM products
)
INSERT INTO products_tags (product_id, tag_id)
SELECT pt.id, t.id
FROM product_tags pt
JOIN tags t ON pt.tag_name = t.name;
