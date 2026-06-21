import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('section_key', key)
      .single();

    if (error || !data) {
      return NextResponse.json({ content: null });
    }

    return NextResponse.json({ content: data.content });
  } catch {
    return NextResponse.json({ content: null });
  }
}
