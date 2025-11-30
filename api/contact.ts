import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../services/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone } = req.body;

    // Validate input
    if (!name || !phone) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: !name ? 'Name is required' : 'Phone is required'
      });
    }

    // Sanitize input
    const sanitizedName = name.trim().substring(0, 200);
    const sanitizedPhone = phone.trim().substring(0, 50);

    if (sanitizedName.length === 0 || sanitizedPhone.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: 'Name and phone cannot be empty'
      });
    }

    // Save to database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: sanitizedName,
          phone: sanitizedPhone,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Failed to save message',
        details: error.message
      });
    }

    // Return success response
    res.status(200).json({ 
      success: true,
      message: 'Contact form submitted successfully',
      data: data?.[0]
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
