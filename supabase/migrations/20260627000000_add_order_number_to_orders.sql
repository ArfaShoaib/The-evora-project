-- Add order_number column with auto-generated sequential IDs (EV-000001, EV-000002, ...)

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number text;

-- Add unique constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_number_key'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
  END IF;
END $$;

-- Sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 100;

-- Function to auto-generate order number on insert
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS trigger AS $$
BEGIN
  NEW.order_number := 'EV-' || lpad(nextval('order_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: auto-generate order_number for every new order
DROP TRIGGER IF EXISTS trg_order_number ON orders;
CREATE TRIGGER trg_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Backfill only orders that don't have order_number yet
DO $$
DECLARE
  rec RECORD;
  max_num int;
BEGIN
  -- Get current max number from existing order_numbers
  SELECT COALESCE(
    (SELECT MAX(SUBSTRING(order_number FROM 4)::int) FROM orders WHERE order_number LIKE 'EV-%'),
    0
  ) INTO max_num;

  FOR rec IN SELECT id FROM orders WHERE order_number IS NULL ORDER BY created_at ASC LOOP
    max_num := max_num + 1;
    UPDATE orders SET order_number = 'EV-' || lpad(max_num::text, 6, '0') WHERE id = rec.id;
  END LOOP;

  PERFORM setval('order_number_seq', max_num + 1);
END $$;
