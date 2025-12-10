import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabaseAdmin } from '../utils/supabaseAdmin.ts'
import { corsHeaders } from '../utils/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get all package requests
    const { data, error } = await supabaseAdmin
      .from('package_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch package requests' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform data to match frontend format
    const transformedData = data.map(item => ({
      id: item.id,
      customerName: item.customer_name,
      phoneNumber: item.phone_number,
      email: item.email,
      packageName: item.package_name,
      packageId: item.package_id,
      status: item.status,
      createdAt: item.created_at,
      notes: item.notes
    }))

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: transformedData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
