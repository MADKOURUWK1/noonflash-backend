import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // --- CORS PREFLIGHT HANDLING ---
  // This is the important part. It explicitly handles the OPTIONS request.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- END CORS PREFLIGHT HANDLING ---
  
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

    return res.status(200).json({ success: true, status: 'trial' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
