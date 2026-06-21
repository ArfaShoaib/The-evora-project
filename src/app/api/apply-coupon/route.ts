import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { coupon_id } = await request.json();

    if (!coupon_id) {
      return NextResponse.json(
        { success: false, error: 'coupon_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Increment used_count atomically
    const { data: coupon, error: fetchError } = await supabase
      .from('coupons')
      .select('used_count, usage_limit')
      .eq('id', coupon_id)
      .single();

    if (fetchError || !coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json(
        { success: false, error: 'Coupon usage limit reached' },
        { status: 409 }
      );
    }

    const { error: updateError } = await supabase
      .from('coupons')
      .update({ used_count: coupon.used_count + 1 })
      .eq('id', coupon_id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
