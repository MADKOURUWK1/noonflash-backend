import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Vercel will provide these values from your settings
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Allow requests from any origin (for your extension)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('license_type')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(404).json({ license: 'not_found' });
    }

    return res.status(200).json({ license: data.license_type });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}