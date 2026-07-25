import crypto from 'crypto';

export default async function handler(req, res) {
  // Set CORS headers so frontend can call it cleanly
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'haloai-7b69d';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    let token = null;
    if (clientEmail && privateKey) {
      try {
        const now = Math.floor(Date.now() / 1000);
        const header = { alg: 'RS256', typ: 'JWT' };
        const payload = {
          iss: clientEmail,
          scope: 'https://www.googleapis.com/auth/datastore',
          aud: 'https://oauth2.googleapis.com/token',
          exp: now + 3600,
          iat: now
        };

        const b64 = (s) => Buffer.from(typeof s === 'string' ? s : JSON.stringify(s)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        const signInput = `${b64(header)}.${b64(payload)}`;

        const signer = crypto.createSign('RSA-SHA256');
        signer.update(signInput);
        const signature = b64(signer.sign(privateKey));
        const jwt = `${signInput}.${signature}`;

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          token = tokenData.access_token;
        } else {
          console.error('Google token error:', await tokenRes.text());
        }
      } catch (tokenErr) {
        console.error('JWT Token generation error:', tokenErr);
      }
    }

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/bookings`;
    const response = await fetch(firestoreUrl, { headers });

    if (!response.ok) {
      console.error('Firestore GET error:', await response.text());
      return res.status(200).json({ success: true, bookings: [] });
    }

    const data = await response.json();
    const docs = (data.documents || []).map(doc => {
      const fields = doc.fields || {};
      return {
        id: fields.bookingId?.stringValue || doc.name.split('/').pop(),
        name: fields.name?.stringValue || 'Brak imienia',
        phone: fields.phone?.stringValue || 'Brak telefonu',
        service: fields.service?.stringValue || 'Usługa podstawowa',
        datetime: fields.datetime?.stringValue || 'Nieokreślony czas',
        status: fields.status?.stringValue || 'confirmed',
        action: fields.action?.stringValue || 'CREATED',
        createdAt: fields.createdAt?.stringValue || new Date().toISOString()
      };
    });

    docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ success: true, bookings: docs });
  } catch (err) {
    console.error('Error in admin-bookings API:', err);
    return res.status(500).json({ error: 'Internal server error', bookings: [] });
  }
}
