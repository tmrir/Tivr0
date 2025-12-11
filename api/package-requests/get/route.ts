import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabaseAdmin';
import { corsHeaders } from '../../utils/cors';

if (!supabaseAdmin) {
  console.error('Supabase Admin is undefined');
}

export async function OPTIONS() {
  return new NextResponse('ok', { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('package_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch package requests' },
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transformedData = (data || []).map((item: any) => ({
      id: item.id,
      customerName: item.customer_name,
      phoneNumber: item.phone_number,
      email: item.email,
      packageName: item.package_name,
      packageId: item.package_id,
      status: item.status,
      createdAt: item.created_at,
      notes: item.notes,
    }));

    return NextResponse.json(
      { success: true, data: transformedData },
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
