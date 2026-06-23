-- Allow guest checkout: orders INSERT policy
-- Old policy required auth.uid() = user_id, which blocks guest orders (user_id IS NULL)
DROP POLICY IF EXISTS "Allow users to create their own orders" ON public.orders;

CREATE POLICY "Allow users to create their own orders" ON public.orders
  FOR insert WITH CHECK (
    auth.uid() = user_id
    OR (user_id IS NULL AND customer_email IS NOT NULL)
  );

-- Allow guest order tracking: orders SELECT policy
-- Guests can't auth, so we need to allow reading orders where user_id IS NULL
-- The trackOrder action validates email at the app level
DROP POLICY IF EXISTS "Allow users to view their own orders" ON public.orders;

CREATE POLICY "Allow users to view their own orders" ON public.orders
  FOR select USING (
    auth.uid() = user_id
    OR user_id IS NULL
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Allow guest order_items INSERT: parent order may have user_id IS NULL
DROP POLICY IF EXISTS "Allow users to insert order items" ON public.order_items;

CREATE POLICY "Allow users to insert order items" ON public.order_items
  FOR insert WITH check (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );
