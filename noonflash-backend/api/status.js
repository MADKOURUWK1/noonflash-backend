import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }

    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('license_type, trial_expires_at')
            .eq('email', email)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        
        // --- NEW LOGIC TO CHECK TRIAL EXPIRY ---
        let finalLicense = data.license_type;

        if (data.license_type === 'trial') {
            const now = new Date();
            const expiryDate = new Date(data.trial_expires_at);

            // If the trial has expired, change the status to 'expired'
            if (now > expiryDate) {
                finalLicense = 'expired'; 
            }
        }
        // --- END OF NEW LOGIC ---

        res.status(200).json({ success: true, license: finalLicense });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
