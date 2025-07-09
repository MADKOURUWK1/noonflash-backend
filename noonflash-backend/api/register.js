import { createClient } from '@supabase/supabase-js';

// Defensive check to ensure environment variables are loaded
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('CRITICAL: SUPABASE_URL or SUPABASE_KEY environment variables are not set!');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  // Set CORS headers for all responses from this function
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    // This is the real logic to insert the user into the database
    const { data, error } = await supabase
      .from('users')
      .insert([{ email: email, license_type: 'trial' }])
      .select()
      .single();

    if (error) {
      // If the email already exists, it's still a "success" for the user
      if (error.code === '23505') {
        return res.status(200).json({ success: true, message: 'Email already registered.', status: 'trial' });
      }
      // For other database errors, throw them to be caught below
      throw error;
    }

    return res.status(200).json({ success: true, status: 'trial' });

  } catch (error) {
    // If anything in the 'try' block fails, send a server error response
    return res.status(500).json({ success: false, message: error.message });
  }
}
