import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Use the powerful SERVICE_KEY for backend operations. This is secure.
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ success: false, message: 'Server configuration error: Missing Supabase credentials.' });
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    // The service role key bypasses RLS, so this will now succeed.
    const { data, error } = await supabase
      .from('users')
      .insert([{ email: email, license_type: 'trial' }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(200).json({ success: true, message: 'Email already registered.', status: 'trial' });
      }
      throw error;
    }
    return res.status(200).json({ success: true, status: 'trial' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
