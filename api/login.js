export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || '').toLowerCase().trim();
    const rawPassword = String(password || '');

    if (!cleanEmail || !rawPassword) {
      return res.status(400).json({ success: false, message: 'Wprowadź email i hasło.' });
    }

    // STRICT AUTHENTICATION: Check exact credentials
    if (cleanEmail === 'rvwshield@gmail.com' && rawPassword === 'halo2026AI') {
      return res.status(200).json({
        success: true,
        session: {
          email: cleanEmail,
          role: 'superadmin',
          token: 'halo_auth_token_' + Date.now(),
          loggedAt: new Date().toISOString()
        }
      });
    }

    // STRICT REJECTION: Reject any invalid password or unregistered user
    return res.status(401).json({
      success: false,
      message: 'Nieprawidłowy adres email lub hasło.'
    });

  } catch (err) {
    console.error('Server error in /api/login:', err);
    return res.status(500).json({ success: false, message: 'Błąd serwera podczas weryfikacji.' });
  }
}
