import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User already exists.' });
        }
        
        // --- NEW LOGIC TO ADD EXPIRY DATE ---
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 3); // 3 days from now
        // --- END OF NEW LOGIC ---

        const { data, error } = await supabase
            .from('users')
            .insert({
                email: email,
                license_type: 'trial',
                trial_expires_at: trialEndDate.toISOString() // Add the expiry date on creation
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json({ success: true, message: 'User registered successfully for a trial.', user: data });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
