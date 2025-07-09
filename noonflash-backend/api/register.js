import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Vercel will provide these values from your settings
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Allow requests from any origin (for your extension)
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
    const { data, error } = await supabase
      .from('users')
      .insert([{ email: email, license_type: 'trial' }])
      .select()
      .single();

    if (error) {
      // 23505 is the error code for a unique constraint violation (email already exists)
      if (error.code === '23505') {
        return res.status(200).json({ success: true, message: 'Email already registered.' });
      }
      throw error;
    }

    return res.status(200).json({ success: true, status: 'trial' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}