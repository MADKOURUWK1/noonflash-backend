import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, licenseKey } = req.body;
  if (!email || !licenseKey) {
    return res.status(400).json({ message: 'Email and license key are required.' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('license_type')
      .eq('email', email)
      .eq('license_key', licenseKey)
      .eq('license_type', 'full')
      .single();

    if (error || !data) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(404).json({ success: false, message: 'Invalid email or license key.' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ success: true, status: 'full' });
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ success: false, message: error.message });
  }
}
