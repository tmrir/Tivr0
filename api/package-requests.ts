import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabaseAdmin } from './utils/supabaseAdmin.ts'
import { corsHeaders } from './utils/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { customerName, phoneNumber, email, packageName, packageId, status = 'pending' } = await req.json()

    // Validate required fields
    if (!customerName || !phoneNumber || !email || !packageName || !packageId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert the package request
    const { data, error } = await supabaseAdmin
      .from('package_requests')
      .insert({
        customer_name: customerName,
        phone_number: phoneNumber,
        email: email,
        package_name: packageName,
        package_id: packageId,
        status: status
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create package request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          id: data.id,
          customerName: data.customer_name,
          phoneNumber: data.phone_number,
          email: data.email,
          packageName: data.package_name,
          packageId: data.package_id,
          status: data.status,
          createdAt: data.created_at
        }
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
