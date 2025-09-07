-- Check what tables exist in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check the structure of the products table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public';

-- Check the structure of the shopping_cart table (if it exists)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'shopping_cart' AND table_schema = 'public';

-- Create shopping_cart table if it doesn't exist
CREATE TABLE IF NOT EXISTS shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Add some sample products if the table is empty
INSERT INTO products (id, name, slug, description, price, stock_quantity) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Elegant Silk Saree', 'elegant-silk-saree', 'Beautiful silk saree perfect for special occasions', 2999.00, 10),
  ('22222222-2222-2222-2222-222222222222', 'Designer Kurti Set', 'designer-kurti-set', 'Trendy kurti set for modern women', 1899.00, 15),
  ('33333333-3333-3333-3333-333333333333', 'Traditional Lehenga Choli', 'traditional-lehenga-choli', 'Stunning lehenga for weddings and festivals', 4999.00, 5),
  ('44444444-4444-4444-4444-444444444444', 'Indo-Western Gown', 'indo-western-gown', 'Contemporary gown with traditional elements', 3499.00, 8),
  ('55555555-5555-5555-5555-555555555555', 'Embroidered Anarkali Suit', 'embroidered-anarkali-suit', 'Elegant Anarkali suit with intricate embroidery', 2799.00, 12),
  ('66666666-6666-6666-6666-666666666666', 'Casual Cotton Kurti', 'casual-cotton-kurti', 'Comfortable cotton kurti for everyday wear', 899.00, 20),
  ('77777777-7777-7777-7777-777777777777', 'Festive Georgette Saree', 'festive-georgette-saree', 'Light and elegant georgette saree', 2199.00, 7),
  ('88888888-8888-8888-8888-888888888888', 'Designer Party Gown', 'designer-party-gown', 'Glamorous gown perfect for parties', 4299.00, 3)
ON CONFLICT (slug) DO NOTHING;

-- Check if data was inserted
SELECT COUNT(*) as product_count FROM products;

-- Check if shopping_cart table was created
SELECT COUNT(*) as cart_items FROM shopping_cart;
