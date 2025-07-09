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
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, licenseKey } = req.body;
  if (!email || !licenseKey) {
    return res.status(400).json({ message: 'Email and license key are required.' });
  }

  try {
    // The service role key bypasses all RLS policies.
    const { data, error } = await supabase
      .from('users')
      .select('license_type')
      .eq('email', email)
      .eq('license_key', licenseKey)
      .eq('license_type', 'full')
      .single();

    if (error || !data) {
      // If no matching user is found, it's an invalid key/email combo.
      return res.status(404).json({ success: false, message: 'Invalid email or license key.' });
    }

    // If a match is found, activation is successful!
    return res.status(200).json({ success: true, status: 'full' });
    
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
