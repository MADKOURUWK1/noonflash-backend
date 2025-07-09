import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // This handles the browser's preflight check
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
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
      if (error.code === '23505') { // Email already exists
        return res.status(200).json({ success: true, message: 'Email already registered.' });
      }
      throw error;
    }

    // Add CORS headers to the actual response
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ success: true, status: 'trial' });
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ success: false, message: error.message });
  }
}
