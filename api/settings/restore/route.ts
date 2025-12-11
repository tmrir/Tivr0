import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

export async function POST(request: Request) {
  const baseHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  try {
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('site_settings')
      .select('default_snapshot')
      .eq('id', 1)
      .single();

    if (fetchError || !current?.default_snapshot) {
      console.error('❌ [API] Supabase Fetch Snapshot Error:', fetchError);
      return NextResponse.json(
        { ok: false, error: fetchError?.message || 'No snapshot found' },
        { status: 500, headers: baseHeaders }
      );
    }

    const { data, error: restoreError } = await supabaseAdmin
      .from('site_settings')
      .upsert({ id: 1, ...current.default_snapshot })
      .select()
      .single();

    if (restoreError) {
      console.error('❌ [API] Supabase Restore Error:', restoreError);
      return NextResponse.json(
        { ok: false, error: restoreError.message, details: restoreError },
        { status: 500, headers: baseHeaders }
      );
    }

    return NextResponse.json({ ok: true, data }, { status: 200, headers: baseHeaders });
  } catch (err: any) {
    console.error('❌ [API] Fatal Restore Error:', err);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal Server Error',
        message: err.message || 'Unknown error',
      },
      { status: 500, headers: baseHeaders }
    );
  }
}
