-- Change orders.user_id FK from set null to cascade so deleting a user
-- removes their orders (and order_items cascade from orders).
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
