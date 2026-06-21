-- Create refunds table
CREATE TABLE refunds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  amount NUMERIC(10,2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  admin_notes TEXT,
  rejection_reason TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add refund_status to orders
ALTER TABLE orders ADD COLUMN refund_status TEXT DEFAULT 'none' CHECK (refund_status IN ('none', 'refund_requested', 'refund_approved', 'refund_rejected', 'refund_processed'));

-- Indexes
CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_user_id ON refunds(user_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_orders_refund_status ON orders(refund_status);

-- RLS policies
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Customers can read their own refunds
CREATE POLICY "Customers can read own refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Customers can insert their own refunds
CREATE POLICY "Customers can insert own refunds"
  ON refunds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all refunds
CREATE POLICY "Admins can read all refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all refunds
CREATE POLICY "Admins can update all refunds"
  ON refunds FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete refunds
CREATE POLICY "Admins can delete refunds"
  ON refunds FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update order refund_status
CREATE POLICY "Admins can update order refund status"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow authenticated users to update their own order refund_status (for inserting refund request)
CREATE POLICY "Users can update own order refund status"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
