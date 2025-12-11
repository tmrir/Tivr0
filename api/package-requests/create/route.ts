import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabaseAdmin';
import { corsHeaders } from '../../utils/cors';

if (!supabaseAdmin) {
  console.error('Supabase Admin is undefined');
}

export async function OPTIONS() {
  return new NextResponse('ok', { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const { customerName, phoneNumber, email, packageName, packageId, status = 'pending' } = await request
      .json()
      .catch(() => ({} as any));

    if (!customerName || !phoneNumber || !email || !packageName || !packageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('package_requests')
      .insert({
        customer_name: customerName,
        phone_number: phoneNumber,
        email: email,
        package_name: packageName,
        package_id: packageId,
        status: status,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create package request' },
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: data.id,
          customerName: data.customer_name,
          phoneNumber: data.phone_number,
          email: data.email,
          packageName: data.package_name,
          packageId: data.package_id,
          status: data.status,
          createdAt: data.created_at,
        },
      },
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
